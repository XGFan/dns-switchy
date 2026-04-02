package main

import (
	"context"
	"embed"
	"io/fs"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
	"time"

	"encoding/json"
	"errors"
	"fmt"
	"log"

	"dns-switchy/config"
	"dns-switchy/resolver"
	"dns-switchy/util"

	"github.com/miekg/dns"
)

//go:embed all:web/dist
var webFS embed.FS

func ReadConfig(file *string) (*config.SwitchyConfig, error) {
	log.Printf("Config: %s", *file)
	open, err := os.Open(*file)
	if err != nil {
		return nil, err
	}
	//goland:noinspection GoUnhandledErrorResult
	defer open.Close()
	config.BasePath = filepath.Dir(open.Name())
	return config.ParseConfig(open)
}

func printRuntimeInfo() {
	executable, e := os.Executable()
	if e == nil {
		log.Printf("Executable Path: %s", executable)
	}
	wd, e := os.Getwd()
	if e == nil {
		log.Printf("Working Path: %s", wd)
	}
}

type DnsSwitchyServer struct {
	config     *config.SwitchyConfig
	udpServer  *dns.Server
	httpServer *http.Server
	resolvers  []resolver.DnsResolver
	dnsCache   util.Cache
	shutdown   bool
	wg         sync.WaitGroup
}

func (s *DnsSwitchyServer) Shutdown() {
	log.Println("Shutdown server")
	if s.udpServer != nil {
		_ = s.udpServer.Shutdown()
	}
	if s.httpServer != nil {
		_ = s.httpServer.Shutdown(context.Background())
	}
	for _, dnsResolver := range s.resolvers {
		dnsResolver.Close()
	}
	s.wg.Wait()
}

func (s *DnsSwitchyServer) Start() {
	printRuntimeInfo()
	log.Printf("Started at %s\nHTTP: %s\nTTL: %s\nResolvers: %s", s.config.Addr, s.config.Http, s.config.TTL, s.resolvers)
	s.udpServer = &dns.Server{
		Net:       "udp",
		Addr:      s.config.Addr,
		Handler:   s.plainUDPHandler(),
		ReusePort: true,
		ReuseAddr: true,
	}
	s.wg.Add(1)
	go s.StartPlainUDPServer()
	if s.config.Http != nil {
		s.httpServer = &http.Server{Handler: s.httpMux()}
		s.wg.Add(1)
		go s.StartHttpServer()
	}
}

func (s *DnsSwitchyServer) StartPlainUDPServer() {
	defer s.wg.Done()
	retry(s.udpServer.ListenAndServe)
}

func (s *DnsSwitchyServer) StartHttpServer() {
	defer s.wg.Done()
	if s.httpServer == nil || s.config.Http == nil {
		return
	}
	retry(func() error {
		listener, err := s.config.Http.CreateListener()
		if err != nil {
			return err
		}
		err = s.httpServer.Serve(listener)
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	})
}

func (s *DnsSwitchyServer) plainUDPHandler() dns.HandlerFunc {
	return func(writer dns.ResponseWriter, msg *dns.Msg) {
		s.dnsMsgHandler(&DnsWriter{writer, msg, time.Now().UnixMilli()}, msg)
	}
}

func (s *DnsSwitchyServer) httpMux() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/query", s.apiQueryHandler)
	mux.Handle("/", spaHandler())
	return mux
}

func (s *DnsSwitchyServer) apiQueryHandler(w http.ResponseWriter, r *http.Request) {
	queryType := r.URL.Query().Get("type")
	if queryType == "" {
		queryType = "A"
	}
	queryTypeValue, ok := dns.StringToType[strings.ToUpper(queryType)]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("Invalid type"))
		return
	}
	question := r.URL.Query().Get("question")
	if question == "" {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("Missing question"))
		return
	}
	m := new(dns.Msg)
	m.Question = append(m.Question, dns.Question{Name: dns.Fqdn(question), Qtype: queryTypeValue, Qclass: dns.ClassINET})
	s.resolveOnly(&HttpWriter{w, m, time.Now().UnixMilli()}, m)
}

func spaHandler() http.Handler {
	subFS, err := fs.Sub(webFS, "web/dist")
	if err != nil {
		log.Printf("embed web/dist: %v", err)
		return http.NotFoundHandler()
	}
	fileServer := http.FileServer(http.FS(subFS))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path != "/" {
			cleanPath := strings.TrimPrefix(path, "/")
			if f, err := fs.Stat(subFS, cleanPath); err == nil && !f.IsDir() {
				fileServer.ServeHTTP(w, r)
				return
			}
		}
		r.URL.Path = "/"
		fileServer.ServeHTTP(w, r)
	})
}

func (s *DnsSwitchyServer) dnsMsgHandler(resultWriter ResultWriter, msg *dns.Msg) {
	if checkAndUnify(msg) != nil {
		if msg == nil {
			log.Printf("[%s] send invalid nil msg", resultWriter.RemoteAddr())
		} else {
			log.Printf("[%s] send invalid msg [%s]", resultWriter.RemoteAddr(), msg.String())
		}
		resultWriter.Rcode(dns.RcodeFormatError)
		return
	}
	if cached := s.dnsCache.Get(msg.Question[0]); !reflect.DeepEqual(cached, util.None) {
		resultWriter.Success("dnsCache", &cached)
		return
	}
	s.resolveOnly(resultWriter, msg)
}

func (s *DnsSwitchyServer) resolveOnly(resultWriter ResultWriter, msg *dns.Msg) {
	if checkAndUnify(msg) != nil {
		if msg == nil {
			log.Printf("[%s] send invalid nil msg", resultWriter.RemoteAddr())
		} else {
			log.Printf("[%s] send invalid msg [%s]", resultWriter.RemoteAddr(), msg.String())
		}
		resultWriter.Rcode(dns.RcodeFormatError)
		return
	}
	for i, upstream := range s.resolvers {
		if upstream.Accept(msg) {
			resp, err := upstream.Resolve(msg)
			if err != nil {
				if errors.Is(err, resolver.BreakError) {
					resultWriter.Fail(upstream, err)
					return
				}
				if i < len(s.resolvers)-1 {
					continue
				} else {
					resultWriter.Fail(upstream, err)
				}
			} else {
				if resp.Rcode == dns.RcodeSuccess && len(resp.Answer) > 0 {
					s.dnsCache.Set(msg.Question[0], *resp, upstream.TTL())
				}
				resultWriter.Success(upstream, resp)
			}
			return
		}
	}
	resultWriter.Rcode(dns.RcodeRefused)
}

func Create(conf *config.SwitchyConfig) (*DnsSwitchyServer, error) {
	resolvers, err := resolver.CreateResolvers(conf)
	if err != nil {
		return nil, err
	}
	if conf.TTL == 0 {
		conf.TTL = calcTTL(resolvers)
	}
	return &DnsSwitchyServer{
		config:    conf,
		resolvers: resolvers,
		dnsCache:  util.NewDnsCache(conf.TTL),
		wg:        sync.WaitGroup{},
	}, nil
}

func retry(listenFunc func() error) {
	for i := 1; i <= 3; i++ {
		err := listenFunc()
		if err != nil {
			log.Printf("Retry fail: %v", err)
			time.Sleep(time.Duration(i) * time.Second)
		} else {
			break
		}
	}
}

func calcTTL(resolvers []resolver.DnsResolver) time.Duration {
	minTTL := time.Duration(0)
	for _, res := range resolvers {
		if res.TTL() > 0 && (minTTL > res.TTL() || minTTL == 0) {
			minTTL = res.TTL()
		}
	}
	return minTTL
}

type ResultWriter interface {
	RemoteAddr() net.Addr
	Success(name interface{}, resp *dns.Msg)
	Fail(name interface{}, err error)
	Rcode(rcode int)
}

type DnsWriter struct {
	writer dns.ResponseWriter
	msg    *dns.Msg
	start  int64
}

type HttpWriter struct {
	writer http.ResponseWriter
	msg    *dns.Msg
	start  int64
}

type FakeAddr struct {
}

func (f FakeAddr) Network() string {
	return "http"
}

func (f FakeAddr) String() string {
	return "api"
}

func (a *HttpWriter) RemoteAddr() net.Addr {
	return &FakeAddr{}
}

func (a *HttpWriter) Success(name interface{}, resp *dns.Msg) {
	a.writer.Header().Set("content-type", "application/json")
	_ = json.NewEncoder(a.writer).Encode(map[string]interface{}{
		"resolver": fmt.Sprintf("%s", name),
		"answer":   resp,
	})
}

func (a *HttpWriter) Fail(name interface{}, err error) {
	a.writer.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(a.writer).Encode(map[string]interface{}{
		"resolver": fmt.Sprintf("%s", name),
		"error":    err,
	})
}

func (a *HttpWriter) Rcode(rcode int) {
	resp := new(dns.Msg)
	if a.msg != nil {
		resp.SetRcode(a.msg, rcode)
	} else {
		resp.Rcode = rcode
	}
	a.Success("policy", resp)
}

func (w *DnsWriter) RemoteAddr() net.Addr {
	return w.writer.RemoteAddr()
}

func (w *DnsWriter) Success(name interface{}, resp *dns.Msg) {
	remoteAddr := w.writer.RemoteAddr().String()
	structureLog := StructureLog{
		Resolver:   fmt.Sprintf("%s", name),
		Remote:     remoteAddr[:strings.LastIndex(remoteAddr, ":")],
		Time:       time.Now().UnixMilli() - w.start,
		Type:       dns.TypeToString[w.msg.Question[0].Qtype],
		Question:   w.msg.Question[0].Name,
		RCode:      dns.RcodeToString[resp.Rcode],
		AnswerSize: len(resp.Answer),
	}
	_ = json.NewEncoder(log.Writer()).Encode(structureLog)
	writeResp := resp.Copy()
	writeResp.Id = w.msg.Id
	writeResp.Opcode = w.msg.Opcode
	if writeResp.Opcode == dns.OpcodeQuery {
		writeResp.RecursionDesired = w.msg.RecursionDesired // Copy rd bit
		writeResp.CheckingDisabled = w.msg.CheckingDisabled // Copy cd bit
	}
	writeResp.Truncate(w.udpSize())
	_ = w.writer.WriteMsg(writeResp)
}

func (w *DnsWriter) udpSize() int {
	if opt := w.msg.IsEdns0(); opt != nil && opt.UDPSize() > 0 {
		return int(opt.UDPSize())
	}
	return 512
}

func (w *DnsWriter) Fail(name interface{}, err error) {
	remoteAddr := w.writer.RemoteAddr().String()
	structureLog := StructureLog{
		Resolver: fmt.Sprintf("%s", name),
		Remote:   remoteAddr[:strings.LastIndex(remoteAddr, ":")],
		Time:     time.Now().UnixMilli() - w.start,
		Type:     dns.TypeToString[w.msg.Question[0].Qtype],
		Question: w.msg.Question[0].Name,
		Error:    err,
	}
	_ = json.NewEncoder(log.Writer()).Encode(structureLog)
	resp := new(dns.Msg)
	resp.SetRcode(w.msg, dns.RcodeServerFailure)
	_ = w.writer.WriteMsg(resp)
}

func (w *DnsWriter) Rcode(rcode int) {
	resp := new(dns.Msg)
	if w.msg != nil {
		resp.SetRcode(w.msg, rcode)
	} else {
		resp.Rcode = rcode
	}
	_ = w.writer.WriteMsg(resp)
}

func checkAndUnify(msg *dns.Msg) error {
	if msg == nil {
		return errors.New("invalid nil msg")
	}
	if len(msg.Question) != 1 {
		return fmt.Errorf("invalid question %v", msg.Question)
	}
	msg.Question[0].Name = strings.ToLower(dns.Fqdn(msg.Question[0].Name))
	return nil
}

type StructureLog struct {
	Resolver   string `json:"resolver,omitempty"`
	Remote     string `json:"remote,omitempty"`
	Time       int64  `json:"time,omitempty"`
	Type       string `json:"type,omitempty"`
	Question   string `json:"question,omitempty"`
	RCode      string `json:"rCode,omitempty"`
	AnswerSize int    `json:"answerSize"`
	Error      error  `json:"error,omitempty"`
}

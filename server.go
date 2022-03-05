package main

import (
	"context"
	"dns-switchy/config"
	"dns-switchy/resolver"
	"dns-switchy/util"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/miekg/dns"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

func ReadConfig(file *string) (*config.SwitchyConfig, error) {
	log.Printf("Config: %s", *file)
	open, err := os.Open(*file)
	if err != nil {
		return nil, err
	}
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

type DnsServer struct {
	config    *config.SwitchyConfig
	nsServer  *dns.Server
	apiServer *http.Server
	resolvers []resolver.DnsResolver
	dnsCache  util.Cache
	shutdown  bool
	wg        sync.WaitGroup
}

func (s *DnsServer) Shutdown() {
	log.Println("Shutdown server")
	if s.nsServer != nil {
		_ = s.nsServer.Shutdown()
	}
	if s.apiServer != nil {
		_ = s.apiServer.Shutdown(context.Background())
	}
	for _, dnsResolver := range s.resolvers {
		dnsResolver.Close()
	}
	s.dnsCache.Close()
	s.wg.Wait()
}

func (s *DnsServer) Start() {
	printRuntimeInfo()
	log.Printf("Started at %d\nHTTP: %s\nTTL: %s\nResolvers: %s", s.config.Port, s.config.Http, s.config.TTL, s.resolvers)
	go s.StartNs()
	go s.StartHttp()
	s.wg.Wait()
}
func (s *DnsServer) StartNs() {
	s.wg.Add(1)
	defer s.wg.Done()
	s.nsServer = &dns.Server{
		Net:     "udp",
		Addr:    fmt.Sprintf(":%d", s.config.Port),
		Handler: s.nsHandler(),
	}
	retry(s.nsServer.ListenAndServe)
}
func (s *DnsServer) StartHttp() {
	s.wg.Add(1)
	defer s.wg.Done()
	s.apiServer = &http.Server{
		Handler: s.apiHandler(),
	}
	if s.config.Http == nil {
		return
	}
	retry(func() error {
		listener, err := s.config.Http.CreateListener()
		if err != nil {
			return err
		}
		err = s.apiServer.Serve(listener)
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	})
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

func (s *DnsServer) dnsHandler(resultWriter ResultWriter, msg *dns.Msg) {
	if checkAndUnify(msg) != nil {
		log.Printf("[%s] send invalid msg [%s]", resultWriter.RemoteAddr(), msg.String())
	}
	if cached := s.dnsCache.Get(&msg.Question[0]); cached != nil {
		resultWriter.Success(s.dnsCache, cached)
		return
	} else {
		for i, upstream := range s.resolvers {
			if upstream.Accept(msg) {
				resp, err := upstream.Resolve(msg)
				if err != nil {
					if i < len(s.resolvers)-1 {
						continue
					} else {
						resultWriter.Fail(upstream, err)
					}
				} else {
					if resp.Rcode == dns.RcodeSuccess {
						s.dnsCache.Set(&msg.Question[0], resp, upstream.TTL())
					}
					resultWriter.Success(upstream, resp)
				}
				return
			}
		}
	}
}

func (s *DnsServer) nsHandler() dns.HandlerFunc {
	return func(writer dns.ResponseWriter, msg *dns.Msg) {
		s.dnsHandler(&NsWriter{writer, msg, time.Now().UnixMilli()}, msg)
	}
}

func (s *DnsServer) apiHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		queryType := r.URL.Query().Get("type")
		if queryType == "" {
			queryType = "A"
		}
		question := r.URL.Query().Get("question")
		if question == "" {
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte("Missing question"))
			return
		}
		m := new(dns.Msg)
		m.Question = append(m.Question, dns.Question{Name: question, Qtype: dns.StringToType[queryType], Qclass: dns.ClassINET})
		s.dnsHandler(&ApiWriter{w, m, time.Now().UnixMilli()}, m)
	})
}

func Create(conf *config.SwitchyConfig) (*DnsServer, error) {
	resolvers, err := resolver.CreateResolvers(conf)
	if err != nil {
		return nil, err
	}
	if conf.TTL == 0 {
		conf.TTL = calcTTL(resolvers)
	}
	return &DnsServer{
		config:    conf,
		resolvers: resolvers,
		dnsCache:  util.NewDnsCache(conf.TTL),
		wg:        sync.WaitGroup{},
	}, nil
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
}

type NsWriter struct {
	writer dns.ResponseWriter
	msg    *dns.Msg
	start  int64
}

type ApiWriter struct {
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

func (a *ApiWriter) RemoteAddr() net.Addr {
	return &FakeAddr{}
}

func (a *ApiWriter) Success(name interface{}, resp *dns.Msg) {
	a.writer.Header().Set("content-type", "application/json")
	_ = json.NewEncoder(a.writer).Encode(map[string]interface{}{
		"resolver": name,
		"answer":   resp,
	})
}

func (a *ApiWriter) Fail(name interface{}, err error) {
	a.writer.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(a.writer).Encode(map[string]interface{}{
		"resolver": name,
		"error":    err,
	})
}

func (w *NsWriter) RemoteAddr() net.Addr {
	return w.writer.RemoteAddr()
}

func (w *NsWriter) Success(name interface{}, resp *dns.Msg) {
	remoteAddr := w.writer.RemoteAddr().String()
	structureLog := StructureLog{
		Resolver: fmt.Sprintf("%s", name),
		Remote:   remoteAddr[:strings.LastIndex(remoteAddr, ":")],
		Time:     time.Now().UnixMilli() - w.start,
		Question: fmt.Sprintf("%s %s", dns.TypeToString[w.msg.Question[0].Qtype], w.msg.Question[0].Name),
	}
	_ = json.NewEncoder(log.Writer()).Encode(structureLog)
	resp.Id = w.msg.Id
	resp.Opcode = w.msg.Opcode
	if resp.Opcode == dns.OpcodeQuery {
		resp.RecursionDesired = w.msg.RecursionDesired // Copy rd bit
		resp.CheckingDisabled = w.msg.CheckingDisabled // Copy cd bit
	}
	_ = w.writer.WriteMsg(resp)
}

func (w *NsWriter) Fail(name interface{}, err error) {
	remoteAddr := w.writer.RemoteAddr().String()
	structureLog := StructureLog{
		Resolver: fmt.Sprintf("%s", name),
		Remote:   remoteAddr[:strings.LastIndex(remoteAddr, ":")],
		Time:     time.Now().UnixMilli() - w.start,
		Question: fmt.Sprintf("%s %s", dns.TypeToString[w.msg.Question[0].Qtype], w.msg.Question[0].Name),
		Error:    err,
	}
	_ = json.NewEncoder(log.Writer()).Encode(structureLog)
	resp := new(dns.Msg)
	resp.SetRcode(w.msg, dns.RcodeServerFailure)
	_ = w.writer.WriteMsg(resp)
}

func checkAndUnify(msg *dns.Msg) error {
	if len(msg.Question) != 1 {
		return errors.New(fmt.Sprintf("invalid question %v", msg.Question))
	}
	question := msg.Question[0]
	question.Name = strings.ToLower(question.Name)
	return nil
}

type StructureLog struct {
	Resolver string `json:"resolver,omitempty"`
	Remote   string `json:"remote,omitempty"`
	Time     int64  `json:"time,omitempty"`
	Question string `json:"question,omitempty"`
	Error    error  `json:"error,omitempty"`
}

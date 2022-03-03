package main

import (
	"dns-switchy/config"
	"dns-switchy/resolver"
	"dns-switchy/util"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/miekg/dns"
	"log"
	"os"
	"path/filepath"
	"strings"
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

type DnsServer struct {
	config *config.SwitchyConfig
	*dns.Server
	resolvers []resolver.DnsResolver
	dnsCache  util.Cache
	shutdown  bool
}

func (s *DnsServer) Shutdown() {
	log.Println("Shutdown server")
	_ = s.Server.Shutdown()
	for _, dnsResolver := range s.resolvers {
		dnsResolver.Close()
	}
	s.dnsCache.Close()
	s.shutdown = true
}

func (s *DnsServer) Run() {
	executable, e := os.Executable()
	if e == nil {
		log.Printf("Executable Path: %s", executable)
	}
	wd, e := os.Getwd()
	if e == nil {
		log.Printf("Working Path: %s", wd)
	}
	log.Printf("Started at %d, TTL: %s with %s", s.config.Port, s.config.TTL, s.resolvers)
	for i := 1; i <= 3; i++ {
		err := s.Server.ListenAndServe()
		if s.shutdown {
			return
		} else {
			if err != nil {
				log.Println(err)
				time.Sleep(time.Duration(i) * time.Second)
			} else {
				return
			}
		}
	}
}

func Create(conf *config.SwitchyConfig) (*DnsServer, error) {
	server := dns.Server{Net: "udp", Addr: fmt.Sprintf(":%d", conf.Port)}
	resolvers, err := resolver.CreateResolvers(conf)
	if err != nil {
		return nil, err
	}
	if conf.TTL == 0 {
		conf.TTL = calcTTL(resolvers)
	}
	dnsCache := util.NewDnsCache(conf.TTL)
	dns.HandleFunc(".", func(writer dns.ResponseWriter, msg *dns.Msg) {
		if checkAndUnify(msg) != nil {
			log.Printf("[%s] send invalid msg [%s]", writer.RemoteAddr(), msg.String())
		}
		wrapWriter := warp(writer, msg)
		go func() {
			if cached := dnsCache.Get(&msg.Question[0]); cached != nil {
				wrapWriter.success(dnsCache, cached)
				return
			} else {
				for i, upstream := range resolvers {
					if upstream.Accept(msg) {
						resp, err := upstream.Resolve(msg)
						if err != nil {
							if i < len(resolvers)-1 {
								continue
							} else {
								wrapWriter.fail(upstream, err)
							}
						} else {
							if resp.Rcode == dns.RcodeSuccess {
								dnsCache.Set(&msg.Question[0], resp, upstream.TTL())
							}
							wrapWriter.success(upstream, resp)
						}
						return
					}
				}
			}
		}()
	})
	return &DnsServer{
		config:    conf,
		Server:    &server,
		resolvers: resolvers,
		dnsCache:  dnsCache}, nil
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

type wrapWriter struct {
	writer dns.ResponseWriter
	msg    *dns.Msg
	start  int64
}

func warp(writer dns.ResponseWriter, msg *dns.Msg) *wrapWriter {
	return &wrapWriter{writer, msg, time.Now().UnixMilli()}
}

func (w *wrapWriter) success(name interface{}, resp *dns.Msg) {
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

func (w *wrapWriter) fail(name interface{}, err error) {
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

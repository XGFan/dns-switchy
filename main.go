package main

import (
	"dns-switchy/config"
	"dns-switchy/resolver"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/miekg/dns"
	"gopkg.in/yaml.v2"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func parseConf(file *string) *config.SwitchyConfig {
	log.Printf("Config: %s", *file)
	executable, e := os.Executable()
	if e == nil {
		log.Printf("Executable Path: %s", executable)
	}
	wd, e := os.Getwd()
	if e == nil {
		log.Printf("Working Path: %s", wd)
	}
	open, err := os.Open(*file)
	passOrFatal(err)
	resolver.BasePath = filepath.Dir(open.Name())
	conf := new(config.SwitchyConfig)
	err = yaml.NewDecoder(open).Decode(conf)
	passOrFatal(err)
	return conf
}

type DnsServer struct {
	*dns.Server
	resolvers []resolver.DnsResolver
	dnsCache  resolver.Cache
}

func (s DnsServer) Shutdown() {
	_ = s.Server.Shutdown()
	for _, dnsResolver := range s.resolvers {
		dnsResolver.Close()
	}
	s.dnsCache.Close()
}

func startServer(conf *config.SwitchyConfig) DnsServer {
	server := dns.Server{Net: "udp", Addr: fmt.Sprintf(":%d", conf.Port)}
	resolvers := resolver.Init(conf)
	dnsCache := resolver.NewDnsCache(conf.Cache.TTL, conf.Cache.TTL)
	dnsServer := DnsServer{&server, resolvers, dnsCache}
	log.Printf("Started at %d, with %s", conf.Port, resolvers)
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
				for _, upstream := range resolvers {
					if upstream.Accept(msg) {
						resp, err := upstream.Resolve(msg)
						if err != nil {
							wrapWriter.fail(upstream, err)
						} else {
							if resp.Rcode == dns.RcodeSuccess {
								dnsCache.Set(&msg.Question[0], resp)
							}
							wrapWriter.success(upstream, resp)
						}
						return
					}
				}
			}
		}()
	})
	return dnsServer
}

func main() {
	file := flag.String("c", "config.yaml", "config location")
	ts := flag.Bool("x", false, "show timestamp in log")
	flag.Parse()
	if !*ts {
		log.SetFlags(0)
	}
	var server DnsServer
	watcher, err := fsnotify.NewWatcher()
	if err == nil {
		err = watcher.Add(*file)
		if err == nil {
			log.Printf("Watching %s", *file)
			go func() {
				for {
					select {
					case event, ok := <-watcher.Events:
						if ok && event.Op&fsnotify.Write == fsnotify.Write {
							log.Println("event:", event)
							log.Println("modified file:", event.Name)
							server.Shutdown()
						}
					case err, ok := <-watcher.Errors:
						if !ok {
							return
						}
						log.Println("error:", err)
					}
				}
			}()
		}
	}
	defer watcher.Close()
	for {
		conf := parseConf(file)
		server = startServer(conf)
		err := server.ListenAndServe()
		if err != nil {
			log.Println(err)
		}
	}
}

func checkAndUnify(msg *dns.Msg) error {
	if len(msg.Question) != 1 {
		return errors.New(fmt.Sprintf("invalid question %v", msg.Question))
	}
	question := msg.Question[0]
	question.Name = strings.ToLower(question.Name)
	return nil
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
	json.NewEncoder(log.Writer()).Encode(structureLog)
	resp := new(dns.Msg)
	resp.SetRcode(w.msg, dns.RcodeServerFailure)
	_ = w.writer.WriteMsg(resp)
}

func passOrFatal(e error) {
	if e != nil {
		log.Fatalln(e)
	}
}

type StructureLog struct {
	Resolver string `json:"resolver,omitempty"`
	Remote   string `json:"remote,omitempty"`
	Time     int64  `json:"time,omitempty"`
	Question string `json:"question,omitempty"`
	Error    error  `json:"error,omitempty"`
}

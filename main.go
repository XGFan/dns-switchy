package main

import (
	"dns-switchy/config"
	"dns-switchy/resolver"
	"flag"
	"fmt"
	"github.com/miekg/dns"
	"gopkg.in/yaml.v2"
	"log"
	"os"
)

func main() {
	file := flag.String("c", "config.yaml", "config location")
	flag.Parse()
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
	conf := new(config.SwitchyConfig)
	err = yaml.NewDecoder(open).Decode(conf)
	passOrFatal(err)
	server := dns.Server{Net: "udp", Addr: fmt.Sprintf(":%d", conf.Port)}
	resolvers := resolver.Init(conf)
	log.Printf("Started at %d, with %s", conf.Port, resolvers)
	dns.HandleFunc(".", func(writer dns.ResponseWriter, msg *dns.Msg) {
		go func() {
			for _, upstream := range resolvers {
				if upstream.HandleDns(writer, msg) {
					return
				}
			}
		}()
	})
	passOrFatal(server.ListenAndServe())
}

func passOrFatal(e error) {
	if e != nil {
		log.Fatalln(e)
	}
}

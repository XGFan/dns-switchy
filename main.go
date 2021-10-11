package main

import (
	"fmt"
	"github.com/miekg/dns"
	"gopkg.in/yaml.v2"
	"io"
	"log"
	"os"
)

func main() {
	open, error := os.Open("config.yaml")
	if error != nil {
		log.Fatalln(error)
	}
	all, error := io.ReadAll(open)
	if error != nil {
		log.Fatalln(error)
	}
	conf := new(SwitchyConfig)
	yaml.Unmarshal(all, conf)
	server := dns.Server{Net: "udp", Addr: fmt.Sprintf(":%d", conf.Port)}
	upstreams := conf.init()

	dns.HandleFunc(".", func(writer dns.ResponseWriter, msg *dns.Msg) {
		go func() {
			//log.Printf("\n---recv start---\n %v\n---recv end---", msg)
			if msg.Question[0].Qtype == dns.TypeA || msg.Question[0].Qtype == dns.TypeAAAA {

			}
			matched := false
			for _, upstreamDNS := range upstreams {
				if upstreamDNS.match(msg.Question[0].Name) {
					matched = true
					upstreamDNS.forwarded(writer, msg)
				}
			}
			if !matched {
				upstreams[len(upstreams)-1].forwarded(writer, msg)
			}
		}()
	})
	err := server.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}
}

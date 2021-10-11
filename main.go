package main

import (
	"fmt"
	"github.com/AdguardTeam/dnsproxy/upstream"
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
	log.Println(conf)
	server := dns.Server{Net: "udp", Addr: fmt.Sprintf(":%d", conf.Port)}

	//for _, config := range conf.Upstream {
	//	up, error := upstream.AddressToUpstream(config.Url, nil)
	//	if error != nil {
	//		log.Printf("init upstream fail: %+v", error)
	//	}
	//}

	toUpstream, _ := upstream.AddressToUpstream("127.0.0.1:8053", &upstream.Options{
		Bootstrap:                 nil,
		Timeout:                   0,
		ServerIPAddrs:             nil,
		InsecureSkipVerify:        false,
		VerifyServerCertificate:   nil,
		VerifyDNSCryptCertificate: nil,
	})
	dns.HandleFunc(".", func(writer dns.ResponseWriter, msg *dns.Msg) {
		go func() {
			if msg.Question[0].Qtype == dns.TypeA || msg.Question[0].Qtype == dns.TypeAAAA {

			}
			//log.Printf("\n---recv start---\n %v\n---recv end---", msg)
			resp, err := toUpstream.Exchange(msg)
			if err != nil {
				log.Printf("upstream error: %v", err)
			} else {
				//log.Printf("\n---resp start---\n %v\n---resp end---", resp)
				err := writer.WriteMsg(resp)
				if err != nil {
					log.Printf("write error: %v", err)
				}
			}
		}()
	})

	err := server.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}
}

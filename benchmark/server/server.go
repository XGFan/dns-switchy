package main

import (
	"github.com/miekg/dns"
	"log"
	"net"
)

func main() {
	server := dns.Server{Addr: ":8053", Net: "udp"}

	dns.HandleFunc(".", func(writer dns.ResponseWriter, msg *dns.Msg) {
		rr := &dns.A{
			Hdr: dns.RR_Header{Name: "test4x.com.", Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 0},
			A:   net.IPv4(1, 1, 1, 1),
		}
		m := new(dns.Msg)
		m.SetReply(msg)
		m.Answer = append(m.Answer, rr)
		err := writer.WriteMsg(m)
		if err != nil {
			log.Println(err)
		}
	})

	err := server.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}
}

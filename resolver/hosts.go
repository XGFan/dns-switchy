package resolver

import (
	"fmt"
	"github.com/miekg/dns"
	"log"
	"net"
	"strings"
)

type Hosts map[string]string

func (h Hosts) String() string {
	return fmt.Sprintf("Hosts(%d)", len(h))
}

func (h Hosts) HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool {
	question := msg.Question[0]
	if question.Qtype == dns.TypeA || question.Qtype == dns.TypeAAAA {
		domain := strings.TrimRight(question.Name, ".")
		resp, exist := h[domain]
		if exist {
			log.Printf("[%s] recv [%s]: %s %s", "Hosts",
				writer.RemoteAddr(),
				dns.TypeToString[msg.Question[0].Qtype],
				msg.Question[0].Name)
			var rr dns.RR
			if question.Qtype == dns.TypeA {
				rr = &dns.A{
					Hdr: dns.RR_Header{Name: question.Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 0},
					A:   net.ParseIP(resp),
				}
			} else {
				rr = &dns.AAAA{
					Hdr:  dns.RR_Header{Name: question.Name, Rrtype: dns.TypeAAAA, Class: dns.ClassINET, Ttl: 0},
					AAAA: net.ParseIP(resp),
				}
			}
			m := new(dns.Msg)
			m.SetReply(msg)
			m.Answer = append(m.Answer, rr)
			err := writer.WriteMsg(m)
			if err != nil {
				//just let it fail
				return true
			}
			return true
		}
	}
	return false
}

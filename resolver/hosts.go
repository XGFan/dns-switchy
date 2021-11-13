package resolver

import (
	"fmt"
	"github.com/miekg/dns"
	"net"
)

type Hosts map[string]string

func NewHosts(m map[string]string) Hosts {
	hosts := make(Hosts, 0)
	for k, v := range m {
		if k != "" && v != "" {
			hosts[dns.Fqdn(k)] = v
		}
	}
	return hosts
}

func (h Hosts) String() string {
	return fmt.Sprintf("Hosts(%d)", len(h))
}

func (h Hosts) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	if question.Qtype == dns.TypeA {
		_, exist := h[question.Name]
		return exist
	}
	return false
}

func (h Hosts) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	question := msg.Question[0]
	rr := &dns.A{
		Hdr: dns.RR_Header{Name: question.Name, Rrtype: dns.TypeA, Class: dns.ClassINET},
		A:   net.ParseIP(h[question.Name]),
	}
	m := new(dns.Msg)
	m.SetReply(msg)
	m.Answer = append(m.Answer, rr)
	return m, nil
}

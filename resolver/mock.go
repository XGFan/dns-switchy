package resolver

import (
	"dns-switchy/config"
	"dns-switchy/util"
	"fmt"
	"github.com/miekg/dns"
	"net"
	"strings"
)

type Mock struct {
	NoCache
	util.DomainMatcher
	util.QueryTypeMatcher
	Answer string
}

func (m *Mock) String() string {
	return fmt.Sprintf("Mock(%s,%s,%s)", m.DomainMatcher, m.QueryTypeMatcher, m.Answer)
}

func (m *Mock) Close() {
}

func (m *Mock) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	domain := strings.TrimRight(question.Name, ".")
	return m.MatchDomain(domain) && m.MatchQueryType(question.Qtype)
}

func (m *Mock) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	question := msg.Question[0]
	var rr dns.RR
	if m.Answer != "" {
		switch question.Qtype {
		case dns.TypeA:
			rr = &dns.A{
				Hdr: dns.RR_Header{Name: question.Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 0},
				A:   net.ParseIP(m.Answer),
			}
		case dns.TypeAAAA:
			rr = &dns.AAAA{
				Hdr:  dns.RR_Header{Name: question.Name, Rrtype: dns.TypeAAAA, Class: dns.ClassINET, Ttl: 0},
				AAAA: net.ParseIP(m.Answer),
			}
		}
	}
	res := new(dns.Msg)
	res.SetReply(msg)
	res.Rcode = dns.RcodeSuccess
	res.RecursionAvailable = true
	if rr != nil {
		res.Answer = append(res.Answer, rr)
	}
	return res, nil
}

func NewMock(config *config.MockConfig) (*Mock, error) {
	return &Mock{
		QueryTypeMatcher: util.NewQueryTypeMatcher(config.QueryType),
		DomainMatcher:    util.NewDomainMatcher(config.Rule),
		Answer:           config.Answer,
	}, nil
}

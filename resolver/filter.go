package resolver

import (
	"github.com/miekg/dns"
)

type Filter struct {
	queryType []string
}

func (f Filter) HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool {
	question := msg.Question[0]
	if question.Qtype == dns.TypeAAAA {
		m := new(dns.Msg)
		m.SetReply(msg)
		m.Rcode = dns.RcodeSuccess
		_ = writer.WriteMsg(m)
		return true
	} else {
		return false
	}
}

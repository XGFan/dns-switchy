package resolver

import (
	"fmt"
	"github.com/miekg/dns"
)

type Filter struct {
	queryType []uint16
}

func NewAAAAFilter() *Filter {
	return &Filter{queryType: []uint16{dns.TypeAAAA}}
}

func (f Filter) String() string {
	return fmt.Sprintf("TypeFilter(%d)", f.queryType)
}

func (f *Filter) HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool {
	question := msg.Question[0]
	for _, t := range f.queryType {
		if question.Qtype == t {
			m := new(dns.Msg)
			m.SetReply(msg)
			m.Rcode = dns.RcodeSuccess
			_ = writer.WriteMsg(m)
			return true
		}
	}
	return false
}

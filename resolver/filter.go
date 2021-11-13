package resolver

import (
	"fmt"
	"github.com/miekg/dns"
)

type Filter struct {
	queryType map[uint16]struct{}
}

func NewAAAAFilter() *Filter {
	return &Filter{queryType: map[uint16]struct{}{dns.TypeAAAA: {}}}
}

func (f Filter) String() string {
	strings := make([]string, 0)
	for t := range f.queryType {
		strings = append(strings, dns.TypeToString[t])
	}
	return fmt.Sprintf("TypeFilter(%s)", strings)
}

func (f *Filter) Accept(msg *dns.Msg) bool {
	_, exist := f.queryType[msg.Question[0].Qtype]
	return exist
}

func (f *Filter) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	m := new(dns.Msg)
	m.SetReply(msg)
	return m, nil
}

package resolver

import (
	"dns-switchy/config"
	"fmt"
	"github.com/miekg/dns"
	"log"
)

type Filter struct {
	NoCache
	queryType map[uint16]struct{}
}

func (f Filter) Close() {
	log.Printf("%s closed", f)
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

func NewFilter(config *config.FilterConfig) *Filter {
	m := make(map[uint16]struct{})
	for _, s := range config.Block {
		m[dns.StringToType[s]] = struct{}{}
	}
	return &Filter{queryType: m}
}

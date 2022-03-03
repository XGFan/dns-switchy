package resolver

import (
	"dns-switchy/config"
	"dns-switchy/util"
	"fmt"
	"github.com/miekg/dns"
	"log"
)

type Filter struct {
	NoCache
	util.QueryTypeMatcher
	util.DomainMatcher
}

func (f Filter) Close() {
	log.Printf("%s closed", f)
}

func (f Filter) String() string {
	return fmt.Sprintf("TypeFilter(%s,%s)", f.DomainMatcher, f.QueryTypeMatcher)
}

func (f *Filter) Accept(msg *dns.Msg) bool {
	return f.MatchDomain(msg.Question[0].Name) && f.MatchQueryType(msg.Question[0].Qtype)
}

func (f *Filter) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	m := new(dns.Msg)
	m.SetReply(msg)
	return m, nil
}

func NewFilter(config *config.FilterConfig) (*Filter, error) {
	return &Filter{
		QueryTypeMatcher: util.NewQueryTypeMatcher(config.QueryType),
		DomainMatcher:    util.NewDomainMatcher(config.Rule),
	}, nil
}

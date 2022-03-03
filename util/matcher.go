package util

import (
	"bytes"
	"dns-switchy/config"
	"fmt"
	"github.com/miekg/dns"
	"strings"
)

type DomainMatcher interface {
	MatchDomain(domain string) bool
}

type QueryTypeMatcher interface {
	MatchQueryType(queryType uint16) bool
}

var AcceptAll = acceptAll{}

type acceptAll struct {
}

func (a acceptAll) MatchDomain(_ string) bool {
	return true
}

func (a acceptAll) MatchQueryType(_ uint16) bool {
	return true
}

func (a acceptAll) String() string {
	return "AcceptAll"
}

type QueryTypeSet map[uint16]struct{}

func (q QueryTypeSet) MatchQueryType(queryType uint16) bool {
	_, exist := q[queryType]
	return exist
}
func (q QueryTypeSet) String() string {
	return fmt.Sprintf("QueryTypeSet(%d)", len(q))
}

type DomainSet map[string]DomainSet

func (set DomainSet) String() string {
	return "DomainSet"
}

func (set DomainSet) MatchDomain(domain string) bool {
	return set.matchBytes([]byte(domain))
}

func (set DomainSet) matchString(domain string) bool {
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		_, ok := set[domain]
		return ok
	} else {
		subSet, exist := set[domain[index+1:]]
		return exist && (len(subSet) == 0 || subSet.MatchDomain(domain[:index]))
	}
}

func (set DomainSet) matchBytes(domain []byte) bool {
	index := bytes.LastIndexByte(domain, '.')
	if index == -1 {
		_, ok := set[string(domain)]
		return ok
	} else {
		subSet, exist := set[string(domain[index+1:])]
		return exist && (len(subSet) == 0 || subSet.matchBytes(domain[:index]))
	}
}

var _included = make(map[string]DomainSet, 0)

func (set DomainSet) addDomain(domain string) {
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		set[domain] = _included
	} else {
		suffix := domain[index+1:]
		subSet, exist := set[suffix]
		if exist {
			if len(subSet) != 0 {
				subSet.addDomain(domain[:index])
			}
		} else {
			set[suffix] = newSubSet(domain[:index])
		}
	}
}

func newSubSet(domain string) DomainSet {
	set := make(DomainSet, 0)
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		set[domain] = _included
	} else {
		set[domain[index+1:]] = newSubSet(domain[:index])
	}
	return set
}

func NewDomainSet(domains []string) DomainSet {
	set := make(DomainSet, 0)
	for _, domain := range domains {
		set.addDomain(domain)
	}
	return set
}

func NewDomainMatcher(rules []string) DomainMatcher {
	domains := config.ParseRule(rules)
	if len(domains) > 0 {
		return NewDomainSet(domains)
	} else {
		return AcceptAll
	}
}

func NewQueryTypeMatcher(queryTypes []string) QueryTypeMatcher {
	if len(queryTypes) > 0 {
		m := make(QueryTypeSet)
		for _, s := range queryTypes {
			m[dns.StringToType[s]] = struct{}{}
		}
		return m
	} else {
		return AcceptAll
	}
}

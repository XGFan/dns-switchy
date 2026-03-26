package util

import (
	"bytes"
	"fmt"
	"strings"

	"dns-switchy/config"
	"github.com/miekg/dns"
)

type DomainMatcher interface {
	MatchDomain(domain string) bool
}

type QueryTypeMatcher interface {
	MatchQueryType(queryType uint16) bool
}

type SourceMatcher interface {
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

type ComplexDomainSet struct {
	WhiteList DomainSet
	BlackList DomainSet
}

func (c *ComplexDomainSet) MatchDomain(domain string) bool {
	domain = normalizeDomain(domain)
	if len(c.WhiteList) == 0 {
		return !c.BlackList.MatchDomain(domain)
	}
	return (!c.BlackList.MatchDomain(domain)) && c.WhiteList.MatchDomain(domain)
}

func (c *ComplexDomainSet) String() string {
	return "ComplexDomainSet"
}

type DomainSet map[string]DomainSet

const terminalDomainKey = ""

func (set DomainSet) String() string {
	return "DomainSet"
}

func (set DomainSet) MatchDomain(domain string) bool {
	return set.matchBytes([]byte(normalizeDomain(domain)))
}

func (set DomainSet) matchString(domain string) bool {
	if set.hasTerminal() {
		return true
	}
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		child, exist := set[domain]
		return exist && child.hasTerminal()
	} else {
		subSet, exist := set[domain[index+1:]]
		return exist && subSet.matchString(domain[:index])
	}
}

func (set DomainSet) matchBytes(domain []byte) bool {
	if set.hasTerminal() {
		return true
	}
	index := bytes.LastIndexByte(domain, '.')
	if index == -1 {
		child, exist := set[string(domain)]
		return exist && child.hasTerminal()
	} else {
		subSet, exist := set[string(domain[index+1:])]
		return exist && subSet.matchBytes(domain[:index])
	}
}

func (set DomainSet) hasTerminal() bool {
	_, ok := set[terminalDomainKey]
	return ok
}

var _included = make(map[string]DomainSet)

func (set DomainSet) addDomain(domain string) {
	domain = normalizeDomain(domain)
	if domain == "" {
		return
	}
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		child, exist := set[domain]
		if !exist {
			child = make(DomainSet)
			set[domain] = child
		}
		child[terminalDomainKey] = _included
	} else {
		suffix := domain[index+1:]
		subSet, exist := set[suffix]
		if exist {
			subSet.addDomain(domain[:index])
		} else {
			subSet = make(DomainSet)
			subSet.addDomain(domain[:index])
			set[suffix] = subSet
		}
	}
}

func newSubSet(domain string) DomainSet {
	set := make(DomainSet)
	set.addDomain(domain)
	return set
}

func NewDomainSet(domains []string) DomainSet {
	set := make(DomainSet)
	for _, domain := range domains {
		set.addDomain(domain)
	}
	return set
}

func normalizeDomain(domain string) string {
	domain = strings.TrimSpace(domain)
	domain = strings.ToLower(domain)
	domain = strings.TrimRight(domain, ".")
	return domain
}

func NewDomainMatcher(rules []string) (DomainMatcher, error) {
	domains, err := config.ParseRule(rules)
	if err != nil {
		return nil, err
	}
	if len(domains) > 0 {
		c := new(ComplexDomainSet)
		c.BlackList = make(DomainSet)
		c.WhiteList = make(DomainSet)
		added := false
		for _, domain := range domains {
			trimmed := strings.TrimSpace(domain)
			if trimmed == "" {
				continue
			}
			if strings.HasPrefix(trimmed, "!") {
				c.BlackList.addDomain(strings.TrimSpace(strings.TrimPrefix(trimmed, "!")))
			} else {
				c.WhiteList.addDomain(trimmed)
			}
			added = true
		}
		if added {
			return c, nil
		}
		return AcceptAll, nil
	} else {
		return AcceptAll, nil
	}
}

func NewQueryTypeMatcher(queryTypes []string) (QueryTypeMatcher, error) {
	if len(queryTypes) > 0 {
		m := make(QueryTypeSet)
		for _, s := range queryTypes {
			name := strings.ToUpper(strings.TrimSpace(s))
			if name == "" {
				return nil, fmt.Errorf("unknown query type %q", s)
			}
			typeCode, ok := dns.StringToType[name]
			if !ok {
				return nil, fmt.Errorf("unknown query type %q", s)
			}
			m[typeCode] = struct{}{}
		}
		return m, nil
	} else {
		return AcceptAll, nil
	}
}

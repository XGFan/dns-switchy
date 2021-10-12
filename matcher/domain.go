package matcher

import (
	"bytes"
	"strings"
)

type Matcher interface {
	Match(domain string) bool
}

var AcceptAll = acceptAll{}

type acceptAll struct {
}

func (a acceptAll) Match(_ string) bool {
	return true
}

type DomainSet map[string]DomainSet

func (set DomainSet) Match(domain string) bool {
	return set.matchBytes([]byte(domain))
}

func (set DomainSet) matchString(domain string) bool {
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		_, ok := set[domain]
		return ok
	} else {
		subSet, exist := set[domain[index+1:]]
		return exist && (len(subSet) == 0 || subSet.Match(domain[:index]))
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

func (set DomainSet) addDomain(domain string) {
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		set[domain] = map[string]DomainSet{}
	} else {
		subSet, exist := set[domain[index+1:]]
		if exist {
			subSet.addDomain(domain[:index])
		} else {
			set[domain[index+1:]] = newSubSet(domain[:index])
		}
	}
}

func newSubSet(domain string) DomainSet {
	set := make(DomainSet, 0)
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		set[domain] = map[string]DomainSet{}
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

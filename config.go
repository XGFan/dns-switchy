package main

import (
	"bytes"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"github.com/miekg/dns"
	"log"
	"strings"
)

type Matcher interface {
	match(domain string) bool
}
type DnsRule []string

func (d DnsRule) match(domain string) bool {
	for _, s := range d {
		if strings.HasSuffix(domain, s) {
			return true
		}
	}
	return false
}

type SwitchyConfig struct {
	Port     int               `json:"port,omitempty"`
	Host     map[string]string `json:"host,omitempty"`
	Upstream []UpstreamConfig  `json:"upstream,omitempty"`
}

type UpstreamConfig struct {
	Name   string            `json:"name,omitempty"`
	Url    string            `json:"url,omitempty"`
	Rule   []string          `json:"rule,omitempty"`
	Config map[string]string `json:"config,omitempty"`
}

type UpstreamDNS struct {
	upstream.Upstream
	Matcher
}

func (upstreamDNS *UpstreamDNS) forwarded(writer dns.ResponseWriter, msg *dns.Msg) {
	resp, err := upstreamDNS.Exchange(msg)
	if err != nil {
		log.Printf("upstream error: %v", err)
	} else {
		//log.Printf("\n---resp start---\n %v\n---resp end---", resp)
		err := writer.WriteMsg(resp)
		if err != nil {
			log.Printf("write error: %v", err)
		}
	}
}

func (conf *SwitchyConfig) init() []UpstreamDNS {
	l := make([]UpstreamDNS, 0, len(conf.Upstream))
	for _, config := range conf.Upstream {
		up, err := upstream.AddressToUpstream(config.Url, nil)
		if err != nil {
			log.Printf("init upstream fail: %+v", err)
		}
		l = append(l, UpstreamDNS{
			Upstream: up,
			Matcher:  NewDomainTree(config.Rule),
		})
	}
	return l
}

type DomainSet map[string]DomainSet

func (set DomainSet) match(domain string) bool {
	return set.matchBytes([]byte(domain))
}

func (set DomainSet) matchString(domain string) bool {
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		_, ok := set[domain]
		return ok
	} else {
		subSet, exist := set[domain[index+1:]]
		return exist && (len(subSet) == 0 || subSet.match(domain[:index]))
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

func (set DomainSet) AddDomain(domain string) {
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		set[domain] = map[string]DomainSet{}
	} else {
		subSet, exist := set[domain[index+1:]]
		if exist {
			subSet.AddDomain(domain[:index])
		} else {
			set[domain[index+1:]] = NewDomainSet(domain[:index])
		}
	}
}

func NewDomainSet(domain string) DomainSet {
	set := make(DomainSet, 0)
	index := strings.LastIndex(domain, ".")
	if index == -1 {
		set[domain] = map[string]DomainSet{}
	} else {
		set[domain[index+1:]] = NewDomainSet(domain[:index])
	}
	return set
}

func NewDomainTree(domains []string) DomainSet {
	set := make(DomainSet, 0)
	for _, domain := range domains {
		set.AddDomain(domain)
	}
	return set
}

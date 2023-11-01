package util

import (
	"github.com/XGFan/go-utils"
	"github.com/miekg/dns"
	"log"
	"time"
)

type Cache interface {
	Set(q dns.Question, msg dns.Msg, ttl time.Duration)
	Get(q dns.Question) dns.Msg
}
type NoCache struct {
}

func (n NoCache) Close() {
}

func (n NoCache) Set(_ dns.Question, _ dns.Msg, _ time.Duration) {
}

func (n NoCache) Get(_ dns.Question) dns.Msg {
	return dns.Msg{}
}

func NewDnsCache(ttl time.Duration) Cache {
	if ttl == 0 {
		log.Println("cache is disabled")
		return &NoCache{}
	}
	return utils.NewTTlCache[dns.Question, dns.Msg](ttl)
}

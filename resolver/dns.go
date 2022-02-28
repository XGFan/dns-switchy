package resolver

import (
	"github.com/miekg/dns"
	"time"
)

type DnsResolver interface {
	Close()
	Accept(msg *dns.Msg) bool
	Resolve(msg *dns.Msg) (*dns.Msg, error)
	TTL() time.Duration
}

type NoCache struct {
}

func (n NoCache) TTL() time.Duration {
	return -1
}

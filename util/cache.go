package util

import (
	"github.com/XGFan/go-utils"
	"github.com/miekg/dns"
	"log"
	"sync"
	"time"
)

type Cache interface {
	Set(q dns.Question, msg dns.Msg, ttl time.Duration)
	Get(q dns.Question) dns.Msg
	// Clear drops all cached entries. Used after a resolver swap so stale
	// routing decisions are not masked by previously cached answers.
	Clear()
}

var None = dns.Msg{}

type NoCache struct {
}

func (n NoCache) Close() {
}

func (n NoCache) Set(_ dns.Question, _ dns.Msg, _ time.Duration) {
}

func (n NoCache) Get(_ dns.Question) dns.Msg {
	return None
}

func (n NoCache) Clear() {
}

// dnsCache wraps go-utils.TTLCache to add a concurrency-safe Clear(). The
// underlying TTLCache stores its data in an unexported field, so Clear()
// rebuilds the inner cache under a write lock rather than mutating it in place.
// An RWMutex guards Get/Set (read lock) against Clear (write lock).
type dnsCache struct {
	mu    sync.RWMutex
	ttl   time.Duration
	inner *utils.TTLCache[dns.Question, dns.Msg]
}

func (c *dnsCache) Set(q dns.Question, msg dns.Msg, ttl time.Duration) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	c.inner.Set(q, msg, ttl)
}

func (c *dnsCache) Get(q dns.Question) dns.Msg {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.inner.Get(q)
}

func (c *dnsCache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.inner = utils.NewTTlCache[dns.Question, dns.Msg](c.ttl)
}

func NewDnsCache(ttl time.Duration) Cache {
	if ttl == 0 {
		log.Println("cache is disabled")
		return &NoCache{}
	}
	return &dnsCache{
		ttl:   ttl,
		inner: utils.NewTTlCache[dns.Question, dns.Msg](ttl),
	}
}

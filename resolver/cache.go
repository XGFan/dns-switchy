package resolver

import (
	"github.com/miekg/dns"
	"log"
	"time"
)

type DnsCache struct {
	ttl           time.Duration
	cleanInterval time.Duration
	cache         map[dns.Question]CacheItem
	writeChan     chan WriteTask
}
type CacheItem struct {
	validBefore time.Time
	item        *dns.Msg
}

type WriteTask struct {
	question *dns.Question
	msg      *dns.Msg
}

func (dnsCache *DnsCache) Get(q *dns.Question) *dns.Msg {
	c, exist := dnsCache.cache[*q]
	if exist && c.validBefore.After(time.Now()) {
		return c.item
	}
	return nil
}

func (dnsCache *DnsCache) Write(q *dns.Question, msg *dns.Msg) {
	dnsCache.writeChan <- WriteTask{
		question: q,
		msg:      msg,
	}
}

func (dnsCache *DnsCache) writeAndClean() {
	tick := time.Tick(dnsCache.cleanInterval)
	for {
		select {
		case task := <-dnsCache.writeChan:
			dnsCache.cache[*task.question] = CacheItem{
				validBefore: time.Now().Add(dnsCache.ttl),
				item:        task.msg,
			}
		case <-tick:
			before := len(dnsCache.cache)
			for d, item := range dnsCache.cache {
				if item.validBefore.Before(time.Now()) {
					delete(dnsCache.cache, d)
				}
			}
			after := len(dnsCache.cache)
			log.Printf("Clean cache: from %d to %d", before, after)
		}
	}
}

func NewDnsCache(ttl time.Duration, cleanInterval time.Duration) *DnsCache {
	dnsCache := &DnsCache{
		ttl:           ttl,
		cleanInterval: cleanInterval,
		cache:         make(map[dns.Question]CacheItem),
		writeChan:     make(chan WriteTask, 10),
	}
	go dnsCache.writeAndClean()
	return dnsCache
}

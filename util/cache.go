package util

import (
	"fmt"
	"github.com/miekg/dns"
	"log"
	"time"
)

type Cache interface {
	Set(q *dns.Question, msg *dns.Msg)
	Get(q *dns.Question) *dns.Msg
	Close()
}
type NoCache struct {
}

func (n NoCache) Close() {
}

func (n NoCache) Set(q *dns.Question, msg *dns.Msg) {
}

func (n NoCache) Get(q *dns.Question) *dns.Msg {
	return nil
}

type DnsCache struct {
	ttl         time.Duration
	cache       map[dns.Question]CacheItem
	writeChan   chan WriteTask
	cleanTicker *time.Ticker
	closeChan   chan struct{}
}

func (dnsCache *DnsCache) Close() {
	dnsCache.cleanTicker.Stop()
	dnsCache.closeChan <- struct{}{}
	close(dnsCache.closeChan)
	close(dnsCache.writeChan)
	log.Printf("%s closed", dnsCache)
}

func (dnsCache *DnsCache) String() string {
	return fmt.Sprintf("Cache(TTL: %s)", dnsCache.ttl)
}

type CacheItem struct {
	validBefore time.Time
	item        dns.Msg
}

type WriteTask struct {
	question *dns.Question
	msg      *dns.Msg
}

func (dnsCache *DnsCache) Get(q *dns.Question) *dns.Msg {
	c, exist := dnsCache.cache[*q]
	if exist && c.validBefore.After(time.Now()) {
		return &c.item
	}
	return nil
}

func (dnsCache *DnsCache) Set(q *dns.Question, msg *dns.Msg) {
	dnsCache.writeChan <- WriteTask{
		question: q,
		msg:      msg,
	}
}

func (dnsCache *DnsCache) writeAndClean() {
	for {
		//log.Println("writeAndClean")
		select {
		case <-dnsCache.closeChan:
			return
		case task := <-dnsCache.writeChan:
			dnsCache.cache[*task.question] = CacheItem{
				validBefore: time.Now().Add(dnsCache.ttl),
				item:        *task.msg,
			}
		case <-dnsCache.cleanTicker.C:
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

func NewDnsCache(ttl time.Duration, cleanInterval time.Duration) Cache {
	if ttl == 0 {
		return &NoCache{}
	}
	dnsCache := &DnsCache{
		ttl:         ttl,
		cache:       make(map[dns.Question]CacheItem, 0),
		writeChan:   make(chan WriteTask, 10),
		cleanTicker: time.NewTicker(cleanInterval),
		closeChan:   make(chan struct{}, 0),
	}
	go dnsCache.writeAndClean()
	return dnsCache
}

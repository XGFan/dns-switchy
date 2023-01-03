package util

import (
	"fmt"
	"github.com/miekg/dns"
	"log"
	"sync"
	"time"
)

type Cache interface {
	Set(q *dns.Question, msg *dns.Msg, ttl time.Duration)
	Get(q *dns.Question) *dns.Msg
	Close()
}
type NoCache struct {
}

func (n NoCache) Close() {
}

func (n NoCache) Set(_ *dns.Question, _ *dns.Msg, _ time.Duration) {
}

func (n NoCache) Get(_ *dns.Question) *dns.Msg {
	return nil
}

type DnsCache struct {
	ttl         time.Duration
	cache       sync.Map
	cleanTicker *time.Ticker
	closeChan   chan struct{}
}

func (dnsCache *DnsCache) Close() {
	dnsCache.cleanTicker.Stop()
	dnsCache.closeChan <- struct{}{}
	close(dnsCache.closeChan)
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
	ttl      time.Duration
}

func (dnsCache *DnsCache) Get(q *dns.Question) *dns.Msg {
	c, exist := dnsCache.cache.Load(*q)
	if exist && c.(CacheItem).validBefore.After(time.Now()) {
		item := c.(CacheItem).item
		return &item
	}
	return nil
}

func (dnsCache *DnsCache) Set(q *dns.Question, msg *dns.Msg, ttl time.Duration) {
	if ttl == 0 { //未设置ttl，使用默认ttl
		ttl = dnsCache.ttl
	}
	if ttl > 0 {
		dnsCache.cache.Store(
			*q,
			CacheItem{
				validBefore: time.Now().Add(ttl),
				item:        *msg,
			},
		)
	}
}

func (dnsCache *DnsCache) writeAndClean() {
	for {
		select {
		case <-dnsCache.closeChan:
			return
		case <-dnsCache.cleanTicker.C:
			before := 0
			clean := 0
			dnsCache.cache.Range(func(key, item any) bool {
				before += 1
				if item.(CacheItem).validBefore.Before(time.Now()) {
					dnsCache.cache.Delete(key)
					clean += 1
				}
				return true
			})
			log.Printf("Clean cache: from %d to %d", before, before-clean)
		}
	}
}

func NewDnsCache(ttl time.Duration) Cache {
	if ttl == 0 {
		log.Println("cache is disabled")
		return &NoCache{}
	}
	dnsCache := &DnsCache{
		ttl:         ttl,
		cache:       sync.Map{},
		cleanTicker: time.NewTicker(ttl),
		closeChan:   make(chan struct{}, 0),
	}
	go dnsCache.writeAndClean()
	return dnsCache
}

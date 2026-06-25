package util

import (
	"sync"
	"testing"
	"time"

	"github.com/miekg/dns"
)

func TestNewDnsCacheZeroTTLReturnsNoCache(t *testing.T) {
	cache := NewDnsCache(0)

	if _, ok := cache.(*NoCache); !ok {
		t.Fatalf("NewDnsCache(0) type = %T, want *NoCache", cache)
	}
}

func TestNoCacheIgnoresSetAndReturnsMiss(t *testing.T) {
	cache := NoCache{}
	q := dns.Question{Name: "example.com.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
	msg := dns.Msg{}
	msg.SetQuestion(q.Name, q.Qtype)
	rr, err := dns.NewRR("example.com. 60 IN A 203.0.113.10")
	if err != nil {
		t.Fatalf("dns.NewRR() error = %v", err)
	}
	msg.Answer = []dns.RR{rr}

	cache.Set(q, msg, time.Minute)

	got := cache.Get(q)
	if len(got.Question) != 0 || len(got.Answer) != 0 || got.Rcode != 0 {
		t.Fatalf("NoCache.Get() = %+v, want zero-value miss", got)
	}
}

func TestDnsCacheStoresAndExpiresEntry(t *testing.T) {
	ttl := 25 * time.Millisecond
	cache := NewDnsCache(ttl)
	q := dns.Question{Name: "example.org.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
	msg := dns.Msg{}
	msg.SetQuestion(q.Name, q.Qtype)
	rr, err := dns.NewRR("example.org. 60 IN A 198.51.100.7")
	if err != nil {
		t.Fatalf("dns.NewRR() error = %v", err)
	}
	msg.Answer = []dns.RR{rr}

	cache.Set(q, msg, ttl)

	got := cache.Get(q)
	if len(got.Question) != 1 || got.Question[0] != q {
		t.Fatalf("cache.Get() before expiry question = %+v, want %+v", got.Question, msg.Question)
	}
	if len(got.Answer) != 1 || got.Answer[0].Header().Name != rr.Header().Name {
		t.Fatalf("cache.Get() before expiry answer = %+v, want %+v", got.Answer, msg.Answer)
	}

	time.Sleep(50 * time.Millisecond)

	got = cache.Get(q)
	if len(got.Question) != 0 || len(got.Answer) != 0 || got.Rcode != 0 {
		t.Fatalf("cache.Get() after expiry = %+v, want zero-value miss", got)
	}
}

func TestDnsCacheClearInvalidatesHits(t *testing.T) {
	cache := NewDnsCache(time.Minute)
	q := dns.Question{Name: "clear.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
	msg := dns.Msg{}
	msg.SetQuestion(q.Name, q.Qtype)

	cache.Set(q, msg, time.Minute)
	if got := cache.Get(q); len(got.Question) != 1 {
		t.Fatalf("cache.Get() before Clear question = %+v, want a hit", got.Question)
	}

	cache.Clear()

	got := cache.Get(q)
	if len(got.Question) != 0 || len(got.Answer) != 0 || got.Rcode != 0 {
		t.Fatalf("cache.Get() after Clear = %+v, want zero-value miss", got)
	}
}

func TestNoCacheClearIsNoOp(t *testing.T) {
	// NoCache must satisfy the Cache interface including Clear and not panic.
	cache := NewDnsCache(0)
	cache.Clear()
}

func TestDnsCacheConcurrentGetSetClear(t *testing.T) {
	cache := NewDnsCache(time.Minute)
	var wg sync.WaitGroup
	stop := make(chan struct{})

	worker := func(seed byte, fn func()) {
		defer wg.Done()
		for {
			select {
			case <-stop:
				return
			default:
				fn()
			}
		}
	}

	mkQ := func() dns.Question {
		return dns.Question{Name: "race.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
	}

	wg.Add(3)
	go worker(1, func() {
		msg := dns.Msg{}
		msg.SetQuestion(mkQ().Name, dns.TypeA)
		cache.Set(mkQ(), msg, time.Minute)
	})
	go worker(2, func() {
		_ = cache.Get(mkQ())
	})
	go worker(3, func() {
		cache.Clear()
	})

	time.Sleep(100 * time.Millisecond)
	close(stop)
	wg.Wait()
}

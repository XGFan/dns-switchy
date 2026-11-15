package resolver

import (
	"context"
	"net"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"dns-switchy/config"
	"github.com/miekg/dns"
)

type testUpstream struct {
}

func (testUpstream) Exchange(_ context.Context, msg *dns.Msg) (*dns.Msg, error) {
	resp := new(dns.Msg)
	resp.SetReply(msg)
	return resp, nil
}

func (testUpstream) Address() string {
	return "test-upstream"
}

func (testUpstream) Close() error {
	return nil
}

type testPreloaderCacheUpstream struct {
}

func (testPreloaderCacheUpstream) Exchange(_ context.Context, msg *dns.Msg) (*dns.Msg, error) {
	resp := new(dns.Msg)
	resp.SetReply(msg)
	resp.Answer = []dns.RR{
		&dns.A{
			Hdr: dns.RR_Header{
				Name:   dns.Fqdn(msg.Question[0].Name),
				Rrtype: dns.TypeA,
				Class:  dns.ClassINET,
				Ttl:    60,
			},
			A: net.IPv4(1, 1, 1, 1),
		},
	}
	return resp, nil
}

func (testPreloaderCacheUpstream) Address() string {
	return "test-preloader-cache-upstream"
}

func (testPreloaderCacheUpstream) Close() error {
	return nil
}

func newPreloaderForCloseTest() *Preloader {
	preloader := &Preloader{
		Forward: &Forward{
			Name:     "test-preloader",
			Upstream: testUpstream{},
		},
		dnsCache: sync.Map{},
		ticker:   time.NewTicker(time.Hour),
		stop:     make(chan struct{}),
		done:     make(chan struct{}),
	}
	go preloader.Work()
	return preloader
}

func waitForPreloaderTest(t *testing.T, done <-chan struct{}, message string) {
	t.Helper()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal(message)
	}
}

func TestPreloaderCloseStopsWorker(t *testing.T) {
	preloader := newPreloaderForCloseTest()

	closeDone := make(chan struct{})
	go func() {
		preloader.Close()
		close(closeDone)
	}()

	waitForPreloaderTest(t, closeDone, "Preloader.Close blocked")
	waitForPreloaderTest(t, preloader.done, "Preloader worker did not exit")

	secondCloseDone := make(chan struct{})
	go func() {
		preloader.Close()
		close(secondCloseDone)
	}()

	waitForPreloaderTest(t, secondCloseDone, "second Preloader.Close blocked")
}

func TestPreloaderCloseRepeatedCreateCycles(t *testing.T) {
	for i := 0; i < 10; i++ {
		preloader := newPreloaderForCloseTest()

		closeDone := make(chan struct{})
		go func() {
			preloader.Close()
			close(closeDone)
		}()

		waitForPreloaderTest(t, closeDone, "Preloader.Close blocked during repeated create/close cycle")
	}
}

func TestPreloaderCacheHitReturnsIsolatedCopies(t *testing.T) {
	preloader := &Preloader{
		Forward: &Forward{
			Name:     "test-preloader-cache",
			Upstream: testPreloaderCacheUpstream{},
			ttl:      time.Hour,
			stat:     ForwardStat{alive: true},
		},
		dnsCache: sync.Map{},
	}

	msg := new(dns.Msg)
	msg.SetQuestion("example.com.", dns.TypeA)

	first, err := preloader.Resolve(msg)
	if err != nil {
		t.Fatalf("first Resolve() error = %v", err)
	}
	first.Answer[0].Header().Ttl = 1
	first.Answer[0].Header().Name = "mutated.example."

	second, err := preloader.Resolve(msg)
	if err != nil {
		t.Fatalf("second Resolve() error = %v", err)
	}
	if got := second.Answer[0].Header().Ttl; got != 60 {
		t.Fatalf("second Resolve() ttl = %d, want 60", got)
	}
	if got := second.Answer[0].Header().Name; got != "example.com." {
		t.Fatalf("second Resolve() name = %q, want %q", got, "example.com.")
	}

	second.Answer[0].Header().Ttl = 2
	second.Answer[0].Header().Name = "second-mutated.example."

	third, err := preloader.Resolve(msg)
	if err != nil {
		t.Fatalf("third Resolve() error = %v", err)
	}
	if got := third.Answer[0].Header().Ttl; got != 60 {
		t.Fatalf("third Resolve() ttl = %d, want 60", got)
	}
	if got := third.Answer[0].Header().Name; got != "example.com." {
		t.Fatalf("third Resolve() name = %q, want %q", got, "example.com.")
	}
}

func TestNewPreloaderRejectsInvalidTTL(t *testing.T) {
	tests := []struct {
		name string
		ttl  time.Duration
	}{
		{name: "zero", ttl: 0},
		{name: "negative", ttl: -time.Second},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			defer func() {
				if r := recover(); r != nil {
					t.Fatalf("NewPreloader panicked for ttl %s: %v", tt.ttl, r)
				}
			}()

			preloader, err := NewPreloader(&config.PreloaderConfig{
				ForwardConfig: config.ForwardConfig{
					Name: "test-preloader-invalid-ttl",
					TTL:  tt.ttl,
					UpstreamConfig: config.UpstreamConfig{
						Url: "127.0.0.1:53",
					},
				},
			})
			if preloader != nil {
				defer preloader.Close()
			}
			if err == nil {
				t.Fatalf("NewPreloader() error = nil, want invalid ttl error")
			}
			if got := err.Error(); got != "invalid preloader ttl: 0s" && got != "invalid preloader ttl: -1s" {
				t.Fatalf("NewPreloader() error = %q, want invalid ttl error", got)
			}
		})
	}
}

type countingUpstream struct {
	calls  atomic.Int32
	answer bool
}

func (u *countingUpstream) Exchange(_ context.Context, msg *dns.Msg) (*dns.Msg, error) {
	u.calls.Add(1)
	resp := new(dns.Msg)
	resp.SetReply(msg)
	if u.answer {
		resp.Answer = []dns.RR{&dns.A{
			Hdr: dns.RR_Header{Name: msg.Question[0].Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 60},
			A:   net.IPv4(10, 0, 0, 1),
		}}
	}
	return resp, nil
}
func (u *countingUpstream) Address() string { return "counting" }
func (u *countingUpstream) Close() error    { return nil }

func newCountingPreloader(up *countingUpstream, ttl time.Duration) *Preloader {
	return &Preloader{Forward: &Forward{Name: "pl", Upstream: up, ttl: ttl, stat: ForwardStat{alive: true}}}
}

// 查过的名字不能永久刷新：闲置超过 preloaderIdleTicks 个周期就淘汰，活跃的照常刷新。
func TestPreloaderRefreshEvictsIdleAndRefreshesActive(t *testing.T) {
	up := &countingUpstream{answer: true}
	ttl := time.Minute
	pl := newCountingPreloader(up, ttl)
	query := func(name string) {
		msg := new(dns.Msg)
		msg.SetQuestion(name, dns.TypeA)
		if _, err := pl.Resolve(msg); err != nil {
			t.Fatalf("Resolve(%s): %v", name, err)
		}
	}
	query("idle.example.")
	query("active.example.")
	idleQ := dns.Question{Name: "idle.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET}

	now := time.Now().Add(preloaderIdleTicks*ttl + 2*ttl)
	pl.touch(dns.Question{Name: "active.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET}, now.Add(-ttl))
	up.calls.Store(0)
	pl.refresh(now)

	if _, ok := pl.dnsCache.Load(idleQ); ok {
		t.Fatal("idle entry still cached, want evicted")
	}
	if _, ok := pl.lastHit.Load(idleQ); ok {
		t.Fatal("idle entry still tracked in lastHit, want removed")
	}
	if got := up.calls.Load(); got != 1 {
		t.Fatalf("upstream calls during refresh = %d, want 1 (only the active entry)", got)
	}
}

func TestPreloaderNoAnswerLeavesNoLastHit(t *testing.T) {
	pl := newCountingPreloader(&countingUpstream{answer: false}, time.Minute)
	msg := new(dns.Msg)
	msg.SetQuestion("empty.example.", dns.TypeA)
	_, _ = pl.Resolve(msg)
	n := 0
	pl.lastHit.Range(func(_, _ any) bool { n++; return true })
	if n != 0 {
		t.Fatalf("lastHit entries = %d, want 0 for a name that never entered the cache", n)
	}
}

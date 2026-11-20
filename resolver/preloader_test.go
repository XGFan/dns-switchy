package resolver

import (
	"context"
	"fmt"
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

// 每轮 tick 刷新所有活跃条目：上一轮刚刷新的（ExpiredAt = tick + 解析耗时 + ttl）不能因「还差一点
// 才过期」被跳过、拖成 2×ttl；后半个周期才写入的新条目也不能拖到第二轮、期间过期被当作旧结果返回。
func TestPreloaderRefreshIntervalIsOneTTL(t *testing.T) {
	up := &countingUpstream{answer: true}
	ttl := time.Minute
	pl := newCountingPreloader(up, ttl)
	tick := time.Now()
	recent := dns.Question{Name: "recent.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
	late := dns.Question{Name: "late.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
	// 上一轮 tick（tick-ttl）刷新、解析耗时 50ms。
	pl.dnsCache.Store(recent, TimeItem{ExpiredAt: tick.Add(50 * time.Millisecond), Item: new(dns.Msg)})
	// 上一周期的后半段（tick 前 ttl/4）才首次写入。
	pl.dnsCache.Store(late, TimeItem{ExpiredAt: tick.Add(ttl * 3 / 4), Item: new(dns.Msg)})
	pl.touch(recent, tick)
	pl.touch(late, tick)

	pl.refresh(tick)

	if got := up.calls.Load(); got != 2 {
		t.Fatalf("upstream calls = %d, want 2", got)
	}
	for _, q := range []dns.Question{recent, late} {
		v, _ := pl.dnsCache.Load(q)
		if !v.(TimeItem).ExpiredAt.After(tick.Add(ttl)) {
			t.Fatalf("%s not refreshed: ExpiredAt = %v", q.Name, v.(TimeItem).ExpiredAt)
		}
	}
}

type slowUpstream struct {
	inflight, maxInflight, calls atomic.Int32
}

func (u *slowUpstream) Exchange(_ context.Context, msg *dns.Msg) (*dns.Msg, error) {
	u.calls.Add(1)
	n := u.inflight.Add(1)
	for {
		m := u.maxInflight.Load()
		if n <= m || u.maxInflight.CompareAndSwap(m, n) {
			break
		}
	}
	time.Sleep(20 * time.Millisecond)
	u.inflight.Add(-1)
	resp := new(dns.Msg)
	resp.SetReply(msg)
	resp.Answer = []dns.RR{&dns.A{
		Hdr: dns.RR_Header{Name: msg.Question[0].Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 60},
		A:   net.IPv4(10, 0, 0, 1),
	}}
	return resp, nil
}
func (u *slowUpstream) Address() string { return "slow" }
func (u *slowUpstream) Close() error    { return nil }

// 刷新并行但有上限，且 refresh 返回时所有条目都已刷新完。
func TestPreloaderRefreshBoundedParallel(t *testing.T) {
	up := &slowUpstream{}
	ttl := time.Minute
	pl := &Preloader{Forward: &Forward{Name: "pl", Upstream: up, ttl: ttl, stat: ForwardStat{alive: true}}}
	const n = 3 * preloaderRefreshWorkers
	for i := 0; i < n; i++ {
		msg := new(dns.Msg)
		msg.SetQuestion(fmt.Sprintf("n%d.example.", i), dns.TypeA)
		if _, err := pl.Resolve(msg); err != nil {
			t.Fatalf("Resolve: %v", err)
		}
	}
	up.calls.Store(0)
	up.maxInflight.Store(0)

	pl.refresh(time.Now().Add(ttl))

	if got := up.calls.Load(); got != n {
		t.Fatalf("upstream calls = %d, want %d", got, n)
	}
	if got := up.maxInflight.Load(); got != preloaderRefreshWorkers {
		t.Fatalf("max in-flight = %d, want %d", got, preloaderRefreshWorkers)
	}
}

// 命中时 RR TTL = max(1, min(原 TTL, ttl) − 已缓存时长)，过期条目给 preloaderStaleTTL，OPT 不动。
func TestPreloaderCachedResponseTTL(t *testing.T) {
	ttl := time.Minute
	pl := newCountingPreloader(&countingUpstream{}, ttl)
	now := time.Now()
	a := func(ttl uint32) dns.RR {
		return &dns.A{Hdr: dns.RR_Header{Name: "x.example.", Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: ttl}, A: net.IPv4(10, 0, 0, 1)}
	}
	tests := []struct {
		name      string
		upstream  uint32
		remaining time.Duration
		want      uint32
	}{
		{"capped by preloader ttl", 300, 20 * time.Second, 20},
		{"shorter upstream ttl kept", 10, 55 * time.Second, 5},
		{"floor at 1s", 10, 30 * time.Second, 1},
		{"stale entry", 300, -time.Second, preloaderStaleTTL},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			opt := &dns.OPT{Hdr: dns.RR_Header{Name: ".", Rrtype: dns.TypeOPT, Ttl: 0x8000}}
			item := TimeItem{ExpiredAt: now.Add(tt.remaining), Item: &dns.Msg{Answer: []dns.RR{a(tt.upstream)}, Extra: []dns.RR{opt}}}
			resp := pl.cachedResponse(item, now)
			if got := resp.Answer[0].Header().Ttl; got != tt.want {
				t.Fatalf("answer ttl = %d, want %d", got, tt.want)
			}
			if got := resp.Extra[0].Header().Ttl; got != 0x8000 {
				t.Fatalf("OPT ttl = %#x, want unchanged", got)
			}
			if got := item.Item.Answer[0].Header().Ttl; got != tt.upstream {
				t.Fatalf("cached item mutated: ttl = %d, want %d", got, tt.upstream)
			}
		})
	}
}

// 首次查询（未命中）返回的应答同样按 preloader ttl 封顶。
func TestPreloaderMissResponseTTLCapped(t *testing.T) {
	pl := newCountingPreloader(&countingUpstream{answer: true}, 10*time.Second) // 上游给 60s
	msg := new(dns.Msg)
	msg.SetQuestion("miss.example.", dns.TypeA)
	resp, err := pl.Resolve(msg)
	if err != nil {
		t.Fatalf("Resolve: %v", err)
	}
	if got := resp.Answer[0].Header().Ttl; got != 10 {
		t.Fatalf("ttl = %d, want 10", got)
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

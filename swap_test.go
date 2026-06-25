package main

import (
	"dns-switchy/config"
	"dns-switchy/resolver"
	"dns-switchy/util"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/miekg/dns"
)

// closeCountingResolver records when Close is called and can block inside
// Resolve to simulate a slow in-flight query that must outlive a swap.
type closeCountingResolver struct {
	closed    int32
	inResolve chan struct{} // signalled when Resolve is entered (optional)
	release   chan struct{} // Resolve blocks until this is closed (optional)
	answerIP  string
}

func (r *closeCountingResolver) Close() {
	atomic.AddInt32(&r.closed, 1)
}

func (r *closeCountingResolver) closeCount() int {
	return int(atomic.LoadInt32(&r.closed))
}

func (r *closeCountingResolver) Accept(*dns.Msg) bool { return true }

func (r *closeCountingResolver) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	if r.inResolve != nil {
		select {
		case r.inResolve <- struct{}{}:
		default:
		}
	}
	if r.release != nil {
		<-r.release
	}
	ip := r.answerIP
	if ip == "" {
		ip = "1.1.1.1"
	}
	return makeAResponse(msg, ip), nil
}

func (r *closeCountingResolver) TTL() time.Duration { return time.Minute }

// TestSwapRetiresAndReusesGenerations checks the basic RCU lifecycle: after a
// swap with no in-flight queries the old generation is closed exactly once and
// the new generation serves subsequent queries.
func TestSwapDeferredCloseAndImmediateActivation(t *testing.T) {
	// A query that blocks inside Resolve, pinning the old generation.
	blocking := &closeCountingResolver{
		answerIP:  "10.0.0.1",
		inResolve: make(chan struct{}, 1),
		release:   make(chan struct{}),
	}
	server := newServerForTest([]resolver.DnsResolver{blocking})

	queryDone := make(chan struct{})
	go func() {
		wire := newCaptureDNSResponseWriter()
		q := makeQuery("pinned.example.", dns.TypeA)
		server.resolveOnly(&DnsWriter{writer: wire, msg: q, start: time.Now().UnixMilli()}, q)
		close(queryDone)
	}()
	<-blocking.inResolve // query is now inside Resolve, holding the generation

	// Swap to a new generation while the old one is still in use.
	newRes := &closeCountingResolver{answerIP: "20.0.0.2"}
	if err := server.swapToResolvers([]resolver.DnsResolver{newRes}); err != nil {
		t.Fatalf("swap fail: %v", err)
	}

	// The old (blocking) generation must NOT be closed yet: a query is in flight.
	time.Sleep(20 * time.Millisecond)
	if blocking.closeCount() != 0 {
		t.Fatalf("old generation closed while query in flight (close=%d)", blocking.closeCount())
	}

	// New generation must already serve queries.
	wire := newCaptureDNSResponseWriter()
	q := makeQuery("fresh.example.", dns.TypeA)
	server.resolveOnly(&DnsWriter{writer: wire, msg: q, start: time.Now().UnixMilli()}, q)
	if wire.msg == nil || len(wire.msg.Answer) == 0 || wire.msg.Answer[0].(*dns.A).A.String() != "20.0.0.2" {
		t.Fatalf("new generation not active; answer=%v", wire.msg)
	}

	// Release the in-flight query: the old generation should close exactly once.
	close(blocking.release)
	<-queryDone
	deadline := time.After(2 * time.Second)
	for blocking.closeCount() == 0 {
		select {
		case <-deadline:
			t.Fatal("old generation never closed after in-flight query finished")
		case <-time.After(5 * time.Millisecond):
		}
	}
	if c := blocking.closeCount(); c != 1 {
		t.Fatalf("old generation close count = %d, want exactly 1", c)
	}
}

// swapToResolvers is a test seam over the real RCU install path: it installs an
// already-built resolver slice (no config parsing) and clears the cache, exactly
// like SwapResolvers does after a successful build.
func (s *DnsSwitchyServer) swapToResolvers(newR []resolver.DnsResolver) error {
	s.installGen(newR)
	s.dnsCache.Clear()
	return nil
}

// TestConcurrentResolveAndSwapNoRace hammers resolveOnly while concurrently
// swapping generations. Run with -race to catch use-after-close / data races.
func TestConcurrentResolveAndSwapNoRace(t *testing.T) {
	server := newServerForTest([]resolver.DnsResolver{&closeCountingResolver{answerIP: "1.1.1.1"}})

	stop := make(chan struct{})
	var wg sync.WaitGroup

	// Query workers.
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case <-stop:
					return
				default:
				}
				wire := newCaptureDNSResponseWriter()
				q := makeQuery("race.example.", dns.TypeA)
				server.resolveOnly(&DnsWriter{writer: wire, msg: q, start: time.Now().UnixMilli()}, q)
			}
		}()
	}

	// Swapper.
	wg.Add(1)
	go func() {
		defer wg.Done()
		for i := 0; i < 200; i++ {
			select {
			case <-stop:
				return
			default:
			}
			_ = server.swapToResolvers([]resolver.DnsResolver{&closeCountingResolver{answerIP: "2.2.2.2"}})
		}
	}()

	time.Sleep(300 * time.Millisecond)
	close(stop)
	wg.Wait()
}

// TestShutdownClosesActiveGenerationOnce verifies Shutdown closes the active
// generation's resolvers exactly once (closeOnce guards against Forward.Close
// non-idempotency).
func TestShutdownClosesActiveGenerationOnce(t *testing.T) {
	res := &closeCountingResolver{}
	server := &DnsSwitchyServer{dnsCache: &util.NoCache{}}
	server.gen.Store(&resolverGen{resolvers: []resolver.DnsResolver{res}})

	server.Shutdown()
	server.Shutdown() // second shutdown must not double-close
	if c := res.closeCount(); c != 1 {
		t.Fatalf("resolver close count = %d, want exactly 1", c)
	}
}

// TestSwapResolversBuildFailureLeavesRunningStateUntouched verifies a failed
// build (e.g. unknown resolver type) does not swap or clear the cache.
func TestSwapResolversBuildFailureLeavesRunningStateUntouched(t *testing.T) {
	res := &closeCountingResolver{answerIP: "1.1.1.1"}
	cache := &fakeCache{}
	server := &DnsSwitchyServer{dnsCache: cache}
	server.gen.Store(&resolverGen{resolvers: []resolver.DnsResolver{res}})

	badConf := &config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{&config.ForwardConfig{Name: "broken"}},
	}
	if err := server.SwapResolvers(badConf); err == nil {
		t.Fatal("SwapResolvers error = nil, want build failure")
	}
	if res.closeCount() != 0 {
		t.Fatalf("old resolver closed on failed swap (close=%d)", res.closeCount())
	}
	if cache.clearCalls != 0 {
		t.Fatalf("cache cleared on failed swap (clears=%d)", cache.clearCalls)
	}
	if gen := server.gen.Load(); gen == nil || len(gen.resolvers) != 1 || gen.resolvers[0] != res {
		t.Fatal("active generation changed on failed swap")
	}
}

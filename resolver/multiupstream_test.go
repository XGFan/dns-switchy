package resolver

import (
	"errors"
	"sync/atomic"
	"testing"
	"time"

	"github.com/AdguardTeam/dnsproxy/upstream"
	"github.com/miekg/dns"
)

// fastUpstream returns a successful reply immediately, winning any race.
type fastUpstream struct{}

func (fastUpstream) Exchange(msg *dns.Msg) (*dns.Msg, error) {
	resp := new(dns.Msg)
	resp.SetReply(msg)
	return resp, nil
}
func (fastUpstream) Address() string { return "fast" }
func (fastUpstream) Close() error    { return nil }

// blockingUpstream blocks inside Exchange until released. It records whether
// Close happened while an Exchange was still in flight (the use-after-close bug)
// and whether Exchange was ever entered after Close returned.
type blockingUpstream struct {
	entered  chan struct{} // signalled once Exchange begins
	release  chan struct{} // closed to let the blocked Exchange return
	inFlight int32         // >0 while Exchange is executing
	closed   int32         // 1 after Close returns
	badClose int32         // 1 if Close ran while an Exchange was in flight
}

func newBlockingUpstream() *blockingUpstream {
	return &blockingUpstream{
		entered: make(chan struct{}, 1),
		release: make(chan struct{}),
	}
}

func (b *blockingUpstream) Exchange(msg *dns.Msg) (*dns.Msg, error) {
	atomic.AddInt32(&b.inFlight, 1)
	select {
	case b.entered <- struct{}{}:
	default:
	}
	<-b.release
	atomic.AddInt32(&b.inFlight, -1)
	return nil, errors.New("blocking upstream lost the race")
}

func (b *blockingUpstream) Address() string { return "blocking" }

func (b *blockingUpstream) Close() error {
	if atomic.LoadInt32(&b.inFlight) > 0 {
		atomic.StoreInt32(&b.badClose, 1)
	}
	atomic.StoreInt32(&b.closed, 1)
	return nil
}

func newMultiUpstreamTestMsg() *dns.Msg {
	msg := new(dns.Msg)
	msg.SetQuestion(dns.Fqdn("example.com"), dns.TypeA)
	return msg
}

// TestMultiUpstreamCloseWaitsForLoser verifies that after a race returns early
// (the fast upstream wins), MultiUpstream.Close() blocks until the slow loser's
// Exchange goroutine has exited before closing the upstreams, so no upstream is
// closed while an Exchange is still in flight. Run with -race.
func TestMultiUpstreamCloseWaitsForLoser(t *testing.T) {
	blocker := newBlockingUpstream()
	mu := NewMultiUpstream([]upstream.Upstream{fastUpstream{}, blocker})

	resp, err := mu.Exchange(newMultiUpstreamTestMsg())
	if err != nil {
		t.Fatalf("Exchange() error = %v, want nil (fast upstream wins)", err)
	}
	if resp == nil {
		t.Fatal("Exchange() resp = nil, want reply from fast upstream")
	}

	// The blocker's Exchange goroutine is still running (parked on release).
	select {
	case <-blocker.entered:
	case <-time.After(2 * time.Second):
		t.Fatal("blocking upstream Exchange never started")
	}
	if atomic.LoadInt32(&blocker.inFlight) != 1 {
		t.Fatalf("blocker inFlight = %d, want 1 (loser still running)", atomic.LoadInt32(&blocker.inFlight))
	}

	// Close must block until the loser exits. Run it in a goroutine, confirm it
	// does not return while the loser is parked, then release the loser.
	closeReturned := make(chan struct{})
	go func() {
		_ = mu.Close()
		close(closeReturned)
	}()

	select {
	case <-closeReturned:
		t.Fatal("Close() returned before the in-flight loser exited")
	case <-time.After(50 * time.Millisecond):
		// expected: Close is still waiting on wg.Wait()
	}

	close(blocker.release)

	select {
	case <-closeReturned:
	case <-time.After(2 * time.Second):
		t.Fatal("Close() did not return after the loser was released")
	}

	if atomic.LoadInt32(&blocker.badClose) != 0 {
		t.Fatal("upstream was closed while an Exchange was still in flight (use-after-close)")
	}
	if atomic.LoadInt32(&blocker.closed) != 1 {
		t.Fatal("blocking upstream was not closed")
	}
}

// TestMultiUpstreamSingleUpstreamSynchronous verifies the single-upstream fast
// path runs synchronously (no racing goroutine) and Close still works.
func TestMultiUpstreamSingleUpstreamSynchronous(t *testing.T) {
	mu := NewMultiUpstream([]upstream.Upstream{fastUpstream{}})
	resp, err := mu.Exchange(newMultiUpstreamTestMsg())
	if err != nil {
		t.Fatalf("Exchange() error = %v, want nil", err)
	}
	if resp == nil {
		t.Fatal("Exchange() resp = nil, want reply")
	}
	if err := mu.Close(); err != nil {
		t.Fatalf("Close() error = %v, want nil", err)
	}
}

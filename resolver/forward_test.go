package resolver

import (
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/miekg/dns"
)

type testForwardErrUpstream struct {
	err error
}

func (up testForwardErrUpstream) Exchange(*dns.Msg) (*dns.Msg, error) {
	return nil, up.err
}

func (up testForwardErrUpstream) Address() string {
	return "test-forward-error"
}

func (up testForwardErrUpstream) Close() error {
	return nil
}

type testForwardSuccessUpstream struct {
}

func (testForwardSuccessUpstream) Exchange(msg *dns.Msg) (*dns.Msg, error) {
	resp := new(dns.Msg)
	resp.SetReply(msg)
	return resp, nil
}

func (testForwardSuccessUpstream) Address() string {
	return "test-forward-success"
}

func (testForwardSuccessUpstream) Close() error {
	return nil
}

type testForwardProbeUpstream struct {
	entered  chan *dns.Msg
	release  chan struct{}
	observed chan string
}

func (up *testForwardProbeUpstream) Exchange(msg *dns.Msg) (*dns.Msg, error) {
	up.entered <- msg
	<-up.release
	up.observed <- msg.Question[0].Name

	resp := new(dns.Msg)
	resp.SetReply(msg)
	return resp, nil
}

func (*testForwardProbeUpstream) Address() string {
	return "test-forward-probe"
}

func (*testForwardProbeUpstream) Close() error {
	return nil
}

func newForwardTestMsg(name string) *dns.Msg {
	msg := new(dns.Msg)
	msg.SetQuestion(dns.Fqdn(name), dns.TypeA)
	return msg
}

func waitForForwardStat(t *testing.T, stat *ForwardStat, wantAlive bool, wantFailCount int, wantSuccessCount int) {
	t.Helper()

	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		alive, failCount, successCount := stat.snapshot()
		if alive == wantAlive && failCount == wantFailCount && successCount == wantSuccessCount {
			return
		}
		time.Sleep(time.Millisecond)
	}

	alive, failCount, successCount := stat.snapshot()
	t.Fatalf("ForwardStat = {alive:%v failCount:%d successCount:%d}, want {alive:%v failCount:%d successCount:%d}", alive, failCount, successCount, wantAlive, wantFailCount, wantSuccessCount)
}

func runConcurrentForwardStatUpdates(stat *ForwardStat, workers int, err error) int {
	start := make(chan struct{})
	changed := make(chan struct{}, workers)
	var wg sync.WaitGroup

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-start
			if statusChanged, _ := stat.checkStatus(err); statusChanged {
				changed <- struct{}{}
			}
		}()
	}

	close(start)
	wg.Wait()
	close(changed)

	count := 0
	for range changed {
		count++
	}
	return count
}

func TestForwardStatResolveMarksDeadAfterFiveFailures(t *testing.T) {
	forward := &Forward{
		Name:     "test-forward-dead-threshold",
		Upstream: testForwardErrUpstream{err: errors.New("boom")},
		stat:     ForwardStat{alive: true},
	}

	for i := 1; i <= 4; i++ {
		resp, err := forward.Resolve(newForwardTestMsg("example.com"))
		if err == nil {
			t.Fatal("Resolve() error = nil, want upstream error")
		}
		if resp != nil {
			t.Fatalf("Resolve() resp = %v, want nil", resp)
		}

		alive, failCount, successCount := forward.stat.snapshot()
		if !alive {
			t.Fatalf("after %d failures alive = false, want true", i)
		}
		if failCount != i {
			t.Fatalf("after %d failures failCount = %d, want %d", i, failCount, i)
		}
		if successCount != 0 {
			t.Fatalf("after %d failures successCount = %d, want 0", i, successCount)
		}
	}

	resp, err := forward.Resolve(newForwardTestMsg("example.com"))
	if err == nil {
		t.Fatal("Resolve() error = nil, want upstream error")
	}
	if resp != nil {
		t.Fatalf("Resolve() resp = %v, want nil", resp)
	}

	alive, failCount, successCount := forward.stat.snapshot()
	if alive {
		t.Fatal("alive = true after 5 failures, want false")
	}
	if failCount != 0 {
		t.Fatalf("failCount = %d after death transition, want 0", failCount)
	}
	if successCount != 0 {
		t.Fatalf("successCount = %d after death transition, want 0", successCount)
	}
}

func TestForwardStatDeadProbeMarksAliveAfterFiveSuccesses(t *testing.T) {
	forward := &Forward{
		Name:     "test-forward-alive-threshold",
		Upstream: testForwardSuccessUpstream{},
		stat:     ForwardStat{alive: false},
	}

	for i := 1; i <= 4; i++ {
		resp, err := forward.Resolve(newForwardTestMsg("example.com"))
		if err == nil {
			t.Fatal("Resolve() error = nil on dead path, want skip error")
		}
		if resp != nil {
			t.Fatalf("Resolve() resp = %v, want nil on dead path", resp)
		}
		waitForForwardStat(t, &forward.stat, false, 0, i)
	}

	resp, err := forward.Resolve(newForwardTestMsg("example.com"))
	if err == nil {
		t.Fatal("Resolve() error = nil on dead path, want skip error")
	}
	if resp != nil {
		t.Fatalf("Resolve() resp = %v, want nil on dead path", resp)
	}
	waitForForwardStat(t, &forward.stat, true, 0, 0)
}

func TestForwardStatDeadProbeUsesCopiedMessage(t *testing.T) {
	upstream := &testForwardProbeUpstream{
		entered:  make(chan *dns.Msg, 1),
		release:  make(chan struct{}),
		observed: make(chan string, 1),
	}
	forward := &Forward{
		Name:     "test-forward-probe-copy",
		Upstream: upstream,
		stat:     ForwardStat{alive: false},
	}
	msg := newForwardTestMsg("example.com")

	resp, err := forward.Resolve(msg)
	if err == nil {
		t.Fatal("Resolve() error = nil on dead path, want skip error")
	}
	if resp != nil {
		t.Fatalf("Resolve() resp = %v, want nil on dead path", resp)
	}

	probeMsg := <-upstream.entered
	msg.Question[0].Name = "mutated.example."
	close(upstream.release)

	seenName := <-upstream.observed
	if probeMsg == msg {
		t.Fatal("dead-path probe received caller-owned message pointer, want copied message")
	}
	if seenName != "example.com." {
		t.Fatalf("dead-path probe question = %q, want %q", seenName, "example.com.")
	}
}

func TestForwardStatConcurrentTransitions(t *testing.T) {
	stat := &ForwardStat{alive: true}

	changedCount := runConcurrentForwardStatUpdates(stat, 10, errors.New("boom"))
	if changedCount != 1 {
		t.Fatalf("failure transition count = %d, want 1", changedCount)
	}
	if alive, failCount, successCount := stat.snapshot(); alive || failCount != 0 || successCount != 0 {
		t.Fatalf("after concurrent failures ForwardStat = {alive:%v failCount:%d successCount:%d}, want {alive:false failCount:0 successCount:0}", alive, failCount, successCount)
	}

	changedCount = runConcurrentForwardStatUpdates(stat, 10, nil)
	if changedCount != 1 {
		t.Fatalf("recovery transition count = %d, want 1", changedCount)
	}
	if alive, failCount, successCount := stat.snapshot(); !alive || failCount != 0 || successCount != 0 {
		t.Fatalf("after concurrent successes ForwardStat = {alive:%v failCount:%d successCount:%d}, want {alive:true failCount:0 successCount:0}", alive, failCount, successCount)
	}
}

package resolver

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/miekg/dns"
)

type testForwardErrUpstream struct {
	err error
}

func (up testForwardErrUpstream) Exchange(context.Context, *dns.Msg) (*dns.Msg, error) {
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

func (testForwardSuccessUpstream) Exchange(_ context.Context, msg *dns.Msg) (*dns.Msg, error) {
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

func (up *testForwardProbeUpstream) Exchange(_ context.Context, msg *dns.Msg) (*dns.Msg, error) {
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

// byNameUpstream fails queries for names in fail and answers the rest.
type byNameUpstream struct{ fail map[string]bool }

func (u byNameUpstream) Exchange(_ context.Context, msg *dns.Msg) (*dns.Msg, error) {
	if u.fail[msg.Question[0].Name] {
		return nil, errors.New("i/o timeout")
	}
	resp := new(dns.Msg)
	resp.SetReply(msg)
	return resp, nil
}
func (byNameUpstream) Address() string { return "by-name" }
func (byNameUpstream) Close() error    { return nil }

// 线上场景：个别公网 ip6.arpa 反查持续超时，曾让 dnsmasq 被判死、*.lan 全部 SERVFAIL。
// break-on-fail 的 resolver 不判死：坏名字各自失败（带原因、仍是 BreakError），好名字照常解析。
func TestForwardBreakOnFailDoesNotTripOnPerNameFailures(t *testing.T) {
	bad := "1.0.0.0.ip6.arpa."
	forward := &Forward{
		Name:        "dnsmasq",
		Upstream:    byNameUpstream{fail: map[string]bool{bad: true}},
		stat:        ForwardStat{alive: true},
		breakOnFail: true,
	}
	query := func(name string) (*dns.Msg, error) {
		msg := new(dns.Msg)
		msg.SetQuestion(name, dns.TypePTR)
		return forward.Resolve(msg)
	}
	for i := 0; i < 10; i++ {
		_, err := query(bad)
		if !errors.Is(err, BreakError) {
			t.Fatalf("failure %d: err = %v, want BreakError", i, err)
		}
		if !strings.Contains(err.Error(), "i/o timeout") {
			t.Fatalf("failure %d: err = %q, want upstream cause kept", i, err)
		}
	}
	if resp, err := query("host.lan."); err != nil || resp == nil {
		t.Fatalf("good name after 10 failures: resp=%v err=%v, want answer", resp, err)
	}
}

func TestUpstreamLoggerDropsOnlyExchangeResult(t *testing.T) {
	var buf bytes.Buffer
	l := slog.New(dropMsgHandler{Handler: slog.NewTextHandler(&buf, nil), msg: "response received"})
	l.Error("response received", "addr", "127.0.0.1:1053")
	if buf.Len() != 0 {
		t.Fatalf("per-exchange log not dropped: %s", buf.String())
	}
	l.With("k", "v").Warn("bootstrap failed")
	if !strings.Contains(buf.String(), "bootstrap failed") || !strings.Contains(buf.String(), "k=v") {
		t.Fatalf("other logs must pass through, got %q", buf.String())
	}
}

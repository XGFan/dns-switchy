package nftset

import (
	"context"
	"errors"
	"net"
	"reflect"
	"testing"
	"time"
)

type recordWriter struct {
	calls [][]string
	err   error
}

func (r *recordWriter) Add(_ context.Context, _ string, ips []net.IP, _ time.Duration) error {
	got := make([]string, 0, len(ips))
	for _, ip := range ips {
		got = append(got, ip.String())
	}
	r.calls = append(r.calls, got)
	return r.err
}

func newTestDedup(inner Writer, now *time.Time) *dedupWriter {
	d := NewDedupWriter(inner).(*dedupWriter)
	d.now = func() time.Time { return *now }
	return d
}

func TestDedupWriterSkipsWithinWindowAndRewritesAfter(t *testing.T) {
	now := time.Unix(1_000_000, 0)
	inner := &recordWriter{}
	d := newTestDedup(inner, &now)
	ip := []net.IP{net.ParseIP("10.0.0.1")}
	ctx := context.Background()

	_ = d.Add(ctx, "corp4", ip, time.Hour) // 窗口 = min(30m, 1m) = 1m
	now = now.Add(59 * time.Second)
	_ = d.Add(ctx, "corp4", ip, time.Hour)
	if len(inner.calls) != 1 {
		t.Fatalf("writes within window = %d, want 1", len(inner.calls))
	}
	now = now.Add(2 * time.Second)
	_ = d.Add(ctx, "corp4", ip, time.Hour)
	if len(inner.calls) != 2 {
		t.Fatalf("writes after window = %d, want 2 (firewall reload may have flushed the set)", len(inner.calls))
	}
	// 短 ttl：窗口取 ttl/2。
	_ = d.Add(ctx, "short", ip, 10*time.Second)
	now = now.Add(6 * time.Second)
	_ = d.Add(ctx, "short", ip, 10*time.Second)
	if len(inner.calls) != 4 {
		t.Fatalf("writes with 10s ttl after 6s = %d, want 4", len(inner.calls))
	}
}

func TestDedupWriterOnlyWritesNewIPsAndRetriesFailures(t *testing.T) {
	now := time.Unix(1_000_000, 0)
	inner := &recordWriter{}
	d := newTestDedup(inner, &now)
	ctx := context.Background()
	a, b := net.ParseIP("10.0.0.1"), net.ParseIP("10.0.0.2")

	_ = d.Add(ctx, "corp4", []net.IP{a}, time.Hour)
	_ = d.Add(ctx, "corp4", []net.IP{a, b}, time.Hour)
	if want := [][]string{{"10.0.0.1"}, {"10.0.0.2"}}; !reflect.DeepEqual(inner.calls, want) {
		t.Fatalf("calls = %v, want %v", inner.calls, want)
	}

	inner.err = errors.New("nft failed")
	c := []net.IP{net.ParseIP("10.0.0.3")}
	if err := d.Add(ctx, "corp4", c, time.Hour); err == nil {
		t.Fatal("Add error = nil, want inner failure")
	}
	inner.err = nil
	_ = d.Add(ctx, "corp4", c, time.Hour)
	if got := inner.calls[len(inner.calls)-1]; !reflect.DeepEqual(got, []string{"10.0.0.3"}) || len(inner.calls) != 4 {
		t.Fatalf("calls = %v, want failed IP retried", inner.calls)
	}
}

// 不同 nftset_ttl 的 resolver 写同一集合：短 timeout 的写入不能挡住长 timeout 的写入，
// 否则长 TTL 一侧缓存的应答会比集合条目活得久。永久条目则总能顶替。
func TestDedupWriterShortTimeoutDoesNotSuppressLongerOne(t *testing.T) {
	now := time.Unix(1_000_000, 0)
	inner := &recordWriter{}
	d := newTestDedup(inner, &now)
	ctx := context.Background()
	ip := []net.IP{net.ParseIP("10.1.2.3")}

	_ = d.Add(ctx, "corp4", ip, time.Minute)
	now = now.Add(5 * time.Second)
	_ = d.Add(ctx, "corp4", ip, time.Hour)
	if len(inner.calls) != 2 {
		t.Fatalf("writes = %d, want 2 (1h write must not be suppressed by a 1m entry)", len(inner.calls))
	}

	_ = d.Add(ctx, "perm", ip, 0)
	now = now.Add(5 * time.Second)
	_ = d.Add(ctx, "perm", ip, time.Hour)
	if len(inner.calls) != 3 {
		t.Fatalf("writes = %d, want 3 (permanent entry covers any timeout within the window)", len(inner.calls))
	}
}

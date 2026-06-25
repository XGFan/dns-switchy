package nftset

import (
	"context"
	"errors"
	"net"
	"testing"
	"time"
)

// --- buildElementSpec 单测 ---

func TestBuildElementSpec_SingleIP_WithTTL(t *testing.T) {
	ips := []net.IP{net.ParseIP("1.2.3.4")}
	got := buildElementSpec(ips, 60*time.Second)
	want := "{ 1.2.3.4 timeout 60s }"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestBuildElementSpec_MultipleIPs_WithTTL(t *testing.T) {
	ips := []net.IP{net.ParseIP("1.2.3.4"), net.ParseIP("5.6.7.8")}
	got := buildElementSpec(ips, 3600*time.Second)
	want := "{ 1.2.3.4 timeout 3600s, 5.6.7.8 timeout 3600s }"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestBuildElementSpec_NoTTL(t *testing.T) {
	ips := []net.IP{net.ParseIP("10.0.0.1"), net.ParseIP("10.0.0.2")}
	got := buildElementSpec(ips, 0)
	want := "{ 10.0.0.1, 10.0.0.2 }"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestBuildElementSpec_NegativeTTL_NoTimeout(t *testing.T) {
	ips := []net.IP{net.ParseIP("192.168.1.1")}
	got := buildElementSpec(ips, -1*time.Second)
	want := "{ 192.168.1.1 }"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

// --- Add 行为单测（注入假 runner）---

// captureRunner 捕获调用参数，供验证使用。
type captureRunner struct {
	called bool
	args   []string
	err    error
}

func (c *captureRunner) run(ctx context.Context, args []string) error {
	c.called = true
	c.args = args
	return c.err
}

func newTestWriter(table string, cr *captureRunner) *execWriter {
	if table == "" {
		table = "inet fw4"
	}
	return &execWriter{table: table, run: cr.run}
}

func TestAdd_EmptyIPs_DoesNotCallRunner(t *testing.T) {
	cr := &captureRunner{}
	w := newTestWriter("inet fw4", cr)
	err := w.Add(context.Background(), "corp4", nil, 60*time.Second)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if cr.called {
		t.Error("runner should not be called for empty ips")
	}
}

func TestAdd_SingleIP_RunnerCalledWithCorrectArgs(t *testing.T) {
	cr := &captureRunner{}
	w := newTestWriter("inet fw4", cr)
	ips := []net.IP{net.ParseIP("1.2.3.4")}
	err := w.Add(context.Background(), "corp4", ips, 60*time.Second)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !cr.called {
		t.Fatal("runner was not called")
	}
	// args: ["add", "element", "inet fw4", "corp4", "{ 1.2.3.4 timeout 60s }"]
	if len(cr.args) != 5 {
		t.Fatalf("expected 5 args, got %d: %v", len(cr.args), cr.args)
	}
	if cr.args[0] != "add" || cr.args[1] != "element" {
		t.Errorf("unexpected args prefix: %v", cr.args)
	}
	if cr.args[2] != "inet fw4" {
		t.Errorf("expected table 'inet fw4', got %q", cr.args[2])
	}
	if cr.args[3] != "corp4" {
		t.Errorf("expected set 'corp4', got %q", cr.args[3])
	}
	wantSpec := "{ 1.2.3.4 timeout 60s }"
	if cr.args[4] != wantSpec {
		t.Errorf("expected spec %q, got %q", wantSpec, cr.args[4])
	}
}

func TestAdd_RunnerFailure_ErrorReturned(t *testing.T) {
	fakeErr := errors.New("stderr: No such file or directory")
	cr := &captureRunner{err: fakeErr}
	w := newTestWriter("inet fw4", cr)
	ips := []net.IP{net.ParseIP("1.2.3.4")}
	err := w.Add(context.Background(), "corp4", ips, 60*time.Second)
	if err == nil {
		t.Fatal("expected error from runner, got nil")
	}
}

func TestAdd_MultipleIPs_MergedIntoOneCall(t *testing.T) {
	cr := &captureRunner{}
	w := newTestWriter("inet fw4", cr)
	ips := []net.IP{net.ParseIP("1.1.1.1"), net.ParseIP("2.2.2.2"), net.ParseIP("3.3.3.3")}
	err := w.Add(context.Background(), "corp4", ips, 3600*time.Second)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// 只应调用一次（多 IP 合并一条）
	if !cr.called {
		t.Fatal("runner was not called")
	}
	wantSpec := "{ 1.1.1.1 timeout 3600s, 2.2.2.2 timeout 3600s, 3.3.3.3 timeout 3600s }"
	if cr.args[4] != wantSpec {
		t.Errorf("expected spec %q, got %q", wantSpec, cr.args[4])
	}
}

func TestAdd_ZeroTTL_NoTimeoutInSpec(t *testing.T) {
	cr := &captureRunner{}
	w := newTestWriter("inet fw4", cr)
	ips := []net.IP{net.ParseIP("10.0.0.1")}
	err := w.Add(context.Background(), "corp4", ips, 0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	wantSpec := "{ 10.0.0.1 }"
	if cr.args[4] != wantSpec {
		t.Errorf("expected spec %q, got %q", wantSpec, cr.args[4])
	}
}

func TestNewExecWriter_DefaultTable(t *testing.T) {
	w := NewExecWriter("")
	ew, ok := w.(*execWriter)
	if !ok {
		t.Fatal("NewExecWriter should return *execWriter")
	}
	if ew.table != "inet fw4" {
		t.Errorf("expected default table 'inet fw4', got %q", ew.table)
	}
}

func TestNewExecWriter_CustomTable(t *testing.T) {
	w := NewExecWriter("ip myTable")
	ew, ok := w.(*execWriter)
	if !ok {
		t.Fatal("NewExecWriter should return *execWriter")
	}
	if ew.table != "ip myTable" {
		t.Errorf("expected table 'ip myTable', got %q", ew.table)
	}
}

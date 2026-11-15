package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"dns-switchy/config"
	"dns-switchy/resolver"

	"github.com/miekg/dns"
)

func captureLog(t *testing.T) *bytes.Buffer {
	t.Helper()
	var buf bytes.Buffer
	prev := log.Writer()
	log.SetOutput(&buf)
	t.Cleanup(func() { log.SetOutput(prev) })
	return &buf
}

// query_log 控制日志量，但统计不受影响。
func TestDnsWriterQueryLogModes(t *testing.T) {
	cases := []struct {
		mode                  config.QueryLog
		logSuccess, logFailed bool
	}{
		{config.QueryLogAll, true, true},
		{config.QueryLogErrors, false, true},
		{config.QueryLogOff, false, false},
	}
	for _, c := range cases {
		t.Run(string(c.mode), func(t *testing.T) {
			buf := captureLog(t)
			stats := newQueryStats()
			query := makeQuery("mode.example.", dns.TypeA)
			w := &DnsWriter{writer: newCaptureDNSResponseWriter(), msg: query, start: time.Now().UnixMilli(), queryLog: c.mode, stats: stats}

			w.Success("up", makeAResponse(query, "1.1.1.1"))
			if got := buf.Len() > 0; got != c.logSuccess {
				t.Fatalf("success logged = %v, want %v", got, c.logSuccess)
			}
			buf.Reset()
			w.Fail("up", errors.New("boom"))
			if got := buf.Len() > 0; got != c.logFailed {
				t.Fatalf("failure logged = %v, want %v", got, c.logFailed)
			}
			snap := stats.snapshot(nil)
			if snap.Total != 2 || snap.Rcodes["NOERROR"] != 1 || snap.Rcodes["SERVFAIL"] != 1 {
				t.Fatalf("stats = %+v, want total 2 (1 NOERROR, 1 SERVFAIL)", snap)
			}
		})
	}
}

type healthResolver struct {
	testResolver
	alive bool
}

func (h *healthResolver) Alive() bool    { return h.alive }
func (h *healthResolver) String() string { return "fwd" }

type namedResolver struct{ testResolver }

func (namedResolver) String() string { return "filter" }

func TestApiStatsReportsChainOrderCountsAndHealth(t *testing.T) {
	fwd := &healthResolver{alive: false}
	fwd.acceptFn = func(*dns.Msg) bool { return true }
	fwd.resolveFn = func(msg *dns.Msg) (*dns.Msg, error) { return makeAResponse(msg, "2.2.2.2"), nil }
	chain := []resolver.DnsResolver{&namedResolver{}, fwd}
	srv := newServerForTest(chain)
	srv.stats = newQueryStats()
	_ = captureLog(t)

	query := makeQuery("stats.example.", dns.TypeA)
	w := &DnsWriter{writer: newCaptureDNSResponseWriter(), msg: query, start: time.Now().UnixMilli(), queryLog: config.QueryLogOff, stats: srv.stats}
	srv.dnsMsgHandler(w, query)
	w.Success(cacheHitName, makeAResponse(query, "2.2.2.2"))
	w.Fail(fwd, errors.New("timeout"))

	rec := httptest.NewRecorder()
	srv.apiStatsHandler(rec, httptest.NewRequest(http.MethodGet, "/api/stats", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var got statsResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("decode %s: %v", rec.Body.String(), err)
	}
	if got.Total != 3 || got.CacheHits != 1 {
		t.Fatalf("total=%d cache_hits=%d, want 3/1", got.Total, got.CacheHits)
	}
	if len(got.Resolvers) != 2 || got.Resolvers[0].Name != "filter" || got.Resolvers[1].Name != "fwd" {
		t.Fatalf("resolvers = %+v, want chain order [filter fwd]", got.Resolvers)
	}
	f := got.Resolvers[1]
	if f.Queries != 2 || f.Failures != 1 || f.Alive == nil || *f.Alive {
		t.Fatalf("fwd = %+v, want queries 2, failures 1, alive false", f)
	}
	if got.Resolvers[0].Alive != nil {
		t.Fatalf("filter alive = %v, want omitted for resolvers without health tracking", *got.Resolvers[0].Alive)
	}
}

// 改顶层字段触发整体重建，统计不能清零。
func TestReloadServerCarriesStatsAcrossRebuild(t *testing.T) {
	addr := reserveUDPAddr(t)
	running, err := reloadServer(nil, mockConfig(t, addr, "1.1.1.1"))
	if err != nil {
		t.Fatalf("initial reloadServer: %v", err)
	}
	shutdownOnCleanup(t, &running)
	queryA(t, "udp", addr, "mock.example")
	running, err = reloadServer(running, mockConfig(t, addr, "2.2.2.2"))
	if err != nil {
		t.Fatalf("reloadServer: %v", err)
	}
	queryA(t, "udp", addr, "mock.example")
	if snap := running.stats.snapshot(nil); snap.Total != 2 {
		t.Fatalf("total after rebuild = %d, want 2", snap.Total)
	}
}

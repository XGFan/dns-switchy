package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"dns-switchy/config"
)

// 两个并发 POST 带同一个 version：乐观锁必须让恰好一个成功、另一个撞 409。
//
// 没有 writeMu 时两边都能通过版本比较（各自读到的都还是旧内容），于是先后写盘，
// 后写的静默覆盖先写的——版本号根本没起到作用。这个测试锁的就是那条竞态。
func TestConcurrentConfigPostOnlyOneWins(t *testing.T) {
	server, ctl, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	raw, err := ctl.Load()
	if err != nil {
		t.Fatalf("load config: %v", err)
	}
	doc, err := config.LoadDoc(strings.NewReader(string(raw)))
	if err != nil {
		t.Fatalf("load doc: %v", err)
	}
	canonical, err := config.MarshalDoc(doc)
	if err != nil {
		t.Fatalf("marshal doc: %v", err)
	}
	version := config.ConfigVersion(canonical)

	const writers = 2
	var wg sync.WaitGroup
	codes := make([]int, writers)
	start := make(chan struct{})
	for i := 0; i < writers; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			body := fmt.Sprintf(
				`{"version":%q,"resolvers":[{"type":"forward","name":"w%d","url":"114.114.114.114"}]}`,
				version, idx,
			)
			<-start // 尽量让两个请求同时进 handler
			resp := doJSON(t, ts, http.MethodPost, "/api/config", body, nil)
			defer resp.Body.Close()
			codes[idx] = resp.StatusCode
		}(i)
	}
	close(start)
	wg.Wait()

	var ok, conflict int
	for _, c := range codes {
		switch c {
		case http.StatusOK:
			ok++
		case http.StatusConflict:
			conflict++
		default:
			t.Fatalf("unexpected status %d (want 200 or 409), all=%v", c, codes)
		}
	}
	if ok != 1 || conflict != 1 {
		t.Fatalf("concurrent writes: got %d ok / %d conflict, want exactly 1 / 1 (codes=%v)", ok, conflict, codes)
	}
}

// api_key 写了但全是空白：必须拒绝启动，不能静默退化成「不鉴权」。
func TestParseConfigRejectsWhitespaceAPIKey(t *testing.T) {
	for _, blank := range []string{`"   "`, `"\t"`, `" "`} {
		yaml := "addr: \":1053\"\napi_key: " + blank + "\nresolvers: []\n"
		if _, err := config.ParseConfig(strings.NewReader(yaml)); err == nil {
			t.Fatalf("api_key=%s parsed fine, want an error (silently disabling auth is the dangerous case)", blank)
		} else if !strings.Contains(err.Error(), "api_key") {
			t.Fatalf("error should mention api_key, got: %v", err)
		}
	}
}

package main

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"dns-switchy/config"
)

const testAPIKey = "s3cr3t-key"

// newAuthServer 复用 config 编辑器的临时配置，再挂上 api key。
func newAuthServer(t *testing.T, apiKey string) *httptest.Server {
	t.Helper()
	server, _, _ := newConfigEditorServer(t)
	server.apiKey = apiKey
	ts := httptest.NewServer(server.httpMux())
	t.Cleanup(ts.Close)
	return ts
}

func do(t *testing.T, ts *httptest.Server, method, path, body string, headers map[string]string) *http.Response {
	t.Helper()
	var rdr io.Reader
	if body != "" {
		rdr = strings.NewReader(body)
	}
	req, err := http.NewRequest(method, ts.URL+path, rdr)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	resp, err := ts.Client().Do(req)
	if err != nil {
		t.Fatalf("do request: %v", err)
	}
	t.Cleanup(func() { _ = resp.Body.Close() })
	return resp
}

// 未配置 api_key 时行为完全不变：所有 /api/* 无需任何头即可访问。
func TestAPIKeyDisabledKeepsEndpointsOpen(t *testing.T) {
	ts := newAuthServer(t, "")
	for _, path := range []string{"/api/query?question=example.com&type=A", "/api/config"} {
		resp := do(t, ts, http.MethodGet, path, "", nil)
		if resp.StatusCode == http.StatusUnauthorized {
			t.Fatalf("GET %s = 401 with no api_key configured, want open access", path)
		}
	}
}

func TestAPIKeyRequiredOnAllAPIEndpoints(t *testing.T) {
	ts := newAuthServer(t, testAPIKey)
	json := map[string]string{"Content-Type": "application/json"}
	withKey := map[string]string{"Content-Type": "application/json", apiKeyHeader: testAPIKey}

	cases := []struct {
		name, method, path, body string
		headers                  map[string]string
	}{
		{"QueryGet", http.MethodGet, "/api/query?question=example.com&type=A", "", nil},
		{"ConfigGet", http.MethodGet, "/api/config", "", nil},
		{"ConfigPost", http.MethodPost, "/api/config", `{"version":"x","resolvers":[]}`, json},
		{"ConfigValidate", http.MethodPost, "/api/config/validate", `{"resolvers":[]}`, json},
	}
	for _, c := range cases {
		t.Run(c.name+"/NoKey", func(t *testing.T) {
			resp := do(t, ts, c.method, c.path, c.body, c.headers)
			if resp.StatusCode != http.StatusUnauthorized {
				t.Fatalf("%s %s without key = %d, want 401", c.method, c.path, resp.StatusCode)
			}
		})
		t.Run(c.name+"/WrongKey", func(t *testing.T) {
			h := map[string]string{"Content-Type": "application/json", apiKeyHeader: "nope"}
			resp := do(t, ts, c.method, c.path, c.body, h)
			if resp.StatusCode != http.StatusUnauthorized {
				t.Fatalf("%s %s with wrong key = %d, want 401", c.method, c.path, resp.StatusCode)
			}
		})
	}

	// 带对的 key 时请求能走到业务逻辑（不再是 401）。
	t.Run("ValidateWithKeyReachesHandler", func(t *testing.T) {
		resp := do(t, ts, http.MethodPost, "/api/config/validate", `{"resolvers":[]}`, withKey)
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("validate with key = %d, want 200", resp.StatusCode)
		}
	})
	t.Run("ConfigGetWithKey", func(t *testing.T) {
		resp := do(t, ts, http.MethodGet, "/api/config", "", map[string]string{apiKeyHeader: testAPIKey})
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("config GET with key = %d, want 200", resp.StatusCode)
		}
	})
}

// 静态资源（宿主页 / panel.js）不鉴权，否则 standalone 下连输 key 的界面都打不开。
func TestStaticAssetsAreNotAuthenticated(t *testing.T) {
	ts := newAuthServer(t, testAPIKey)
	for _, path := range []string{"/", "/panel.js"} {
		resp := do(t, ts, http.MethodGet, path, "", nil)
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("GET %s = %d, want 200 (static assets must stay open)", path, resp.StatusCode)
		}
	}
}

// 面板契约：/panel.js 必须带 no-cache。
func TestPanelJSNoCache(t *testing.T) {
	ts := newAuthServer(t, "")
	resp := do(t, ts, http.MethodGet, "/panel.js", "", nil)
	if got := resp.Header.Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("/panel.js Cache-Control = %q, want %q", got, "no-cache")
	}
	body, _ := io.ReadAll(resp.Body)
	if !bytes.Contains(body, []byte("dns-panel")) {
		t.Fatalf("/panel.js does not register dns-panel; embedded bundle looks wrong")
	}
}

// api-key 启用后，同源(Origin/Referer)校验被取代：跨源但 key 正确的写请求应放行。
func TestAPIKeyReplacesSameOriginGuard(t *testing.T) {
	ts := newAuthServer(t, testAPIKey)
	resp := do(t, ts, http.MethodPost, "/api/config/validate", `{"resolvers":[]}`, map[string]string{
		"Content-Type": "application/json",
		"Origin":       "http://console.example.com",
		apiKeyHeader:   testAPIKey,
	})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("cross-origin write with valid key = %d, want 200 (api-key supersedes origin check)", resp.StatusCode)
	}
}

// 未配置 api_key 时，原有的同源保护必须原样保留。
func TestSameOriginGuardKeptWithoutAPIKey(t *testing.T) {
	ts := newAuthServer(t, "")
	resp := do(t, ts, http.MethodPost, "/api/config/validate", `{"resolvers":[]}`, map[string]string{
		"Content-Type": "application/json",
		"Origin":       "http://evil.example.com",
	})
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("cross-origin write without api_key = %d, want 403", resp.StatusCode)
	}
}

// Content-Type 与 body 上限的保护不受鉴权影响。
func TestContentTypeGuardStillEnforcedWithAPIKey(t *testing.T) {
	ts := newAuthServer(t, testAPIKey)
	resp := do(t, ts, http.MethodPost, "/api/config", `{}`, map[string]string{
		"Content-Type": "text/plain",
		apiKeyHeader:   testAPIKey,
	})
	if resp.StatusCode != http.StatusUnsupportedMediaType {
		t.Fatalf("text/plain with key = %d, want 415", resp.StatusCode)
	}
}

func TestAPIKeyMatches(t *testing.T) {
	if !apiKeyMatches("abc", "abc") {
		t.Fatal("identical keys should match")
	}
	for _, got := range []string{"", "ab", "abcd", "ABC"} {
		if apiKeyMatches("abc", got) {
			t.Fatalf("key %q should not match %q", got, "abc")
		}
	}
}

// api_key 是配置的一部分，但不该原样回给前端。
func TestConfigGetRedactsAPIKey(t *testing.T) {
	server, ctl, _ := newConfigEditorServer(t)
	server.apiKey = testAPIKey
	if err := ctl.Save([]byte("addr: \"0.0.0.0:1153\"\napi_key: " + testAPIKey + "\nresolvers: []\n")); err != nil {
		t.Fatalf("save config: %v", err)
	}
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	resp := do(t, ts, http.MethodGet, "/api/config", "", map[string]string{apiKeyHeader: testAPIKey})
	body, _ := io.ReadAll(resp.Body)
	if bytes.Contains(body, []byte(testAPIKey)) {
		t.Fatalf("GET /api/config leaked the api key: %s", body)
	}
	if !bytes.Contains(body, []byte(`"api_key":"***"`)) {
		t.Fatalf("GET /api/config should mask api_key, got: %s", body)
	}
}

// api_key 从 yaml 解析进配置，并且前后空白被清掉。
func TestParseConfigReadsAPIKey(t *testing.T) {
	conf, err := config.ParseConfig(strings.NewReader("addr: \":1053\"\napi_key: \"  k1  \"\nresolvers: []\n"))
	if err != nil {
		t.Fatalf("parse: %v", err)
	}
	if conf.ApiKey != "k1" {
		t.Fatalf("ApiKey = %q, want %q", conf.ApiKey, "k1")
	}

	noKey, err := config.ParseConfig(strings.NewReader("addr: \":1053\"\nresolvers: []\n"))
	if err != nil {
		t.Fatalf("parse: %v", err)
	}
	if noKey.ApiKey != "" {
		t.Fatalf("ApiKey = %q, want empty when unset", noKey.ApiKey)
	}
}

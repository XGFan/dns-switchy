package main

import (
	"bytes"
	"dns-switchy/util"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const sampleConfig = `addr: "0.0.0.0:1153"
ttl: 5m
http: :7070
nftset_table: inet fw4
resolvers:
    - name: cn
      type: forward
      ttl: 600s
      rule:
        - v2fly:cn
        - "!ads.qq.com"
      url: 114.114.114.114
    - type: mock
      queryType:
        - A
      rule:
        - mock.example
      answer: 1.2.3.4
`

// newConfigEditorServer writes sampleConfig to a temp file and returns a server
// wired with a ConfigController plus an httptest.Server fronting its mux.
func newConfigEditorServer(t *testing.T) (*DnsSwitchyServer, *ConfigController, string) {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(path, []byte(sampleConfig), 0600); err != nil {
		t.Fatalf("write config: %v", err)
	}
	server := &DnsSwitchyServer{dnsCache: &util.NoCache{}}
	server.gen.Store(&resolverGen{})
	ctl := NewConfigController(path, server, nil)
	server.configCtl = ctl
	return server, ctl, path
}

func doJSON(t *testing.T, ts *httptest.Server, method, path, body string, headers map[string]string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(method, ts.URL+path, strings.NewReader(body))
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	if headers == nil {
		headers = map[string]string{"Content-Type": "application/json"}
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	resp, err := ts.Client().Do(req)
	if err != nil {
		t.Fatalf("do request: %v", err)
	}
	return resp
}

func decodeBody(t *testing.T, resp *http.Response) map[string]interface{} {
	t.Helper()
	defer resp.Body.Close()
	var m map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&m); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	return m
}

func TestConfigGetReturnsStringTTLAndVersion(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	resp := doJSON(t, ts, http.MethodGet, "/api/config", "", map[string]string{})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("GET status = %d, want 200", resp.StatusCode)
	}
	body := decodeBody(t, resp)
	version, _ := body["version"].(string)
	if version == "" {
		t.Fatal("GET response missing version")
	}
	cfg, ok := body["config"].(map[string]interface{})
	if !ok {
		t.Fatalf("config is %T, want object", body["config"])
	}
	if cfg["ttl"] != "5m" {
		t.Fatalf("top-level ttl = %v, want string \"5m\"", cfg["ttl"])
	}
	resolvers, ok := cfg["resolvers"].([]interface{})
	if !ok || len(resolvers) != 2 {
		t.Fatalf("resolvers = %v, want 2 entries", cfg["resolvers"])
	}
	cn := resolvers[0].(map[string]interface{})
	if cn["ttl"] != "600s" {
		t.Fatalf("resolver ttl = %v, want string \"600s\"", cn["ttl"])
	}
	rules, _ := cn["rule"].([]interface{})
	if len(rules) != 2 || rules[0] != "v2fly:cn" || rules[1] != "!ads.qq.com" {
		t.Fatalf("rules = %v, want [v2fly:cn !ads.qq.com] unexpanded", rules)
	}
}

// TestConfigGetPreservesBoolAndBlacklistRules guards the two fidelity edge
// cases that bit during development: a yaml bool (break-on-fail: true) must come
// back as a JSON bool (so it round-trips into the typed bool field), and an
// unquoted `!`-tagged blacklist rule must survive as its original text.
func TestConfigGetPreservesBoolAndBlacklistRules(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	cfg := `addr: ":53"
ttl: 5m
resolvers:
    - type: preloader
      name: ric
      ttl: 1m
      url: 1.1.1.1
      break-on-fail: true
      rule:
        - !blocked.example
        - "!quoted.example"
        - keep.example
`
	if err := os.WriteFile(path, []byte(cfg), 0600); err != nil {
		t.Fatalf("write config: %v", err)
	}
	server := &DnsSwitchyServer{dnsCache: &util.NoCache{}}
	server.gen.Store(&resolverGen{})
	server.configCtl = NewConfigController(path, server, nil)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	resp := doJSON(t, ts, http.MethodGet, "/api/config", "", map[string]string{})
	body := decodeBody(t, resp)
	cfgObj := body["config"].(map[string]interface{})
	ric := cfgObj["resolvers"].([]interface{})[0].(map[string]interface{})
	if ric["break-on-fail"] != true {
		t.Fatalf("break-on-fail = %#v, want JSON bool true", ric["break-on-fail"])
	}
	rules := ric["rule"].([]interface{})
	want := []interface{}{"!blocked.example", "!quoted.example", "keep.example"}
	if len(rules) != len(want) {
		t.Fatalf("rules = %v, want %v", rules, want)
	}
	for i := range want {
		if rules[i] != want[i] {
			t.Fatalf("rule[%d] = %q, want %q", i, rules[i], want[i])
		}
	}

	// Round-trip: POST the same resolvers back; the typed parse must recover the
	// bool and all three blacklist rules.
	version := body["version"].(string)
	rj, _ := json.Marshal(map[string]interface{}{"version": version, "resolvers": cfgObj["resolvers"]})
	postResp := doJSON(t, ts, http.MethodPost, "/api/config", string(rj), nil)
	if postResp.StatusCode != http.StatusOK {
		t.Fatalf("round-trip POST status = %d, want 200; body=%s", postResp.StatusCode, readAll(t, postResp))
	}
	updated, _ := os.ReadFile(path)
	if !bytes.Contains(updated, []byte("break-on-fail: true")) {
		t.Fatalf("break-on-fail not preserved as bool:\n%s", updated)
	}
	for _, rule := range []string{"!blocked.example", "!quoted.example", "keep.example"} {
		if !bytes.Contains(updated, []byte(rule)) {
			t.Fatalf("rule %q lost on round-trip:\n%s", rule, updated)
		}
	}
}

func getVersion(t *testing.T, ts *httptest.Server) string {
	t.Helper()
	resp := doJSON(t, ts, http.MethodGet, "/api/config", "", map[string]string{})
	body := decodeBody(t, resp)
	return body["version"].(string)
}

func TestConfigValidateParseError(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	// type missing -> ParseConfig fails at parse stage.
	body := `{"resolvers":[{"name":"bad","url":"1.1.1.1"}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config/validate", body, nil)
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("validate parse status = %d, want 400", resp.StatusCode)
	}
	m := decodeBody(t, resp)
	if m["stage"] != "parse" || m["valid"] != false {
		t.Fatalf("validate parse body = %v, want stage=parse valid=false", m)
	}
}

func TestConfigValidateConstructError(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	// A forward with no upstream URL passes ParseConfig but is rejected by the
	// construct/strict stage ("forward ... has no upstream").
	body := `{"resolvers":[{"type":"forward","name":"x","rule":["example.com"]}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config/validate", body, nil)
	if resp.StatusCode != http.StatusConflict {
		t.Fatalf("validate construct status = %d, want 409", resp.StatusCode)
	}
	m := decodeBody(t, resp)
	if m["stage"] != "construct" {
		t.Fatalf("validate construct stage = %v, want construct", m["stage"])
	}
}

func TestConfigValidateStrictFileLocation(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	body := `{"resolvers":[{"type":"file","fileType":"host","location":"/nonexistent/path/hosts"}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config/validate", body, nil)
	if resp.StatusCode != http.StatusConflict {
		t.Fatalf("validate strict status = %d, want 409", resp.StatusCode)
	}
	m := decodeBody(t, resp)
	if m["stage"] != "construct" {
		t.Fatalf("validate strict stage = %v, want construct", m["stage"])
	}
}

func TestConfigValidateOK(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	body := `{"resolvers":[{"type":"forward","name":"ok","url":"8.8.8.8","rule":["example.com"]}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config/validate", body, nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("validate ok status = %d, want 200", resp.StatusCode)
	}
	m := decodeBody(t, resp)
	if m["valid"] != true {
		t.Fatalf("validate ok body = %v, want valid=true", m)
	}
}

func TestConfigPostWritesBackupSwapsAndUpdatesVersion(t *testing.T) {
	server, ctl, path := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	version := getVersion(t, ts)
	body := `{"version":"` + version + `","resolvers":[{"type":"forward","name":"cn","ttl":"600s","url":"223.5.5.5","rule":["cn"]}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config", body, nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("POST status = %d, want 200; body=%s", resp.StatusCode, readAll(t, resp))
	}
	m := decodeBody(t, resp)
	newVersion, _ := m["version"].(string)
	if m["ok"] != true || newVersion == "" || newVersion == version {
		t.Fatalf("POST body = %v, want ok=true and a new version", m)
	}
	if ctl.AppliedHash() != newVersion {
		t.Fatalf("appliedHash = %s, want %s (self-write suppression)", ctl.AppliedHash(), newVersion)
	}

	// File updated with the new upstream, top-level preserved.
	updated, _ := os.ReadFile(path)
	if !bytes.Contains(updated, []byte("223.5.5.5")) {
		t.Fatalf("config file not updated with new url:\n%s", updated)
	}
	if !bytes.Contains(updated, []byte("ttl: 5m")) {
		t.Fatalf("top-level ttl not preserved:\n%s", updated)
	}

	// Backup generated.
	backups, _ := filepath.Glob(path + ".*.bak")
	if len(backups) != 1 {
		t.Fatalf("backup count = %d, want 1", len(backups))
	}

	// Resolver chain was hot-swapped to the new generation (1 forward).
	gen := server.gen.Load()
	if gen == nil || len(gen.resolvers) != 1 {
		t.Fatalf("active generation has %d resolvers, want 1 after swap", genLen(gen))
	}
}

func TestConfigPostTopLevelIsReadOnly(t *testing.T) {
	server, _, path := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	version := getVersion(t, ts)
	// Body sneaks in addr/http/ttl/nftset_table — they must be ignored.
	body := `{"version":"` + version + `","addr":"6.6.6.6:99","http":":9999","ttl":"99h","nftset_table":"evil","resolvers":[{"type":"forward","name":"cn","url":"8.8.8.8","rule":["cn"]}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config", body, nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("POST status = %d, want 200; body=%s", resp.StatusCode, readAll(t, resp))
	}
	updated, _ := os.ReadFile(path)
	for _, sneaky := range []string{"6.6.6.6:99", ":9999", "99h", "evil"} {
		if bytes.Contains(updated, []byte(sneaky)) {
			t.Fatalf("top-level field %q leaked into config:\n%s", sneaky, updated)
		}
	}
	if !bytes.Contains(updated, []byte("ttl: 5m")) || !bytes.Contains(updated, []byte("inet fw4")) {
		t.Fatalf("original top-level not preserved:\n%s", updated)
	}
}

func TestConfigPostVersionConflict(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	body := `{"version":"deadbeefdeadbeef","resolvers":[{"type":"forward","name":"cn","url":"8.8.8.8","rule":["cn"]}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config", body, nil)
	if resp.StatusCode != http.StatusConflict {
		t.Fatalf("POST stale version status = %d, want 409", resp.StatusCode)
	}
	m := decodeBody(t, resp)
	if m["stage"] != "version" {
		t.Fatalf("conflict stage = %v, want version", m["stage"])
	}
}

func TestConfigWriteHardening(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	t.Run("MethodNotAllowed", func(t *testing.T) {
		resp := doJSON(t, ts, http.MethodPut, "/api/config", `{}`, nil)
		if resp.StatusCode != http.StatusMethodNotAllowed {
			t.Fatalf("PUT status = %d, want 405", resp.StatusCode)
		}
	})
	t.Run("WrongContentType", func(t *testing.T) {
		resp := doJSON(t, ts, http.MethodPost, "/api/config", `{}`, map[string]string{"Content-Type": "text/plain"})
		if resp.StatusCode != http.StatusUnsupportedMediaType {
			t.Fatalf("text/plain status = %d, want 415", resp.StatusCode)
		}
	})
	t.Run("CrossOriginRejected", func(t *testing.T) {
		resp := doJSON(t, ts, http.MethodPost, "/api/config", `{}`, map[string]string{
			"Content-Type": "application/json",
			"Origin":       "http://evil.example.com",
		})
		if resp.StatusCode != http.StatusForbidden {
			t.Fatalf("cross-origin status = %d, want 403", resp.StatusCode)
		}
	})
	t.Run("OversizedBody", func(t *testing.T) {
		big := `{"resolvers":[{"type":"forward","name":"x","rule":["` + strings.Repeat("a", maxConfigBodyBytes+1024) + `"]}]}`
		resp := doJSON(t, ts, http.MethodPost, "/api/config", big, nil)
		if resp.StatusCode != http.StatusRequestEntityTooLarge {
			t.Fatalf("oversized status = %d, want 413", resp.StatusCode)
		}
	})
}

// TestConfigPostThroughRunningServerDoesNotDeadlockOrRebind starts a real HTTP
// server (httptest) backed by the same mux and config controller, then calls
// POST /api/config through it. The handler must return normally and the UDP/HTTP
// listeners must NOT be rebound (SwapResolvers must not Shutdown anything).
func TestConfigPostThroughRunningServerDoesNotDeadlock(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	version := getVersion(t, ts)
	body := `{"version":"` + version + `","resolvers":[{"type":"forward","name":"cn","url":"1.0.0.1","rule":["cn"]}]}`
	resp := doJSON(t, ts, http.MethodPost, "/api/config", body, nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("POST via running server status = %d, want 200; body=%s", resp.StatusCode, readAll(t, resp))
	}
	// httpServer/udpServer were never set on this test server; SwapResolvers must
	// not have touched them (they remain nil), proving it does not Shutdown.
	if server.httpServer != nil || server.udpServer != nil {
		t.Fatal("SwapResolvers must not create/replace the HTTP/UDP servers")
	}
}

func readAll(t *testing.T, resp *http.Response) string {
	t.Helper()
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	return string(b)
}

func genLen(g *resolverGen) int {
	if g == nil {
		return 0
	}
	return len(g.resolvers)
}

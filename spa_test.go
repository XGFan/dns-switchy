package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

// fakeDist 造一份「构建产物齐全」的 web/dist。
func fakeDist() fstest.MapFS {
	return fstest.MapFS{
		"index.html": {Data: []byte("<html>host page</html>")},
		"panel.js":   {Data: []byte("customElements.define('dns-panel', X)")},
	}
}

func getPath(t *testing.T, h http.Handler, path string) *httptest.ResponseRecorder {
	t.Helper()
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest(http.MethodGet, path, nil))
	return w
}

// 面板契约：/panel.js 命中真实文件时 200 + no-cache，且吐的是 bundle 本身。
func TestSpaHandlerServesPanelJS(t *testing.T) {
	w := getPath(t, spaHandlerFS(fakeDist()), "/panel.js")
	if w.Code != http.StatusOK {
		t.Fatalf("GET /panel.js = %d, want 200", w.Code)
	}
	if got := w.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("Cache-Control = %q, want %q", got, "no-cache")
	}
	if !strings.Contains(w.Body.String(), "dns-panel") {
		t.Fatalf("body is not the bundle: %q", w.Body.String())
	}
}

// 探活语义的核心：panel.js 缺失（例如忘了 npm run build）必须如实 404，
// 绝不能被 SPA 兜底回成 index.html + 200 —— net-console 拿 2xx 当在线判据，
// 兜底会让一个没有面板的实例一直显示在线。
func TestSpaHandlerPanelJSMissingIs404(t *testing.T) {
	noPanel := fstest.MapFS{"index.html": {Data: []byte("<html>host page</html>")}}
	w := getPath(t, spaHandlerFS(noPanel), "/panel.js")
	if w.Code != http.StatusNotFound {
		t.Fatalf("GET /panel.js with no bundle = %d, want 404", w.Code)
	}
	if strings.Contains(w.Body.String(), "host page") {
		t.Fatalf("missing panel.js fell through to the SPA fallback: %q", w.Body.String())
	}
}

// panel.js 是目录（畸形产物）同样不算在线。
func TestSpaHandlerPanelJSDirectoryIs404(t *testing.T) {
	weird := fstest.MapFS{
		"index.html":         {Data: []byte("<html>host page</html>")},
		"panel.js/README.md": {Data: []byte("not a bundle")},
	}
	w := getPath(t, spaHandlerFS(weird), "/panel.js")
	if w.Code != http.StatusNotFound {
		t.Fatalf("GET /panel.js when it is a directory = %d, want 404", w.Code)
	}
}

// 除 panel.js 外的未知路径保持原有 SPA 兜底（刷新任意前端路由都能进来）。
func TestSpaHandlerFallsBackForUnknownPaths(t *testing.T) {
	h := spaHandlerFS(fakeDist())
	for _, path := range []string{"/", "/some/deep/route", "/not-a-file"} {
		w := getPath(t, h, path)
		if w.Code != http.StatusOK {
			t.Fatalf("GET %s = %d, want 200", path, w.Code)
		}
		if !strings.Contains(w.Body.String(), "host page") {
			t.Fatalf("GET %s did not serve index.html: %q", path, w.Body.String())
		}
	}
}

// 真 embed 的 web/dist 里必须有 panel.js —— 这条把「产物忘了提交」挡在 CI 上，
// 而不是等 net-console 探活去发现。
func TestEmbeddedDistContainsPanelJS(t *testing.T) {
	w := getPath(t, spaHandler(), "/panel.js")
	if w.Code != http.StatusOK {
		t.Fatalf("embedded /panel.js = %d, want 200 (是不是忘了 cd web/portal && npm run build 并提交 web/dist？)", w.Code)
	}
	body, _ := io.ReadAll(w.Body)
	if !strings.Contains(string(body), "dns-panel") || !strings.Contains(string(body), "dns-card") {
		t.Fatalf("embedded panel.js does not register both custom elements")
	}
}

// 未注册的 /api/... 必须 404，不能被 SPA 兜底成 index.html + 200：
// 前端会拿 HTML 去 JSON.parse，报出与真实原因（端点写错）无关的错误。
func TestSpaHandlerUnknownAPIPathIs404(t *testing.T) {
	h := spaHandlerFS(fakeDist())
	for _, path := range []string{"/api/nope", "/api/", "/api/config/typo", "/api/query/extra"} {
		w := getPath(t, h, path)
		if w.Code != http.StatusNotFound {
			t.Fatalf("GET %s = %d, want 404", path, w.Code)
		}
		if strings.Contains(w.Body.String(), "host page") {
			t.Fatalf("GET %s fell through to the SPA fallback: %q", path, w.Body.String())
		}
	}
}

// 但 /api 本身（无斜杠）与前端路由不受影响，仍走兜底。
func TestSpaHandlerNonAPIPathsStillFallBack(t *testing.T) {
	h := spaHandlerFS(fakeDist())
	for _, path := range []string{"/api", "/apiary", "/config"} {
		w := getPath(t, h, path)
		if w.Code != http.StatusOK || !strings.Contains(w.Body.String(), "host page") {
			t.Fatalf("GET %s = %d body=%q, want 200 index.html", path, w.Code, w.Body.String())
		}
	}
}

// 打在真 mux 上：已注册的端点不受影响，未注册的 404。
func TestMuxKeepsRegisteredAPIEndpoints(t *testing.T) {
	server, _, _ := newConfigEditorServer(t)
	ts := httptest.NewServer(server.httpMux())
	defer ts.Close()

	if resp := do(t, ts, http.MethodGet, "/api/config", "", nil); resp.StatusCode != http.StatusOK {
		t.Fatalf("registered GET /api/config = %d, want 200", resp.StatusCode)
	}
	if resp := do(t, ts, http.MethodGet, "/api/does-not-exist", "", nil); resp.StatusCode != http.StatusNotFound {
		t.Fatalf("unregistered GET /api/does-not-exist = %d, want 404", resp.StatusCode)
	}
}

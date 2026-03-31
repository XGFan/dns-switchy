package config

import (
	"net"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"
)

func Test_parse(t *testing.T) {
	file, e := os.Open("../config.yaml")
	if e != nil {
		t.Fatal(e)
	}
	defer func() {
		_ = file.Close()
	}()
	t.Run("default", func(t *testing.T) {
		basePath := BasePath
		BasePath = ""
		defer func() {
			BasePath = basePath
		}()

		got, err := ParseConfig(file)
		if err != nil {
			t.Fatal(err)
		}
		target := &SwitchyConfig{
			Addr: ":1053",
			TTL:  5 * time.Minute,
			Resolvers: []ResolverConfig{
				&FilterConfig{QueryType: []string{"TXT"}},
				&FilterConfig{Rule: []string{"ad.google.com"}},
				&FilterConfig{QueryType: []string{"A"}, Rule: []string{"wechat.com"}},
				&FileConfig{
					Location:        "/tmp/dhcp.leases",
					RefreshInterval: 10 * time.Minute,
					FileType:        "lease",
					ExtraConfig: map[string]string{
						"domain": "lan",
					},
				},
				&FileConfig{
					Location:        "system",
					RefreshInterval: 10 * time.Minute,
					FileType:        "host",
					ExtraContent:    "#语法和host一致\n1.1.1.1 a.com b.com\n2.2.2.2 c.com\n::1 d.com\n",
					ExtraConfig:     nil,
				},
				&ForwardConfig{
					Name: "cn-dns",
					TTL:  600 * time.Second,
					UpstreamConfig: UpstreamConfig{
						Url: "114.114.114.114",
					},
				},
				&ForwardConfig{
					Name: "cf-dns",
					TTL:  0,
					UpstreamConfig: UpstreamConfig{
						Url: "https://cloudflare-dns.com/dns-query",
						Config: DnsConfig{
							Timeout: time.Second * 3,
							ServerIP: []net.IP{
								net.ParseIP("104.16.249.249"),
							},
						},
					},
				},
				&ForwardConfig{
					Name: "final-dns",
					TTL:  -1 * time.Second,
					UpstreamConfig: UpstreamConfig{
						Url: "114.114.114.114",
					},
				},
			}}
		if !reflect.DeepEqual(got.Addr, target.Addr) {
			t.Errorf("Addr got %+v, want %+v", got.Addr, target.Addr)
		}
		if !reflect.DeepEqual(got.TTL, target.TTL) {
			t.Errorf("TTL got %+v, want %+v", got.TTL, target.TTL)
		}
		for i := range got.Resolvers {
			if i == 5 {
				cnDNS, ok := got.Resolvers[i].(*ForwardConfig)
				if !ok {
					t.Fatalf("resolver[5] expected *ForwardConfig, got %T", got.Resolvers[i])
				}
				wantPrefix := []string{"cn", "qq.com", "baidu.com"}
				if len(cnDNS.Rule) < len(wantPrefix)+100 {
					t.Fatalf("cn-dns rules too short: got %d, want at least %d", len(cnDNS.Rule), len(wantPrefix)+100)
				}
				for j, want := range wantPrefix {
					if cnDNS.Rule[j] != want {
						t.Errorf("cn-dns rule[%d] = %q, want %q", j, cnDNS.Rule[j], want)
					}
				}
				wantCnDNS := target.Resolvers[i].(*ForwardConfig)
				if cnDNS.Name != wantCnDNS.Name || cnDNS.TTL != wantCnDNS.TTL || cnDNS.Url != wantCnDNS.Url {
					t.Errorf("cn-dns config mismatch: got name=%s ttl=%v url=%s", cnDNS.Name, cnDNS.TTL, cnDNS.Url)
				}
				continue
			}
			if !reflect.DeepEqual(got.Resolvers[i], target.Resolvers[i]) {
				t.Errorf("resolver[%d] got %+v, want %+v", i, got.Resolvers[i], target.Resolvers[i])
			}
		}
	})
}

func TestParseHttpAddr(t *testing.T) {
	tests := []struct {
		name    string
		args    string
		want    interface{}
		wantErr bool
	}{
		{name: "ip without port", args: "127.0.0.1", want: "", wantErr: true},
		{name: "ip:port", args: "127.0.0.1:8888", want: "", wantErr: false},
		{name: "only port 1", args: ":8888", want: "", wantErr: false},
		{name: "only port 2", args: "8888", want: "", wantErr: false},
		{name: "file", args: "unix:/tmp/hello.socks", want: "", wantErr: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseHttpAddr(tt.args)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseHttpAddr() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
		})
	}
}

func TestParseConfigIncludeCycleFailsConstruction(t *testing.T) {
	tests := []struct {
		name  string
		files map[string]string
		entry string
	}{
		{
			name: "direct cycle",
			files: map[string]string{
				"self.rules": "include:self.rules\n",
			},
			entry: "self.rules",
		},
		{
			name: "indirect cycle",
			files: map[string]string{
				"a.rules": "include:b.rules\n",
				"b.rules": "include:a.rules\n",
			},
			entry: "a.rules",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := t.TempDir()
			for name, content := range tt.files {
				err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0600)
				if err != nil {
					t.Fatalf("write include file %s fail: %v", name, err)
				}
			}

			basePath := BasePath
			BasePath = dir
			defer func() {
				BasePath = basePath
			}()

			_, err := ParseConfig(strings.NewReader(`
addr: ":1053"
resolvers:
  - type: forward
    name: cycle-dns
    url: 8.8.8.8
    rule:
      - include:` + tt.entry + `
`))
			if err == nil {
				t.Fatalf("expected include cycle to fail config construction")
			}
			if !strings.Contains(err.Error(), "include cycle detected") {
				t.Fatalf("expected include cycle error, got %v", err)
			}
		})
	}
}

func TestParseConfigInvalidResolverTypeFailsConstruction(t *testing.T) {
	tests := []struct {
		name       string
		yaml       string
		wantErrMsg string
	}{
		{
			name: "missing type",
			yaml: `
addr: ":1053"
resolvers:
  - name: missing-type
`,
			wantErrMsg: "resolver[0] missing type",
		},
		{
			name: "non string type",
			yaml: `
addr: ":1053"
resolvers:
  - type: 123
`,
			wantErrMsg: "resolver[0] type must be string",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseConfig(strings.NewReader(tt.yaml))
			if err == nil {
				t.Fatalf("expected invalid resolver type to fail config construction")
			}
			if !strings.Contains(err.Error(), tt.wantErrMsg) {
				t.Fatalf("expected error containing %q, got %v", tt.wantErrMsg, err)
			}
		})
	}
}

func TestParseConfigIncludeTrimsAndResolvesRelativePath(t *testing.T) {
	dir := t.TempDir()
	rulesDir := filepath.Join(dir, "rules")
	err := os.MkdirAll(rulesDir, 0700)
	if err != nil {
		t.Fatalf("create rules dir fail: %v", err)
	}
	err = os.WriteFile(filepath.Join(rulesDir, "extra.rules"), []byte("\n  # skip me\n qq.com \n\n !ads.qq.com\n"), 0600)
	if err != nil {
		t.Fatalf("write include file fail: %v", err)
	}

	basePath := BasePath
	BasePath = dir
	defer func() {
		BasePath = basePath
	}()

	parsed, err := ParseConfig(strings.NewReader(`
addr: ":1053"
resolvers:
  - type: forward
    name: include-dns
    url: 8.8.8.8
    rule:
      - include:rules/extra.rules
      - baidu.com
`))
	if err != nil {
		t.Fatalf("ParseConfig() error = %v", err)
	}

	forward, ok := parsed.Resolvers[0].(*ForwardConfig)
	if !ok {
		t.Fatalf("expected forward config, got %T", parsed.Resolvers[0])
	}

	wantRules := []string{"qq.com", "!ads.qq.com", "baidu.com"}
	if !reflect.DeepEqual(forward.Rule, wantRules) {
		t.Fatalf("forward.Rule = %#v, want %#v", forward.Rule, wantRules)
	}
}

func TestParseV2flyRules(t *testing.T) {
	tests := []struct {
		name  string
		lines []string
		want  []string
	}{
		{
			name:  "domain entries only",
			lines: []string{"domain:example.com", "domain:foo.bar.com"},
			want:  []string{"example.com", "foo.bar.com"},
		},
		{
			name:  "strips attr tags",
			lines: []string{"domain:a.alimama.cn:@ads", "domain:track.example.com:@tracking"},
			want:  []string{"a.alimama.cn", "track.example.com"},
		},
		{
			name:  "passes through full keyword regexp with prefix",
			lines: []string{"full:exact.com", "keyword:partial", "regexp:^.+\\.test\\.com$", "domain:keep.me"},
			want:  []string{"full:exact.com", "keyword:partial", "regexp:^.+\\.test\\.com$", "keep.me"},
		},
		{
			name:  "skips comments and blank lines",
			lines: []string{"", "  ", "# comment", "domain:valid.com", "  # indented comment"},
			want:  []string{"valid.com"},
		},
		{
			name:  "bare domain without prefix",
			lines: []string{"bare.example.com", "domain:prefixed.com"},
			want:  []string{"bare.example.com", "prefixed.com"},
		},
		{
			name:  "skips include directives",
			lines: []string{"include:other-list", "domain:keep.com"},
			want:  []string{"keep.com"},
		},
		{
			name:  "empty input",
			lines: []string{},
			want:  []string{},
		},
		{
			name:  "bare domain with colon is treated as unknown prefix and skipped",
			lines: []string{"bare.example.com:@ads"},
			want:  []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseV2flyRules(tt.lines)
			if len(got) == 0 && len(tt.want) == 0 {
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseV2flyRules() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestStripV2flyAttrs(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"example.com", "example.com"},
		{"a.alimama.cn:@ads", "a.alimama.cn"},
		{"track.com:@ads:@tracking", "track.com"},
		{"  spaced.com  ", "spaced.com"},
		{"", ""},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := stripV2flyAttrs(tt.input)
			if got != tt.want {
				t.Errorf("stripV2flyAttrs(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestReadWriteV2flyCache(t *testing.T) {
	dir := t.TempDir()
	origHome := os.Getenv("HOME")
	os.Setenv("HOME", dir)
	defer os.Setenv("HOME", origHome)

	lines := []string{"domain:example.com", "full:exact.com", "# comment"}

	if err := writeV2flyCache("test-list", lines); err != nil {
		t.Fatalf("writeV2flyCache() error = %v", err)
	}

	got, fresh, err := readV2flyCache("test-list")
	if err != nil {
		t.Fatalf("readV2flyCache() error = %v", err)
	}
	if !fresh {
		t.Fatal("readV2flyCache() fresh = false, want true (just written)")
	}
	if !reflect.DeepEqual(got, lines) {
		t.Fatalf("readV2flyCache() = %v, want %v", got, lines)
	}
}

func TestReadV2flyCacheStale(t *testing.T) {
	dir := t.TempDir()
	origHome := os.Getenv("HOME")
	os.Setenv("HOME", dir)
	defer os.Setenv("HOME", origHome)

	origTTL := v2flyCacheTTL
	v2flyCacheTTL = 1 * time.Millisecond
	defer func() { v2flyCacheTTL = origTTL }()

	lines := []string{"domain:stale.com"}
	if err := writeV2flyCache("stale-list", lines); err != nil {
		t.Fatalf("writeV2flyCache() error = %v", err)
	}
	time.Sleep(5 * time.Millisecond)

	got, fresh, err := readV2flyCache("stale-list")
	if err != nil {
		t.Fatalf("readV2flyCache() error = %v", err)
	}
	if fresh {
		t.Fatal("readV2flyCache() fresh = true, want false (TTL expired)")
	}
	if !reflect.DeepEqual(got, lines) {
		t.Fatalf("readV2flyCache() = %v, want %v", got, lines)
	}
}

func TestReadV2flyCacheMissing(t *testing.T) {
	dir := t.TempDir()
	origHome := os.Getenv("HOME")
	os.Setenv("HOME", dir)
	defer os.Setenv("HOME", origHome)

	_, _, err := readV2flyCache("nonexistent")
	if err == nil {
		t.Fatal("readV2flyCache() error = nil, want file-not-found error")
	}
}

func TestFetchV2flyListFreshCache(t *testing.T) {
	dir := t.TempDir()
	origHome := os.Getenv("HOME")
	os.Setenv("HOME", dir)
	defer os.Setenv("HOME", origHome)

	origTTL := v2flyCacheTTL
	v2flyCacheTTL = 1 * time.Hour
	defer func() { v2flyCacheTTL = origTTL }()

	cached := []string{"domain:cached.com", "full:exact.cached.com"}
	if err := writeV2flyCache("fresh-test", cached); err != nil {
		t.Fatalf("writeV2flyCache() error = %v", err)
	}

	got, err := fetchV2flyList("fresh-test")
	if err != nil {
		t.Fatalf("fetchV2flyList() error = %v", err)
	}
	if !reflect.DeepEqual(got, cached) {
		t.Fatalf("fetchV2flyList() = %v, want %v (from cache)", got, cached)
	}
}

func TestFetchV2flyListStaleWithDownloadFailure(t *testing.T) {
	dir := t.TempDir()
	origHome := os.Getenv("HOME")
	os.Setenv("HOME", dir)
	defer os.Setenv("HOME", origHome)

	origTTL := v2flyCacheTTL
	v2flyCacheTTL = 1 * time.Millisecond
	defer func() { v2flyCacheTTL = origTTL }()

	origClient := includeHTTPClient
	includeHTTPClient = &http.Client{Timeout: 1 * time.Millisecond}
	defer func() { includeHTTPClient = origClient }()

	stale := []string{"domain:stale-fallback.com"}
	if err := writeV2flyCache("stale-dl-fail", stale); err != nil {
		t.Fatalf("writeV2flyCache() error = %v", err)
	}
	time.Sleep(5 * time.Millisecond)

	got, err := fetchV2flyList("stale-dl-fail")
	if err != nil {
		t.Fatalf("fetchV2flyList() error = %v", err)
	}
	if !reflect.DeepEqual(got, stale) {
		t.Fatalf("fetchV2flyList() = %v, want %v (stale fallback)", got, stale)
	}
}

func TestFetchV2flyListNoCacheDownloadFailure(t *testing.T) {
	dir := t.TempDir()
	origHome := os.Getenv("HOME")
	os.Setenv("HOME", dir)
	defer os.Setenv("HOME", origHome)

	origClient := includeHTTPClient
	includeHTTPClient = &http.Client{Timeout: 1 * time.Millisecond}
	defer func() { includeHTTPClient = origClient }()

	got, err := fetchV2flyList("no-cache-dl-fail")
	if err != nil {
		t.Fatalf("fetchV2flyList() error = %v, want nil (non-blocking)", err)
	}
	if got != nil {
		t.Fatalf("fetchV2flyList() = %v, want nil", got)
	}
}

func pendingInvalidQueryTypeFailsConstruction(t *testing.T) {
	tests := []struct {
		name string
		yaml string
	}{
		{
			name: "FilterInvalidQueryType",
			yaml: `
addr: ":1053"
resolvers:
  - type: filter
    queryType:
      - NOT_A_DNS_TYPE
`,
		},
		{
			name: "MockInvalidQueryType",
			yaml: `
addr: ":1053"
resolvers:
  - type: mock
    answer: 1.1.1.1
    queryType:
      - INVALID_TYPE
`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseConfig(strings.NewReader(tt.yaml))
			if err == nil {
				t.Fatalf("expected unknown query type to fail config construction")
			}
		})
	}
}

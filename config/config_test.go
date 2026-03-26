package config

import (
	"net"
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
		defaultRules := append([]string{"cn", "qq.com", "baidu.com"}, readExpectedIncludedRules(t, "../v2-rule.txt")...)
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
					Rule: defaultRules,
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
			t.Errorf("got %+v, want %+v", got, target)
		}
		if !reflect.DeepEqual(got.TTL, target.TTL) {
			t.Errorf("got %+v, want %+v", got, target)
		}
		for i := range got.Resolvers {
			if !reflect.DeepEqual(got.Resolvers[i], target.Resolvers[i]) {
				t.Errorf("got %+v, want %+v", got.Resolvers[i], target.Resolvers[i])
			}
		}
		//if !reflect.DeepEqual(got, target) {
		//	t.Error("not equal")
		//}
	})
}

func readExpectedIncludedRules(t *testing.T, path string) []string {
	t.Helper()
	content, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read include file %s fail: %v", path, err)
	}

	rules := make([]string, 0)
	for _, line := range strings.Split(string(content), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		rules = append(rules, line)
	}
	return rules
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

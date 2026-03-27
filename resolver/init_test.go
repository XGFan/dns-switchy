package resolver

import (
	"dns-switchy/config"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

type unknownResolverConfig struct{}

func (unknownResolverConfig) Type() config.ResolverType {
	return config.ResolverType("definitely-unknown")
}

func TestCreateResolversPreservesOrder(t *testing.T) {
	resolvers, err := CreateResolvers(&config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{
			&config.MockConfig{Answer: "1.1.1.1"},
			&config.FilterConfig{QueryType: []string{"A"}},
			&config.ForwardConfig{
				Name:           "order-forward",
				UpstreamConfig: config.UpstreamConfig{Url: "127.0.0.1:53"},
			},
		},
	})
	if err != nil {
		t.Fatalf("CreateResolvers() error = %v", err)
	}
	t.Cleanup(func() {
		for _, r := range resolvers {
			r.Close()
		}
	})

	if len(resolvers) != 3 {
		t.Fatalf("len(resolvers) = %d, want 3", len(resolvers))
	}
	if _, ok := resolvers[0].(*Mock); !ok {
		t.Fatalf("resolvers[0] type = %T, want *resolver.Mock", resolvers[0])
	}
	if _, ok := resolvers[1].(*Mock); !ok {
		t.Fatalf("resolvers[1] type = %T, want *resolver.Mock", resolvers[1])
	}
	if _, ok := resolvers[2].(*Forward); !ok {
		t.Fatalf("resolvers[2] type = %T, want *resolver.Forward", resolvers[2])
	}
}

func TestCreateResolversStopsOnFirstBadResolver(t *testing.T) {
	_, err := CreateResolvers(&config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{
			&config.MockConfig{Answer: "1.1.1.1"},
			&config.FilterConfig{QueryType: []string{"NOT_A_DNS_TYPE"}},
			&config.MockConfig{Rule: []string{"include:missing.rules"}},
		},
	})
	if err == nil {
		t.Fatal("CreateResolvers() error = nil, want failure")
	}
	if !strings.Contains(err.Error(), "create resolver fail") {
		t.Fatalf("CreateResolvers() error = %v, want substring %q", err, "create resolver fail")
	}
	if !strings.Contains(err.Error(), "init query type matcher fail") {
		t.Fatalf("CreateResolvers() error = %v, want substring %q", err, "init query type matcher fail")
	}
	if strings.Contains(err.Error(), "open include") {
		t.Fatalf("CreateResolvers() error = %v, unexpected later-resolver hint %q", err, "open include")
	}
}

func TestCreateResolverDispatchesReachableTypes(t *testing.T) {
	hostsPath := filepath.Join(t.TempDir(), "hosts")
	if err := os.WriteFile(hostsPath, []byte("127.0.0.1 localhost\n"), 0600); err != nil {
		t.Fatalf("write hosts file fail: %v", err)
	}

	tests := []struct {
		name      string
		cfg       config.ResolverConfig
		wantCheck func(*testing.T, DnsResolver)
	}{
		{
			name: "FILTER",
			cfg:  &config.FilterConfig{QueryType: []string{"A"}},
			wantCheck: func(t *testing.T, resolver DnsResolver) {
				t.Helper()
				if _, ok := resolver.(*Mock); !ok {
					t.Fatalf("resolver type = %T, want *resolver.Mock", resolver)
				}
			},
		},
		{
			name: "FILE",
			cfg: &config.FileConfig{
				Location:        hostsPath,
				RefreshInterval: time.Hour,
				FileType:        "host",
			},
			wantCheck: func(t *testing.T, resolver DnsResolver) {
				t.Helper()
				if _, ok := resolver.(*FileResolver); !ok {
					t.Fatalf("resolver type = %T, want *resolver.FileResolver", resolver)
				}
			},
		},
		{
			name: "FORWARD",
			cfg: &config.ForwardConfig{
				Name:           "dispatch-forward",
				UpstreamConfig: config.UpstreamConfig{Url: "127.0.0.1:53"},
			},
			wantCheck: func(t *testing.T, resolver DnsResolver) {
				t.Helper()
				if _, ok := resolver.(*Forward); !ok {
					t.Fatalf("resolver type = %T, want *resolver.Forward", resolver)
				}
			},
		},
		{
			name: "MOCK",
			cfg:  &config.MockConfig{Answer: "1.1.1.1"},
			wantCheck: func(t *testing.T, resolver DnsResolver) {
				t.Helper()
				if _, ok := resolver.(*Mock); !ok {
					t.Fatalf("resolver type = %T, want *resolver.Mock", resolver)
				}
			},
		},
		{
			name: "PRELOADER",
			cfg: &config.PreloaderConfig{
				ForwardConfig: config.ForwardConfig{
					Name: "dispatch-preloader",
					TTL:  time.Hour,
					UpstreamConfig: config.UpstreamConfig{
						Url: "127.0.0.1:53",
					},
				},
			},
			wantCheck: func(t *testing.T, resolver DnsResolver) {
				t.Helper()
				if _, ok := resolver.(*Preloader); !ok {
					t.Fatalf("resolver type = %T, want *resolver.Preloader", resolver)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resolver, err := createResolver(tt.cfg)
			if err != nil {
				t.Fatalf("createResolver() error = %v", err)
			}
			t.Cleanup(func() {
				resolver.Close()
			})
			tt.wantCheck(t, resolver)
		})
	}
}

func TestCreateResolverUnknownTypeFails(t *testing.T) {
	_, err := createResolver(unknownResolverConfig{})
	if err == nil {
		t.Fatal("createResolver() error = nil, want failure")
	}
	if !strings.Contains(err.Error(), "unknown resolver type") {
		t.Fatalf("createResolver() error = %v, want substring %q", err, "unknown resolver type")
	}
	if !strings.Contains(err.Error(), "definitely-unknown") {
		t.Fatalf("createResolver() error = %v, want substring %q", err, "definitely-unknown")
	}
}

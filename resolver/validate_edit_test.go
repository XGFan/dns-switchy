package resolver

import (
	"dns-switchy/config"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestStrictValidateForEditAcceptsValid(t *testing.T) {
	hostsPath := filepath.Join(t.TempDir(), "hosts")
	if err := os.WriteFile(hostsPath, []byte("127.0.0.1 localhost\n"), 0600); err != nil {
		t.Fatalf("write hosts file fail: %v", err)
	}

	err := StrictValidateForEdit(&config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{
			&config.FilterConfig{QueryType: []string{"A"}},
			&config.MockConfig{Answer: "1.1.1.1"},
			&config.FileConfig{
				Location:        hostsPath,
				RefreshInterval: time.Hour,
				FileType:        "host",
			},
			&config.FileConfig{Location: "system", FileType: "host"},
			&config.ForwardConfig{
				Name:           "ok-forward",
				UpstreamConfig: config.UpstreamConfig{Url: "127.0.0.1:53"},
			},
			&config.ForwardConfig{
				Name: "ok-group",
				Upstreams: []config.UpstreamConfig{
					{Url: "1.1.1.1:53"},
					{Url: "https://dns.google/dns-query"},
				},
			},
			&config.PreloaderConfig{
				ForwardConfig: config.ForwardConfig{
					Name:           "ok-preloader",
					TTL:            time.Hour,
					UpstreamConfig: config.UpstreamConfig{Url: "tls://1.1.1.1"},
				},
			},
		},
	})
	if err != nil {
		t.Fatalf("StrictValidateForEdit() error = %v, want nil", err)
	}
}

func TestStrictValidateForEditRejectsMissingFileLocation(t *testing.T) {
	missing := filepath.Join(t.TempDir(), "does-not-exist")
	err := StrictValidateForEdit(&config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{
			&config.FileConfig{
				Location:        missing,
				RefreshInterval: time.Hour,
				FileType:        "host",
			},
		},
	})
	if err == nil {
		t.Fatal("StrictValidateForEdit() error = nil, want failure on missing file location")
	}
	if !strings.Contains(err.Error(), "not accessible") {
		t.Fatalf("StrictValidateForEdit() error = %v, want substring %q", err, "not accessible")
	}
}

func TestStrictValidateForEditRejectsBadUpstreamURL(t *testing.T) {
	err := StrictValidateForEdit(&config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{
			&config.ForwardConfig{
				Name:           "bad-forward",
				UpstreamConfig: config.UpstreamConfig{Url: "ht!tp://%%%not-a-url"},
			},
		},
	})
	if err == nil {
		t.Fatal("StrictValidateForEdit() error = nil, want failure on bad upstream URL")
	}
	if !strings.Contains(err.Error(), "invalid") {
		t.Fatalf("StrictValidateForEdit() error = %v, want substring %q", err, "invalid")
	}
}

func TestStrictValidateForEditRejectsForwardWithNoUpstream(t *testing.T) {
	err := StrictValidateForEdit(&config.SwitchyConfig{
		Resolvers: []config.ResolverConfig{
			&config.ForwardConfig{Name: "empty-forward"},
		},
	})
	if err == nil {
		t.Fatal("StrictValidateForEdit() error = nil, want failure on forward with no upstream")
	}
	if !strings.Contains(err.Error(), "no upstream") {
		t.Fatalf("StrictValidateForEdit() error = %v, want substring %q", err, "no upstream")
	}
}

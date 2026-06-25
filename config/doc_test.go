package config

import (
	"os"
	"strconv"
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

// prewarmV2flyCN seeds the on-disk v2fly cache for the "cn" list so that
// ParseConfig on the real config.yaml/router.yaml (which both use `v2fly:cn`)
// does not hit the network. Mirrors the pattern in Test_parse/default.
func prewarmV2flyCN(t *testing.T) {
	t.Helper()
	t.Setenv("DNS_SWITCHY_CACHE_DIR", t.TempDir())
	stub := make([]string, 0, 150)
	for i := 0; i < 150; i++ {
		stub = append(stub, "domain:stub"+strconv.Itoa(i)+".cn")
	}
	if err := writeV2flyCache("cn", stub); err != nil {
		t.Fatalf("writeV2flyCache(cn) error = %v", err)
	}
}

func TestLoadDocRoundTripFidelity(t *testing.T) {
	for _, path := range []string{"../config.yaml", "../router.yaml"} {
		t.Run(path, func(t *testing.T) {
			raw, err := os.ReadFile(path)
			if err != nil {
				t.Fatalf("read %s: %v", path, err)
			}

			doc, err := LoadDoc(strings.NewReader(string(raw)))
			if err != nil {
				t.Fatalf("LoadDoc(%s) error = %v", path, err)
			}

			resolvers, err := ResolversNode(doc)
			if err != nil {
				t.Fatalf("ResolversNode(%s) error = %v", path, err)
			}
			if resolvers.Kind != yaml.SequenceNode {
				t.Fatalf("resolvers node kind = %d, want SequenceNode", resolvers.Kind)
			}

			// Replace resolvers with the same node: a pure round-trip.
			if err := ReplaceResolvers(doc, resolvers); err != nil {
				t.Fatalf("ReplaceResolvers(%s) error = %v", path, err)
			}

			out, err := MarshalDoc(doc)
			if err != nil {
				t.Fatalf("MarshalDoc(%s) error = %v", path, err)
			}
			outStr := string(out)

			// Rules must NOT be expanded: directive scalars survive verbatim.
			if !strings.Contains(outStr, "v2fly:cn") {
				t.Errorf("%s: expected v2fly:cn to survive round-trip, output:\n%s", path, outStr)
			}
			// ttl must stay human-readable (not nanoseconds).
			if !strings.Contains(outStr, "ttl: 5m") {
				t.Errorf("%s: expected `ttl: 5m` to survive round-trip (not nanoseconds), output:\n%s", path, outStr)
			}
			if strings.Contains(outStr, "300000000000") {
				t.Errorf("%s: ttl leaked as nanoseconds (300000000000)", path)
			}

			// Top-level addr must survive.
			if !strings.Contains(outStr, "addr:") {
				t.Errorf("%s: expected top-level addr key to survive", path)
			}

			// Re-parsing the round-tripped bytes must still succeed.
			prewarmV2flyCN(t)
			if _, err := ParseConfig(strings.NewReader(outStr)); err != nil {
				t.Fatalf("ParseConfig of round-tripped %s failed: %v", path, err)
			}
		})
	}
}

func TestLoadDocRoundTripRouterSpecificKeys(t *testing.T) {
	raw, err := os.ReadFile("../router.yaml")
	if err != nil {
		t.Fatalf("read router.yaml: %v", err)
	}
	doc, err := LoadDoc(strings.NewReader(string(raw)))
	if err != nil {
		t.Fatalf("LoadDoc error = %v", err)
	}
	resolvers, err := ResolversNode(doc)
	if err != nil {
		t.Fatalf("ResolversNode error = %v", err)
	}
	if err := ReplaceResolvers(doc, resolvers); err != nil {
		t.Fatalf("ReplaceResolvers error = %v", err)
	}
	out, err := MarshalDoc(doc)
	if err != nil {
		t.Fatalf("MarshalDoc error = %v", err)
	}
	outStr := string(out)

	// router.yaml has http top-level key and 600s-style scalars via 0.0.0.0:1153 addr.
	for _, want := range []string{"http:", "addr:", "0.0.0.0:1153"} {
		if !strings.Contains(outStr, want) {
			t.Errorf("router.yaml round-trip missing %q, output:\n%s", want, outStr)
		}
	}
}

func TestReplaceResolversPreservesUnknownKeys(t *testing.T) {
	src := `addr: ":1053"
ttl: 600s
some_unknown_top_key: keep-me
resolvers:
  - type: forward
    name: keep-forward
    url: 114.114.114.114
    unknown_resolver_field: also-keep-me
    rule:
      - v2fly:cn
`
	doc, err := LoadDoc(strings.NewReader(src))
	if err != nil {
		t.Fatalf("LoadDoc error = %v", err)
	}
	resolvers, err := ResolversNode(doc)
	if err != nil {
		t.Fatalf("ResolversNode error = %v", err)
	}
	if err := ReplaceResolvers(doc, resolvers); err != nil {
		t.Fatalf("ReplaceResolvers error = %v", err)
	}
	out, err := MarshalDoc(doc)
	if err != nil {
		t.Fatalf("MarshalDoc error = %v", err)
	}
	outStr := string(out)

	for _, want := range []string{
		"some_unknown_top_key: keep-me",
		"unknown_resolver_field: also-keep-me",
		"ttl: 600s",
		"v2fly:cn",
	} {
		if !strings.Contains(outStr, want) {
			t.Errorf("round-trip dropped %q, output:\n%s", want, outStr)
		}
	}
}

func TestReplaceResolversAppendsWhenAbsent(t *testing.T) {
	src := `addr: ":1053"
ttl: 5m
`
	doc, err := LoadDoc(strings.NewReader(src))
	if err != nil {
		t.Fatalf("LoadDoc error = %v", err)
	}
	if _, err := ResolversNode(doc); err == nil {
		t.Fatal("ResolversNode should error when no resolvers key present")
	}

	seq := &yaml.Node{Kind: yaml.SequenceNode, Tag: "!!seq"}
	if err := ReplaceResolvers(doc, seq); err != nil {
		t.Fatalf("ReplaceResolvers (append) error = %v", err)
	}
	if _, err := ResolversNode(doc); err != nil {
		t.Fatalf("ResolversNode after append error = %v", err)
	}
	out, err := MarshalDoc(doc)
	if err != nil {
		t.Fatalf("MarshalDoc error = %v", err)
	}
	if !strings.Contains(string(out), "resolvers:") {
		t.Errorf("appended resolvers key missing, output:\n%s", string(out))
	}
}

func TestConfigVersionStableAndDistinct(t *testing.T) {
	a := []byte("addr: \":1053\"\nttl: 5m\n")
	b := []byte("addr: \":1053\"\nttl: 5m\n")
	c := []byte("addr: \":1054\"\nttl: 5m\n")

	if ConfigVersion(a) != ConfigVersion(b) {
		t.Errorf("ConfigVersion not stable for identical content")
	}
	if ConfigVersion(a) == ConfigVersion(c) {
		t.Errorf("ConfigVersion collided for different content")
	}
	if got := ConfigVersion(a); len(got) != 16 {
		t.Errorf("ConfigVersion length = %d, want 16", len(got))
	}
}

package util

import (
	"strings"
	"testing"
)

func TestDomainSet_match(t *testing.T) {
	var set = NewDomainSet([]string{
		"qq.com",
		"a.qq.com",
		"b.qq.com",
		"cn",
		"z.cn",
		"google.com",
	})
	tests := []struct {
		testDomain string
		want       bool
	}{
		{testDomain: "qqq.com", want: false},
		{testDomain: "s.qq.com", want: true},
		{testDomain: "ffff.cn", want: true},
		{testDomain: "google.com", want: true},
		{testDomain: "ggoogle.com", want: false},
	}
	for _, tt := range tests {
		t.Run(tt.testDomain, func(t *testing.T) {
			if got := set.MatchDomain(tt.testDomain); got != tt.want {
				t.Errorf("match() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestDomainMatcherBlacklistOnlyAllowAllExceptBlacklist(t *testing.T) {
	matcher, err := NewDomainMatcher([]string{"!blocked.example.com"})
	if err != nil {
		t.Fatalf("NewDomainMatcher() error = %v", err)
	}

	tests := []struct {
		name   string
		domain string
		want   bool
	}{
		{name: "BlacklistOnlyExactDomain", domain: "blocked.example.com", want: false},
		{name: "BlacklistOnlySubDomain", domain: "api.blocked.example.com", want: false},
		{name: "BlacklistOnlyUnlistedDomain", domain: "allowed.example.com", want: true},
		{name: "BlacklistOnlyOtherSuffix", domain: "example.net", want: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := matcher.MatchDomain(tt.domain); got != tt.want {
				t.Fatalf("MatchDomain(%q) = %v, want %v", tt.domain, got, tt.want)
			}
		})
	}
}

func TestDomainMatcherNormalize(t *testing.T) {
	matcher, err := NewDomainMatcher([]string{"  ExAmPlE.COM.  ", " !  Bad.Example.COM.  "})
	if err != nil {
		t.Fatalf("NewDomainMatcher() error = %v", err)
	}

	tests := []struct {
		name   string
		domain string
		want   bool
	}{
		{name: "ExactMatchCanonicalized", domain: " example.com. ", want: true},
		{name: "SubdomainCanonicalized", domain: "WWW.Example.com.", want: true},
		{name: "BlacklistedCanonicalized", domain: "bad.example.com.", want: false},
		{name: "BlacklistedSubdomainCanonicalized", domain: "Api.Bad.Example.COM.", want: false},
		{name: "OtherSuffixRejected", domain: "other.example.net.", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := matcher.MatchDomain(tt.domain); got != tt.want {
				t.Fatalf("MatchDomain(%q) = %v, want %v", tt.domain, got, tt.want)
			}
		})
	}
}

func TestNewQueryTypeMatcherInvalidQueryType(t *testing.T) {
	_, err := NewQueryTypeMatcher([]string{" A ", "NOT_A_DNS_TYPE"})
	if err == nil {
		t.Fatal("NewQueryTypeMatcher() error = nil, want constructor failure")
	}
	if !strings.Contains(err.Error(), "unknown query type") {
		t.Fatalf("NewQueryTypeMatcher() error = %v, want unknown query type", err)
	}
}

func TestDomainMatcherFullMatch(t *testing.T) {
	matcher, err := NewDomainMatcher([]string{"full:example.com"})
	if err != nil {
		t.Fatalf("NewDomainMatcher() error = %v", err)
	}
	tests := []struct {
		domain string
		want   bool
	}{
		{"example.com", true},
		{"EXAMPLE.COM", true},
		{"sub.example.com", false},
		{"notexample.com", false},
		{"example.com.cn", false},
	}
	for _, tt := range tests {
		t.Run(tt.domain, func(t *testing.T) {
			if got := matcher.MatchDomain(tt.domain); got != tt.want {
				t.Fatalf("MatchDomain(%q) = %v, want %v", tt.domain, got, tt.want)
			}
		})
	}
}

func TestDomainMatcherKeyword(t *testing.T) {
	matcher, err := NewDomainMatcher([]string{"keyword:google"})
	if err != nil {
		t.Fatalf("NewDomainMatcher() error = %v", err)
	}
	tests := []struct {
		domain string
		want   bool
	}{
		{"google.com", true},
		{"www.google.com", true},
		{"mail.google.co.jp", true},
		{"ungoogle.me", true},
		{"example.com", false},
	}
	for _, tt := range tests {
		t.Run(tt.domain, func(t *testing.T) {
			if got := matcher.MatchDomain(tt.domain); got != tt.want {
				t.Fatalf("MatchDomain(%q) = %v, want %v", tt.domain, got, tt.want)
			}
		})
	}
}

func TestDomainMatcherRegexp(t *testing.T) {
	matcher, err := NewDomainMatcher([]string{`regexp:^.+-mihayo\.akamaized\.net$`})
	if err != nil {
		t.Fatalf("NewDomainMatcher() error = %v", err)
	}
	tests := []struct {
		domain string
		want   bool
	}{
		{"cdn-mihayo.akamaized.net", true},
		{"ab-mihayo.akamaized.net", true},
		{"mihayo.akamaized.net", false},
		{"other.example.com", false},
	}
	for _, tt := range tests {
		t.Run(tt.domain, func(t *testing.T) {
			if got := matcher.MatchDomain(tt.domain); got != tt.want {
				t.Fatalf("MatchDomain(%q) = %v, want %v", tt.domain, got, tt.want)
			}
		})
	}
}

func TestDomainMatcherRegexpInvalid(t *testing.T) {
	_, err := NewDomainMatcher([]string{`regexp:[invalid`})
	if err == nil {
		t.Fatal("NewDomainMatcher() error = nil, want regexp compile error")
	}
	if !strings.Contains(err.Error(), "invalid regexp rule") {
		t.Fatalf("NewDomainMatcher() error = %v, want 'invalid regexp rule'", err)
	}
}

func TestDomainMatcherMixedTypes(t *testing.T) {
	matcher, err := NewDomainMatcher([]string{
		"example.com",
		"full:exact.org",
		"keyword:tracker",
		`regexp:^ad\d+\.`,
		"!blocked.example.com",
	})
	if err != nil {
		t.Fatalf("NewDomainMatcher() error = %v", err)
	}
	tests := []struct {
		name   string
		domain string
		want   bool
	}{
		{"suffix match", "sub.example.com", true},
		{"suffix exact", "example.com", true},
		{"full exact", "exact.org", true},
		{"full rejects subdomain", "sub.exact.org", false},
		{"keyword hit", "ad-tracker.io", true},
		{"keyword miss", "example.net", false},
		{"regexp hit", "ad123.cdn.com", true},
		{"regexp miss", "notad.cdn.com", false},
		{"blacklist blocks suffix", "blocked.example.com", false},
		{"blacklist blocks sub-sub", "api.blocked.example.com", false},
		{"unmatched domain", "random.net", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := matcher.MatchDomain(tt.domain); got != tt.want {
				t.Fatalf("MatchDomain(%q) = %v, want %v", tt.domain, got, tt.want)
			}
		})
	}
}

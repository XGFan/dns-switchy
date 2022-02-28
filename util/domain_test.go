package util

import (
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
			if got := set.Match(tt.testDomain); got != tt.want {
				t.Errorf("match() = %v, want %v", got, tt.want)
			}
		})
	}
}

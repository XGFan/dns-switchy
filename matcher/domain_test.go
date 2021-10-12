package matcher

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"testing"
)

func TestDomainSet_match(t *testing.T) {
	resp, _ := http.Get("https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt")
	decoder := base64.NewDecoder(base64.StdEncoding, resp.Body)
	all, _ := io.ReadAll(decoder)
	fmt.Println(string(all))
	var set = NewDomainSet([]string{
		"qq.com",
		"cn",
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

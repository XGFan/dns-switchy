package resolver

import (
	"dns-switchy/config"
	"github.com/miekg/dns"
	"testing"
)

func TestFilter(t *testing.T) {
	filter := NewFilter(&config.FilterConfig{
		QueryType: []string{"AAAA"},
	})

	tests := []struct {
		question *dns.Msg
		want     bool
	}{
		{question: &dns.Msg{
			Question: []dns.Question{{
				Name:  "google.com",
				Qtype: dns.TypeAAAA,
			}},
		}, want: true},
		{question: &dns.Msg{
			Question: []dns.Question{{
				Name:  "baidu.com",
				Qtype: dns.TypeA,
			}},
		}, want: false},
	}
	for _, tt := range tests {
		t.Run(tt.question.Question[0].Name, func(t *testing.T) {
			accept := filter.Accept(tt.question)
			if accept != tt.want {
				t.Errorf("Accept = %v, want %v", accept, tt.want)
			}
			if accept {
				resolve, _ := filter.Resolve(tt.question)
				if len(resolve.Answer) != 0 {
					t.Errorf("Answer should be empty, got %v", resolve.Answer)
				}
			}
		})
	}
}

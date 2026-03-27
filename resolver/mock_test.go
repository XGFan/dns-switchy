package resolver

import (
	"dns-switchy/config"
	"github.com/miekg/dns"
	"strings"
	"testing"
)

func newMockQuestion(name string, qtype uint16) *dns.Msg {
	return &dns.Msg{
		Question: []dns.Question{{
			Name:  name,
			Qtype: qtype,
		}},
	}
}

func TestMockAcceptUsesDomainAndQueryTypeMatchers(t *testing.T) {
	mock, err := NewMock(&config.MockConfig{
		Rule:      []string{"example.com"},
		QueryType: []string{"A"},
	})
	if err != nil {
		t.Fatalf("NewMock() error = %v", err)
	}

	tests := []struct {
		name     string
		question *dns.Msg
		want     bool
	}{
		{
			name:     "domain and qtype match",
			question: newMockQuestion("www.example.com.", dns.TypeA),
			want:     true,
		},
		{
			name:     "domain match but qtype mismatch",
			question: newMockQuestion("www.example.com.", dns.TypeAAAA),
			want:     false,
		},
		{
			name:     "qtype match but domain mismatch",
			question: newMockQuestion("www.other.com.", dns.TypeA),
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := mock.Accept(tt.question); got != tt.want {
				t.Fatalf("Accept() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMockResolveReturnsAAndAAAAAnswers(t *testing.T) {
	tests := []struct {
		name        string
		qtype       uint16
		answer      string
		wantAnswers int
		check       func(t *testing.T, msg *dns.Msg)
	}{
		{
			name:        "A answer shaping",
			qtype:       dns.TypeA,
			answer:      "1.2.3.4",
			wantAnswers: 1,
			check: func(t *testing.T, msg *dns.Msg) {
				a, ok := msg.Answer[0].(*dns.A)
				if !ok {
					t.Fatalf("Answer[0] type = %T, want *dns.A", msg.Answer[0])
				}
				if got := a.A.String(); got != "1.2.3.4" {
					t.Fatalf("A record IP = %q, want %q", got, "1.2.3.4")
				}
			},
		},
		{
			name:        "AAAA answer shaping",
			qtype:       dns.TypeAAAA,
			answer:      "2001:db8::1",
			wantAnswers: 1,
			check: func(t *testing.T, msg *dns.Msg) {
				aaaa, ok := msg.Answer[0].(*dns.AAAA)
				if !ok {
					t.Fatalf("Answer[0] type = %T, want *dns.AAAA", msg.Answer[0])
				}
				if got := aaaa.AAAA.String(); got != "2001:db8::1" {
					t.Fatalf("AAAA record IP = %q, want %q", got, "2001:db8::1")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock, err := NewMock(&config.MockConfig{Answer: tt.answer})
			if err != nil {
				t.Fatalf("NewMock() error = %v", err)
			}

			question := newMockQuestion("example.com.", tt.qtype)
			res, err := mock.Resolve(question)
			if err != nil {
				t.Fatalf("Resolve() error = %v", err)
			}
			if len(res.Answer) != tt.wantAnswers {
				t.Fatalf("len(Answer) = %d, want %d", len(res.Answer), tt.wantAnswers)
			}
			if tt.check != nil {
				tt.check(t, res)
			}
		})
	}
}

func TestMockResolveReturnsEmptyAnswerForUnsupportedType(t *testing.T) {
	mock, err := NewMock(&config.MockConfig{Answer: "1.2.3.4"})
	if err != nil {
		t.Fatalf("NewMock() error = %v", err)
	}

	question := newMockQuestion("example.com.", dns.TypeTXT)
	res, err := mock.Resolve(question)
	if err != nil {
		t.Fatalf("Resolve() error = %v", err)
	}
	if len(res.Answer) != 0 {
		t.Fatalf("len(Answer) = %d, want %d", len(res.Answer), 0)
	}
}

func TestNewMockWrapsMatcherConstructionErrors(t *testing.T) {
	t.Run("query type matcher error is wrapped", func(t *testing.T) {
		_, err := NewMock(&config.MockConfig{QueryType: []string{"NOT_A_TYPE"}})
		if err == nil {
			t.Fatal("NewMock() error = nil, want failure")
		}
		if !strings.Contains(err.Error(), "init query type matcher fail") {
			t.Fatalf("NewMock() error = %v, want substring %q", err, "init query type matcher fail")
		}
		if !strings.Contains(err.Error(), "unknown query type") {
			t.Fatalf("NewMock() error = %v, want substring %q", err, "unknown query type")
		}
	})

	t.Run("domain matcher error is wrapped", func(t *testing.T) {
		basePath := config.BasePath
		config.BasePath = t.TempDir()
		defer func() {
			config.BasePath = basePath
		}()

		_, err := NewMock(&config.MockConfig{
			QueryType: []string{"A"},
			Rule:      []string{"include:missing.rules"},
		})
		if err == nil {
			t.Fatal("NewMock() error = nil, want failure")
		}
		if !strings.Contains(err.Error(), "init domain matcher fail") {
			t.Fatalf("NewMock() error = %v, want substring %q", err, "init domain matcher fail")
		}
		if !strings.Contains(err.Error(), "open include") {
			t.Fatalf("NewMock() error = %v, want substring %q", err, "open include")
		}
	})
}

func TestMockResolveCharacterizesInvalidAnswerInput(t *testing.T) {
	mock, err := NewMock(&config.MockConfig{Answer: "not-an-ip"})
	if err != nil {
		t.Fatalf("NewMock() error = %v", err)
	}

	question := newMockQuestion("example.com.", dns.TypeA)
	res, err := mock.Resolve(question)
	if err != nil {
		t.Fatalf("Resolve() error = %v", err)
	}
	if len(res.Answer) != 1 {
		t.Fatalf("len(Answer) = %d, want %d", len(res.Answer), 1)
	}

	a, ok := res.Answer[0].(*dns.A)
	if !ok {
		t.Fatalf("Answer[0] type = %T, want *dns.A", res.Answer[0])
	}
	if a.A != nil {
		t.Fatalf("A record IP = %v, want nil for invalid input", a.A)
	}
}

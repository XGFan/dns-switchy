package resolver

import (
	"dns-switchy/config"
	"strings"
	"testing"
)

func TestResolverConstructorsInvalidQueryTypeAndParseErrors(t *testing.T) {
	basePath := config.BasePath
	config.BasePath = t.TempDir()
	defer func() {
		config.BasePath = basePath
	}()

	tests := []struct {
		name    string
		build   func() error
		wantErr string
	}{
		{
			name: "CreateResolversBadFilterQueryType",
			build: func() error {
				_, err := CreateResolvers(&config.SwitchyConfig{
					Resolvers: []config.ResolverConfig{
						&config.FilterConfig{QueryType: []string{"NOT_A_DNS_TYPE"}},
					},
				})
				return err
			},
			wantErr: "create resolver fail",
		},
		{
			name: "NewMockBadQueryType",
			build: func() error {
				_, err := NewMock(&config.MockConfig{QueryType: []string{"INVALID_TYPE"}})
				return err
			},
			wantErr: "init query type matcher fail",
		},
		{
			name: "NewForwardBadIncludeRule",
			build: func() error {
				_, err := NewForward(&config.ForwardConfig{
					Name: "bad-include",
					Rule: []string{"include:missing.rules"},
					UpstreamConfig: config.UpstreamConfig{
						Url: "8.8.8.8",
					},
				})
				return err
			},
			wantErr: "init domain matcher fail",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.build()
			if err == nil {
				t.Fatal("constructor error = nil, want failure")
			}
			if !strings.Contains(err.Error(), tt.wantErr) {
				t.Fatalf("constructor error = %v, want substring %q", err, tt.wantErr)
			}
		})
	}
}

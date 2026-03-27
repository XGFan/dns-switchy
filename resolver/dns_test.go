package resolver

import (
	"testing"
)

func TestResolverNoCacheTTLReturnsMinusOne(t *testing.T) {
	if got := (NoCache{}).TTL(); got != -1 {
		t.Fatalf("NoCache{}.TTL() = %v, want -1", got)
	}
}

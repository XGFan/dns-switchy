package resolver

import (
	"dns-switchy/config"
	"dns-switchy/util"
	"fmt"
)

func NewFilter(config *config.FilterConfig) (*Mock, error) {
	queryTypeMatcher, err := util.NewQueryTypeMatcher(config.QueryType)
	if err != nil {
		return nil, fmt.Errorf("init query type matcher fail: %w", err)
	}
	domainMatcher, err := util.NewDomainMatcher(config.Rule)
	if err != nil {
		return nil, fmt.Errorf("init domain matcher fail: %w", err)
	}
	return &Mock{
		QueryTypeMatcher: queryTypeMatcher,
		DomainMatcher:    domainMatcher,
	}, nil
}

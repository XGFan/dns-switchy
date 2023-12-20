package resolver

import (
	"dns-switchy/config"
	"dns-switchy/util"
)

func NewFilter(config *config.FilterConfig) (*Mock, error) {
	return &Mock{
		QueryTypeMatcher: util.NewQueryTypeMatcher(config.QueryType),
		DomainMatcher:    util.NewDomainMatcher(config.Rule),
	}, nil
}

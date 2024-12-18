package resolver

import (
	"dns-switchy/config"
	"errors"
	"fmt"
)

func CreateResolvers(conf *config.SwitchyConfig) ([]DnsResolver, error) {
	l := make([]DnsResolver, 0)
	for _, resolverConfig := range conf.Resolvers {
		resolver, err := createResolver(resolverConfig)
		if err != nil {
			return nil, fmt.Errorf("create resolver fail: %v", err)
		} else {
			l = append(l, resolver)
		}
	}
	return l, nil
}

func createResolver(resolverConfig config.ResolverConfig) (DnsResolver, error) {
	switch resolverConfig.Type() {
	case config.FILTER:
		return NewFilter(resolverConfig.(*config.FilterConfig))
	case config.FILE:
		return NewFile(resolverConfig.(*config.FileConfig))
	case config.FORWARD, config.FORWARD_GROUP:
		return NewForward(resolverConfig.(*config.ForwardConfig))
	case config.MOCK:
		return NewMock(resolverConfig.(*config.MockConfig))
	case config.PRELOADER:
		return NewPreloader(resolverConfig.(*config.PreloaderConfig))

	default:
		return nil, errors.New(fmt.Sprintf("unknown resolver type %s", resolverConfig.Type()))
	}
}

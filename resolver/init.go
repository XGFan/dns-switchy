package resolver

import (
	"dns-switchy/config"
	"dns-switchy/matcher"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"log"
)

func Init(conf *config.SwitchyConfig) []DnsResolver {
	l := make([]DnsResolver, 0)
	l = append(l, Hosts(conf.Host))
	for _, conf := range conf.Upstream {
		up, err := upstream.AddressToUpstream(conf.Url, nil)
		if err != nil {
			log.Printf("init upstream fail: %+v", err)
		}
		l = append(l, &UpstreamDNS{
			Name:     conf.Name,
			Upstream: up,
			Matcher:  matcher.NewDomainSet(conf.Rule),
		})
	}
	lastConfig := conf.Upstream[len(conf.Upstream)-1]
	up, err := upstream.AddressToUpstream(lastConfig.Url, nil)
	if err != nil {
		log.Printf("init upstream fail: %+v", err)
	}
	l = append(l, &UpstreamDNS{
		Name:     lastConfig.Name,
		Upstream: up,
		Matcher:  matcher.AcceptAll,
	})
	return l
}

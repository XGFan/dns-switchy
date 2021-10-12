package resolver

import (
	"dns-switchy/config"
	"dns-switchy/matcher"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func parseRule(rules []string) []string {
	parsedRules := make([]string, 0)
	for _, s := range rules {
		if strings.Contains(s, ":") {
			index := strings.Index(s, ":")
			var reader io.ReadCloser
			cmdType := strings.Trim(strings.ToLower(s[0:index]), " ")
			if cmdType == "include" {
				target := s[index+1:]
				if strings.HasPrefix(target, "http") {
					resp, err := http.Get(target)
					if err != nil {
						log.Printf("Get %s fail: %s", target, err)
						reader = io.NopCloser(nil)
					} else {
						reader = resp.Body
					}
				} else {
					open, err := os.Open(target)
					if err != nil {
						log.Printf("Get %s fail: %s", target, err)
						reader = io.NopCloser(nil)
					} else {
						reader = open
					}
				}
				all, _ := io.ReadAll(reader)
				targetRules := strings.Split(string(all), "\n")
				nestedParsed := parseRule(targetRules)
				for _, s2 := range nestedParsed {
					parsedRules = append(parsedRules, s2)
				}
			} else {
				//TODO does not support other type
				log.Printf("unsupported type %s", cmdType)
			}
		} else {
			parsedRules = append(parsedRules, s)
		}
	}
	return parsedRules
}

func Init(conf *config.SwitchyConfig) []DnsResolver {
	l := make([]DnsResolver, 0)
	l = append(l, Hosts(conf.Host))
	for _, conf := range conf.Upstream {
		up, err := upstream.AddressToUpstream(conf.Url, nil)
		if err != nil {
			log.Printf("init upstream fail: %+v", err)
		}
		parsed := parseRule(conf.Rule)
		l = append(l, &UpstreamDNS{
			Name:     conf.Name,
			Upstream: up,
			Matcher:  matcher.NewDomainSet(parsed),
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

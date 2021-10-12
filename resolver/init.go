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
	needFallback := true
	for _, conf := range conf.Upstream {
		up, err := upstream.AddressToUpstream(conf.Url, nil)
		if err != nil {
			log.Printf("init upstream fail: %+v", err)
		}
		parsed := parseRule(conf.Rule)
		if len(parsed) == 0 {
			l = append(l, &UpstreamDNS{
				Name:     conf.Name,
				Upstream: up,
				Matcher:  matcher.AcceptAll,
			})
			needFallback = false
		} else {
			l = append(l, &UpstreamDNS{
				Name:     conf.Name,
				Upstream: up,
				Matcher:  matcher.NewDomainSet(parsed),
			})
		}
	}
	if needFallback {
		log.Fatalln("need a upstream as fall back")
	}
	return l
}

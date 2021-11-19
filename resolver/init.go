package resolver

import (
	"bytes"
	"dns-switchy/config"
	"dns-switchy/matcher"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
)

var BasePath string

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
						log.Printf("Read %s fail: %s", target, err)
						reader = io.NopCloser(bytes.NewReader(nil))
					} else {
						reader = resp.Body
					}
				} else {
					var open fs.File
					var err error
					if BasePath != "" && !path.IsAbs(target) {
						open, err = os.DirFS(BasePath).Open(target)
					} else {
						open, err = os.Open(target)
					}
					if err != nil {
						log.Printf("Read %s fail: %s", target, err)
						reader = io.NopCloser(bytes.NewReader(nil))
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
	l = append(l, NewAAAAFilter())
	l = append(l, NewHosts(conf.Host))
	l = append(l, NewDefaultLease())
	needFallback := true
	for _, conf := range conf.Upstream {
		up, err := upstream.AddressToUpstream(conf.Url, &upstream.Options{
			Bootstrap: conf.Config.Bootstrap,
			Timeout:   conf.Config.Timeout,
		})
		if err != nil {
			log.Printf("init upstream fail: %+v", err)
		}
		ups := &UpstreamDNS{
			Name:     conf.Name,
			Upstream: up,
			Matcher:  matcher.NewMatcher(parseRule(conf.Rule)),
			clientIP: conf.Config.ClientIP,
		}
		if ups.Matcher == matcher.AcceptAll {
			needFallback = false
		}
		l = append(l, ups)
	}
	if needFallback {
		log.Fatalln("need a upstream as fall back")
	}
	return l
}

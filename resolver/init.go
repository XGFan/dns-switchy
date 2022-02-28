package resolver

import (
	"bytes"
	"dns-switchy/config"
	"errors"
	"fmt"
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
	for _, resolverConfig := range conf.Resolvers {
		resolver, err := createResolver(resolverConfig)
		if err != nil {
			log.Fatalln("create resolver fail", err)
		} else {
			l = append(l, resolver)
		}
	}
	return l
}

func createResolver(resolverConfig config.ResolverConfig) (DnsResolver, error) {
	switch resolverConfig.Type() {
	case config.FILTER:
		return NewFilter(resolverConfig.(*config.FilterConfig)), nil
	case config.FILE:
		return NewFile(resolverConfig.(*config.FileConfig)), nil
	case config.FORWORD:
		return NewForward(resolverConfig.(*config.ForwardConfig)), nil
	default:
		return nil, errors.New(fmt.Sprintf("unknown resolver type %s", resolverConfig.Type()))
	}
}

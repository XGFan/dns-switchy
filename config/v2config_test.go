package config

import (
	"reflect"
	"testing"
	"time"
)

func Test_parse(t *testing.T) {
	content := ` 
port: 1053
resolvers:
  - type: filter
    block:
      - AAAA
  - type: lease
    domain: lan
    location: /tmp/dhcp.leases
    refreshInterval: 10m
  - type: host
    system: true
    refreshInterval: 10m
    hosts:
      a.com: 1.1.1.1
      b.com: 2.2.2.2
  - name: cn-dns
    type: forward
    url: 114.114.114.114:53
    rule:
      - llscdn.com
      - llsapp.com
      - liulishuo.com
      - llsserver.com
      - wshifen.com
      - zj186.com
      - aaplimg.com
      - include:v2-rule.txt
  - name: doh
    type: forward
    url: https://cloudflare-dns.com/dns-query
    config:
      timeout: 5s
`
	t.Run("default", func(t *testing.T) {
		got := parse(content)
		target := &SwitchyConfigV2{
			Port: 1053,
			Resolvers: []ResolverConfig{
				&FilterConfig{Block: []string{"AAAA"}},
				&LeaseConfig{
					Domain:          "lan",
					Location:        "/tmp/dhcp.leases",
					RefreshInterval: 10 * time.Minute,
				},
				&HostConfig{
					System:          true,
					RefreshInterval: 10 * time.Minute,
					Hosts: map[string]string{
						"a.com": "1.1.1.1",
						"b.com": "2.2.2.2",
					},
				},
				&ForwardConfig{
					Name: "cn-dns",
					Url:  "114.114.114.114:53",
					Rule: []string{
						"llscdn.com",
						"llsapp.com",
						"liulishuo.com",
						"llsserver.com",
						"wshifen.com",
						"zj186.com",
						"aaplimg.com",
						"include:v2-rule.txt",
					},
				},
				&ForwardConfig{
					Name: "doh",
					Url:  "https://cloudflare-dns.com/dns-query",
					Config: DnsConfig{
						Timeout: time.Second * 5,
					},
				},
			}}
		if !reflect.DeepEqual(got, target) {
			t.Error("not equal")
		}

	})

}

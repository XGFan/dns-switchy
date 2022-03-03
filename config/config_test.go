package config

import (
	"net"
	"os"
	"reflect"
	"testing"
	"time"
)

func Test_parse(t *testing.T) {
	file, e := os.Open("../config.yaml")
	if e != nil {
		t.Error(e)
	}
	t.Run("default", func(t *testing.T) {
		got, err := ParseConfig(file)
		if err != nil {
			t.Error(err)
		}
		target := &SwitchyConfig{
			Port: 1053,
			TTL:  5 * time.Minute,
			Resolvers: []ResolverConfig{
				&FilterConfig{QueryType: []string{"TXT"}},
				&FilterConfig{Rule: []string{"ad.google.com"}},
				&FilterConfig{QueryType: []string{"A"}, Rule: []string{"wechat.com"}},
				&FileConfig{
					Location:        "/tmp/dhcp.leases",
					RefreshInterval: 10 * time.Minute,
					FileType:        "lease",
					ExtraConfig: map[string]string{
						"domain": "lan",
					},
				},
				&FileConfig{
					Location:        "system",
					RefreshInterval: 10 * time.Minute,
					FileType:        "host",
					ExtraContent:    "#语法和host一致\n1.1.1.1 a.com b.com\n2.2.2.2 c.com\n::1 d.com\n",
					ExtraConfig:     nil,
				},
				&ForwardConfig{
					Name: "cn-dns",
					Url:  "114.114.114.114",
					TTL:  600 * time.Second,
					Rule: []string{
						"cn",
						"qq.com",
						"baidu.com",
						"include:v2-rule.txt",
					},
				},
				&ForwardConfig{
					Name: "cf-dns",
					Url:  "https://cloudflare-dns.com/dns-query",
					TTL:  600 * time.Second,
					Config: DnsConfig{
						Timeout: time.Second * 3,
						ServerIP: []net.IP{
							net.ParseIP("104.16.249.249"),
						},
					},
				},
				&ForwardConfig{
					Name: "final-dns",
					Url:  "114.114.114.114",
					TTL:  -1 * time.Second,
				},
			}}
		if !reflect.DeepEqual(got.Port, target.Port) {
			t.Errorf("got %+v, want %+v", got, target)
		}
		if !reflect.DeepEqual(got.TTL, target.TTL) {
			t.Errorf("got %+v, want %+v", got, target)
		}
		for i := range got.Resolvers {
			if !reflect.DeepEqual(got.Resolvers[i], target.Resolvers[i]) {
				t.Errorf("got %+v, want %+v", got.Resolvers[i], target.Resolvers[i])
			}
		}
		//if !reflect.DeepEqual(got, target) {
		//	t.Error("not equal")
		//}
	})

}

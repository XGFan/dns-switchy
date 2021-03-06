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
					TTL:  600 * time.Second,
					Rule: []string{
						"cn",
						"qq.com",
						"baidu.com",
						"include:v2-rule.txt",
					},
					UpstreamConfig: UpstreamConfig{
						Url: "114.114.114.114",
					},
				},
				&ForwardConfig{
					Name: "cf-dns",
					TTL:  0,
					UpstreamConfig: UpstreamConfig{
						Url: "https://cloudflare-dns.com/dns-query",
						Config: DnsConfig{
							Timeout: time.Second * 3,
							ServerIP: []net.IP{
								net.ParseIP("104.16.249.249"),
							},
						},
					},
				},
				&ForwardConfig{
					Name: "final-dns",
					TTL:  -1 * time.Second,
					UpstreamConfig: UpstreamConfig{
						Url: "114.114.114.114",
					},
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

func TestParseHttpAddr(t *testing.T) {
	tests := []struct {
		name    string
		args    string
		want    interface{}
		wantErr bool
	}{
		{name: "ip without port", args: "127.0.0.1", want: "", wantErr: true},
		{name: "ip:port", args: "127.0.0.1:8888", want: "", wantErr: false},
		{name: "only port 1", args: ":8888", want: "", wantErr: false},
		{name: "only port 2", args: "8888", want: "", wantErr: false},
		{name: "file", args: "unix:/tmp/hello.socks", want: "", wantErr: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseHttpAddr(tt.args)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseHttpAddr() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
		})
	}
}

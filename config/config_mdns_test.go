package config

import (
	"strings"
	"testing"
	"time"
)

// TestParseMdnsConfig mdns 类型解析:字段齐备与缺省行为。
func TestParseMdnsConfig(t *testing.T) {
	yaml := `
addr: "0.0.0.0:1053"
resolvers:
  - type: mdns
    interface: br-lan
    ttl: 1m
    negative-ttl: 30s
    timeout: 1s
    rule:
      - local
`
	conf, err := ParseConfig(strings.NewReader(yaml))
	if err != nil {
		t.Fatalf("parse: %v", err)
	}
	if len(conf.Resolvers) != 1 {
		t.Fatalf("want 1 resolver, got %d", len(conf.Resolvers))
	}
	mc, ok := conf.Resolvers[0].(*MdnsConfig)
	if !ok {
		t.Fatalf("want *MdnsConfig, got %T", conf.Resolvers[0])
	}
	if mc.Type() != MDNS {
		t.Fatalf("want type mdns, got %s", mc.Type())
	}
	if mc.Interface != "br-lan" {
		t.Fatalf("interface: %q", mc.Interface)
	}
	if mc.TTL != time.Minute || mc.NegativeTTL != 30*time.Second || mc.Timeout != time.Second {
		t.Fatalf("durations: ttl=%s negative-ttl=%s timeout=%s", mc.TTL, mc.NegativeTTL, mc.Timeout)
	}
	if len(mc.Rule) != 1 || mc.Rule[0] != "local" {
		t.Fatalf("rule: %v", mc.Rule)
	}
}

// TestParseMdnsConfigMinimal 只给 interface 也能解析(其余走运行期默认值)。
func TestParseMdnsConfigMinimal(t *testing.T) {
	yaml := `
resolvers:
  - type: mdns
    interface: eth0
`
	conf, err := ParseConfig(strings.NewReader(yaml))
	if err != nil {
		t.Fatalf("parse: %v", err)
	}
	mc := conf.Resolvers[0].(*MdnsConfig)
	if mc.Interface != "eth0" || mc.TTL != 0 || mc.NegativeTTL != 0 || mc.Timeout != 0 {
		t.Fatalf("unexpected: %+v", mc)
	}
}

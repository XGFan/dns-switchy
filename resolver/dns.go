package resolver

import (
	"github.com/miekg/dns"
	"time"
)

type DnsResolver interface {
	Close()
	Accept(msg *dns.Msg) bool
	Resolve(msg *dns.Msg) (*dns.Msg, error)
	TTL() time.Duration
}

// NftSetAware 由配了 nftset 的 resolver 实现，向 server 钩子暴露目标集合与元素 timeout。
// 未配 nftset 的 resolver 返回空串 set4，钩子据此跳过写集合。本期仅 IPv4（A → set4）。
type NftSetAware interface {
	NftSetSpec() (set4 string, ttl time.Duration)
}

type NoCache struct {
}

func (n NoCache) TTL() time.Duration {
	return -1
}

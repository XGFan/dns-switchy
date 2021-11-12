package config

import (
	"time"
)

type SwitchyConfig struct {
	Port     int               `json:"port,omitempty"`
	Host     map[string]string `json:"host,omitempty"`
	Cache    CacheConfig       `json:"cache"`
	Upstream []UpstreamConfig  `json:"upstream,omitempty"`
}

type CacheConfig struct {
	TTL time.Duration `json:"ttl,omitempty"`
}

type UpstreamConfig struct {
	Name   string    `json:"name,omitempty"`
	Url    string    `json:"url,omitempty"`
	Rule   []string  `json:"rule,omitempty"`
	Config DnsConfig `json:"config,omitempty"`
}

type DnsConfig struct {
	Bootstrap []string      `json:"bootstrap,omitempty"`
	Timeout   time.Duration `json:"timeout,omitempty"`
	ClientIP  string        `json:"clientIP,omitempty"`
}

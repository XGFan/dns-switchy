package config

import (
	"net"
	"time"
)

type SwitchyConfig struct {
	Port     int               `yaml:"port,omitempty"`
	Host     map[string]string `yaml:"host,omitempty"`
	Cache    CacheConfig       `yaml:"cache"`
	Upstream []UpstreamConfig  `yaml:"upstream,omitempty"`
}

type CacheConfig struct {
	TTL time.Duration `yaml:"ttl,omitempty"`
}

type UpstreamConfig struct {
	Name   string    `yaml:"name,omitempty"`
	Url    string    `yaml:"url,omitempty"`
	Rule   []string  `yaml:"rule,omitempty"`
	Config DnsConfig `yaml:"config,omitempty"`
}

type DnsConfig struct {
	Bootstrap []string      `yaml:"bootstrap,omitempty"`
	ServerIP  []net.IP      `yaml:"serverIP,omitempty"`
	Timeout   time.Duration `yaml:"timeout,omitempty"`
	ClientIP  string        `yaml:"clientIP,omitempty"`
}

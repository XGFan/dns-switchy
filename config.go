package main

type SwitchyConfig struct {
	Port     int               `json:"port,omitempty"`
	Host     map[string]string `json:"host,omitempty"`
	Upstream []UpstreamConfig  `json:"upstream,omitempty"`
}

type UpstreamConfig struct {
	Name   string            `json:"name,omitempty"`
	Url    string            `json:"url,omitempty"`
	Rule   []string          `json:"rule,omitempty"`
	Config map[string]string `json:"config,omitempty"`
}

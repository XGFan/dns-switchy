package config

import (
	"gopkg.in/yaml.v2"
	"io"
	"log"
	"time"
)

type SwitchyConfigV2 struct {
	Port      int              `yaml:"port,omitempty"`
	Resolvers []ResolverConfig `yaml:"resolvers,omitempty"`
}
type _SwitchyConfigV2 struct {
	Port      int                      `yaml:"port,omitempty"`
	Resolvers []map[string]interface{} `yaml:"resolvers,omitempty"`
}
type ResolverConfig interface {
	Type() string
}

type FilterConfig struct {
	Block []string      `yaml:"block,omitempty"`
	TTL   time.Duration `yaml:"ttl,omitempty"`
}

func (f FilterConfig) Type() string {
	return "filter"
}

type LeaseConfig struct {
	Domain          string        `yaml:"domain,omitempty"`
	Location        string        `yaml:"location,omitempty"`
	TTL             time.Duration `yaml:"ttl,omitempty"`
	RefreshInterval time.Duration `yaml:"refreshInterval,omitempty"`
}

func (l LeaseConfig) Type() string {
	return "lease"
}

type HostConfig struct {
	System          bool              `yaml:"system,omitempty"`
	Location        string            `yaml:"location,omitempty"`
	RefreshInterval time.Duration     `yaml:"refreshInterval,omitempty"`
	TTL             time.Duration     `yaml:"ttl,omitempty"`
	Hosts           map[string]string `yaml:"hosts,omitempty"`
}

func (h HostConfig) Type() string {
	return "host"
}

type ForwardConfig struct {
	Name   string        `yaml:"name,omitempty"`
	TTL    time.Duration `yaml:"ttl,omitempty"`
	Url    string        `yaml:"url,omitempty"`
	Rule   []string      `yaml:"rule,omitempty"`
	Config DnsConfig     `yaml:"config,omitempty"`
}

func (f ForwardConfig) Type() string {
	return "forward"
}

func ParseV2(filePath io.Reader) *SwitchyConfigV2 {
	_v2 := _SwitchyConfigV2{}
	err := yaml.NewDecoder(filePath).Decode(&_v2)
	if err != nil {
		return nil
	}
	//v2.Port
	resolverConfigs := make([]ResolverConfig, 0, len(_v2.Resolvers))
	for _, resolver := range _v2.Resolvers {
		marshal, _ := yaml.Marshal(resolver)
		var filter ResolverConfig
		switch resolver["type"].(string) {
		case "filter":
			filter = &FilterConfig{}
		case "lease":
			filter = &LeaseConfig{}
		case "host":
			filter = &HostConfig{}
		case "forward":
			filter = &ForwardConfig{}
		default:
			log.Panicf("unknown resolver type: %s", resolver["type"])
		}
		err := yaml.Unmarshal(marshal, filter)
		if err != nil {
			log.Panicf("marshal resolver type: %s fail, %s", resolver["type"], err)
		}
		resolverConfigs = append(resolverConfigs, filter)
	}
	return &SwitchyConfigV2{
		Port:      _v2.Port,
		Resolvers: resolverConfigs,
	}
}

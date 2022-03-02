package config

import (
	"gopkg.in/yaml.v2"
	"io"
	"log"
	"net"
	"time"
)

type SwitchyConfig struct {
	Port      int
	Resolvers []ResolverConfig
	TTL       time.Duration
}

type _SwitchyConfig struct {
	Port      int                      `yaml:"port,omitempty"`
	TTL       time.Duration            `yaml:"ttl,omitempty"`
	Resolvers []map[string]interface{} `yaml:"resolvers,omitempty"`
}

type ResolverType string

const (
	FILTER  ResolverType = "filter"
	FILE    ResolverType = "file"
	FORWARD ResolverType = "forward"
)

type ResolverConfig interface {
	Type() ResolverType
}

type FilterConfig struct {
	Rule      []string `yaml:"rule,omitempty"`
	QueryType []string `yaml:"queryType,omitempty"`
}

func (f FilterConfig) Type() ResolverType {
	return FILTER
}

type FileConfig struct {
	Location        string            `yaml:"location,omitempty"`
	RefreshInterval time.Duration     `yaml:"refreshInterval,omitempty"`
	FileType        string            `yaml:"fileType,omitempty"`
	ExtraContent    string            `yaml:"extraContent,omitempty"`
	ExtraConfig     map[string]string `yaml:"extraConfig,omitempty"`
}

func (h FileConfig) Type() ResolverType {
	return FILE
}

type ForwardConfig struct {
	Name   string        `yaml:"name,omitempty"`
	TTL    time.Duration `yaml:"ttl,omitempty"`
	Url    string        `yaml:"url,omitempty"`
	Rule   []string      `yaml:"rule,omitempty"`
	Config DnsConfig     `yaml:"config,omitempty"`
}

type DnsConfig struct {
	Bootstrap []string      `yaml:"bootstrap,omitempty"`
	ServerIP  []net.IP      `yaml:"serverIP,omitempty"`
	Timeout   time.Duration `yaml:"timeout,omitempty"`
	ClientIP  string        `yaml:"clientIP,omitempty"`
}

func (f ForwardConfig) Type() ResolverType {
	return FORWARD
}

func Parse(filePath io.Reader) *SwitchyConfig {
	_config := _SwitchyConfig{}
	err := yaml.NewDecoder(filePath).Decode(&_config)
	if err != nil {
		log.Panicf("Error parsing config file: %s", err)
	}
	resolverConfigs := make([]ResolverConfig, 0, len(_config.Resolvers))
	for _, resolver := range _config.Resolvers {
		marshal, _ := yaml.Marshal(resolver)
		var filter ResolverConfig
		switch ResolverType(resolver["type"].(string)) {
		case FILTER:
			filter = &FilterConfig{}
		case FILE:
			filter = &FileConfig{}
		case FORWARD:
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
	return &SwitchyConfig{
		Port:      _config.Port,
		TTL:       _config.TTL,
		Resolvers: resolverConfigs,
	}
}

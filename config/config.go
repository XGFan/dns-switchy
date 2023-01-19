package config

import (
	"bytes"
	"fmt"
	"gopkg.in/yaml.v2"
	"io"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"
)

var BasePath string

type SwitchyConfig struct {
	Port      int
	TTL       time.Duration
	Http      *HttpConfig
	Resolvers []ResolverConfig
}
type HttpConfig struct {
	Network string
	Addr    string
}

func (h *HttpConfig) String() string {
	if h == nil {
		return ""
	}
	if h.Network == "tcp" {
		return h.Addr
	}
	return fmt.Sprintf("%s:%s", h.Network, h.Addr)
}

func (h *HttpConfig) CreateListener() (net.Listener, error) {
	if h.Network == "unix" {
		if err := os.RemoveAll(h.Addr); err != nil {
			return nil, err
		}
	}
	return net.Listen(h.Network, h.Addr)
}

type _SwitchyConfig struct {
	Port      int                      `yaml:"port,omitempty"`
	TTL       time.Duration            `yaml:"ttl,omitempty"`
	Http      string                   `yaml:"http,omitempty"`
	Resolvers []map[string]interface{} `yaml:"resolvers,omitempty"`
}

type ResolverType string

const (
	FILTER        ResolverType = "filter"
	FILE          ResolverType = "file"
	FORWARD       ResolverType = "forward"
	FORWARD_GROUP ResolverType = "forward-group"
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
	Name           string        `yaml:"name,omitempty"`
	TTL            time.Duration `yaml:"ttl,omitempty"`
	Rule           []string      `yaml:"rule,omitempty"`
	UpstreamConfig `yaml:",inline"`
}

type DnsConfig struct {
	Bootstrap []string      `yaml:"bootstrap,omitempty"`
	ServerIP  []net.IP      `yaml:"serverIP,omitempty"`
	Timeout   time.Duration `yaml:"timeout,omitempty"`
}

func (f ForwardConfig) Type() ResolverType {
	return FORWARD
}

type UpstreamConfig struct {
	Url    string    `yaml:"url,omitempty"`
	Config DnsConfig `yaml:"config,omitempty"`
}

type ForwardGroupConfig struct {
	Name      string           `yaml:"name,omitempty"`
	TTL       time.Duration    `yaml:"ttl,omitempty"`
	Rule      []string         `yaml:"rule,omitempty"`
	Upstreams []UpstreamConfig `yaml:"upstreams,omitempty"`
}

func (f ForwardGroupConfig) Type() ResolverType {
	return FORWARD_GROUP
}

func ParseConfig(contentReader io.Reader) (*SwitchyConfig, error) {
	_config := _SwitchyConfig{}
	err := yaml.NewDecoder(contentReader).Decode(&_config)
	if err != nil {
		return nil, fmt.Errorf("error parsing config file: %s", err)
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
		case FORWARD_GROUP:
			filter = &ForwardGroupConfig{}
		default:
			return nil, fmt.Errorf("unknown resolver type: %s", resolver["type"])
		}
		err := yaml.Unmarshal(marshal, filter)
		if err != nil {
			return nil, fmt.Errorf("marshal resolver type: %s fail, %s", resolver["type"], err)
		}
		resolverConfigs = append(resolverConfigs, filter)
	}
	httpConfig, err := ParseHttpAddr(_config.Http)
	if err != nil {
		return nil, err
	}
	return &SwitchyConfig{
		Port:      _config.Port,
		TTL:       _config.TTL,
		Http:      httpConfig,
		Resolvers: resolverConfigs,
	}, nil
}

func ParseRule(rules []string) []string {
	parsedRules := make([]string, 0)
	for _, s := range rules {
		if strings.Contains(s, ":") {
			index := strings.Index(s, ":")
			var reader io.ReadCloser
			cmdType := strings.Trim(strings.ToLower(s[0:index]), " ")
			if cmdType == "include" {
				target := s[index+1:]
				if strings.HasPrefix(target, "http") {
					resp, err := http.Get(target)
					if err != nil {
						log.Printf("Read %s fail: %s", target, err)
						reader = io.NopCloser(bytes.NewReader(nil))
					} else {
						reader = resp.Body
					}
				} else {
					var open fs.File
					var err error
					if BasePath != "" && !path.IsAbs(target) {
						open, err = os.DirFS(BasePath).Open(target)
					} else {
						open, err = os.Open(target)
					}
					if err != nil {
						log.Printf("Read %s fail: %s", target, err)
						reader = io.NopCloser(bytes.NewReader(nil))
					} else {
						reader = open
					}
				}
				all, _ := io.ReadAll(reader)
				targetRules := strings.Split(string(all), "\n")
				nestedParsed := ParseRule(targetRules)
				for _, s2 := range nestedParsed {
					parsedRules = append(parsedRules, s2)
				}
			} else {
				log.Printf("unsupported type %s", cmdType)
			}
		} else {
			parsedRules = append(parsedRules, s)
		}
	}
	return parsedRules
}

func ParseHttpAddr(str string) (*HttpConfig, error) {
	if str == "" {
		return nil, nil
	}
	tcpAddr, err := net.ResolveTCPAddr("", str)
	if err == nil {
		return &HttpConfig{"tcp", tcpAddr.String()}, nil
	}
	port, err := strconv.Atoi(str)
	if err == nil {
		return &HttpConfig{"tcp", fmt.Sprintf(":%d", port)}, nil
	}
	if strings.HasPrefix(str, "unix:") {
		return &HttpConfig{"unix", str[5:]}, nil
	}
	return nil, fmt.Errorf("invalid http address: %s", str)
}
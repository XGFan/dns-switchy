package config

import (
	"context"
	"fmt"
	"gopkg.in/yaml.v3"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

var BasePath string

var includeHTTPClient = &http.Client{Timeout: 5 * time.Second}

var v2flyCacheTTL = 24 * time.Hour

// v2flyCacheDir picks a writable directory in this preference order:
//  1. $DNS_SWITCHY_CACHE_DIR if set (lets operators pin a persistent path,
//     e.g. /etc/dns-switchy/cache on OpenWrt where /tmp and /var are tmpfs).
//  2. $HOME/.dns-switchy/cache when HOME is a real directory — procd-spawned
//     services on OpenWrt run with HOME="/", which is treated as unset here.
//  3. $TMPDIR/dns-switchy/cache as a last-resort fallback so the cache is
//     never silently disabled when the higher-priority paths aren't writable.
func v2flyCacheDir() (string, error) {
	candidates := make([]string, 0, 3)
	if custom := strings.TrimSpace(os.Getenv("DNS_SWITCHY_CACHE_DIR")); custom != "" {
		candidates = append(candidates, custom)
	}
	if home, err := os.UserHomeDir(); err == nil && home != "" && home != "/" {
		candidates = append(candidates, filepath.Join(home, ".dns-switchy", "cache"))
	}
	candidates = append(candidates, filepath.Join(os.TempDir(), "dns-switchy", "cache"))

	var lastErr error
	for _, dir := range candidates {
		if err := os.MkdirAll(dir, 0755); err != nil {
			lastErr = err
			continue
		}
		return dir, nil
	}
	return "", fmt.Errorf("create cache dir: all candidates failed (last: %w)", lastErr)
}

func v2flyCachePath(listName string) (string, error) {
	dir, err := v2flyCacheDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, fmt.Sprintf("v2fly-%s.txt", listName)), nil
}

func readV2flyCache(listName string) (lines []string, fresh bool, err error) {
	path, err := v2flyCachePath(listName)
	if err != nil {
		return nil, false, err
	}
	info, err := os.Stat(path)
	if err != nil {
		return nil, false, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, false, err
	}
	isFresh := time.Since(info.ModTime()) < v2flyCacheTTL
	return strings.Split(string(data), "\n"), isFresh, nil
}

func writeV2flyCache(listName string, lines []string) error {
	path, err := v2flyCachePath(listName)
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(strings.Join(lines, "\n")), 0644)
}

var (
	pendingV2flyMu sync.Mutex
	pendingV2fly   = make(map[string]struct{})

	// memV2flyCache is a process-local fallback for hosts where the disk cache
	// directory is not writable (read-only container fs, hostile permissions).
	// It is populated only when writeV2flyCache fails, so the freshly downloaded
	// rules are still applied on the next reload instead of being thrown away.
	// Disk persistence remains preferred whenever it works.
	memV2flyMu    sync.Mutex
	memV2flyCache = make(map[string][]string)
)

func storeV2flyMem(name string, lines []string) {
	memV2flyMu.Lock()
	defer memV2flyMu.Unlock()
	memV2flyCache[name] = lines
}

func loadV2flyMem(name string) ([]string, bool) {
	memV2flyMu.Lock()
	defer memV2flyMu.Unlock()
	lines, ok := memV2flyCache[name]
	return lines, ok
}

func clearV2flyMem(name string) {
	memV2flyMu.Lock()
	defer memV2flyMu.Unlock()
	delete(memV2flyCache, name)
}

func markV2flyPending(name string) {
	pendingV2flyMu.Lock()
	defer pendingV2flyMu.Unlock()
	pendingV2fly[name] = struct{}{}
}

func clearV2flyPending(name string) {
	pendingV2flyMu.Lock()
	defer pendingV2flyMu.Unlock()
	delete(pendingV2fly, name)
}

func snapshotPendingV2fly() []string {
	pendingV2flyMu.Lock()
	defer pendingV2flyMu.Unlock()
	out := make([]string, 0, len(pendingV2fly))
	for k := range pendingV2fly {
		out = append(out, k)
	}
	return out
}

// StartV2flyRetry owns all v2fly network downloads. It periodically processes
// the pending set populated by fetchV2flyList (entries with missing or stale
// cache) and writes fresh cache files; on any successful download it calls
// onRefresh so the caller can reload the config and rebuild matchers.
//
// A short grace delay before the first attempt lets the DNS server bind so
// downloads do not chase a self-referential resolver during startup.
func StartV2flyRetry(ctx context.Context, interval time.Duration, onRefresh func()) {
	if interval <= 0 {
		interval = 30 * time.Second
	}
	go func() {
		select {
		case <-ctx.Done():
			return
		case <-time.After(2 * time.Second):
		}
		runV2flyAttempt(onRefresh)

		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				runV2flyAttempt(onRefresh)
			}
		}
	}()
}

func runV2flyAttempt(onRefresh func()) {
	pending := snapshotPendingV2fly()
	if len(pending) == 0 {
		return
	}
	refreshed := false
	for _, name := range pending {
		lines, err := downloadV2flyList(name)
		if err != nil {
			log.Printf("v2fly %s: background download failed: %v", name, err)
			continue
		}
		if writeErr := writeV2flyCache(name, lines); writeErr != nil {
			// Disk persistence failed; stash the freshly downloaded rules in
			// memory so the next reload can still apply them. Keeps the
			// resolver functional on read-only filesystems.
			storeV2flyMem(name, lines)
			log.Printf("v2fly %s: cache write failed: %v (using in-memory copy)", name, writeErr)
		} else {
			clearV2flyMem(name)
		}
		clearV2flyPending(name)
		log.Printf("v2fly %s: background download succeeded (%d lines)", name, len(lines))
		refreshed = true
	}
	if refreshed && onRefresh != nil {
		onRefresh()
	}
}

type SwitchyConfig struct {
	Addr      string
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
	Addr      string                   `yaml:"addr,omitempty"`
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
	PRELOADER     ResolverType = "preloader"
	MOCK          ResolverType = "mock"
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
	BreakOnFail    bool          `yaml:"break-on-fail,omitempty"`
	Rule           []string      `yaml:"rule,omitempty"`
	UpstreamConfig `yaml:",inline"`
	Upstreams      []UpstreamConfig `yaml:"upstreams,omitempty"`
}

type DnsConfig struct {
	ServerIP []net.IP      `yaml:"serverIP,omitempty"`
	Timeout  time.Duration `yaml:"timeout,omitempty"`
}

func (f ForwardConfig) Type() ResolverType {
	return FORWARD
}

type UpstreamConfig struct {
	Url    string    `yaml:"url,omitempty"`
	Config DnsConfig `yaml:"config,omitempty"`
}

type PreloaderConfig struct {
	ForwardConfig `yaml:",inline"`
}

func (p PreloaderConfig) Type() ResolverType {
	return PRELOADER
}

type MockConfig struct {
	Rule      []string `yaml:"rule,omitempty"`
	QueryType []string `yaml:"queryType,omitempty"`
	Answer    string
}

func (m MockConfig) Type() ResolverType {
	return MOCK
}

func ParseConfig(contentReader io.Reader) (*SwitchyConfig, error) {
	_config := _SwitchyConfig{}
	basePath := inferParseBasePath(contentReader)
	err := yaml.NewDecoder(contentReader).Decode(&_config)
	if err != nil {
		return nil, fmt.Errorf("error parsing config file: %s", err)
	}
	resolverConfigs := make([]ResolverConfig, 0, len(_config.Resolvers))
	for index, resolver := range _config.Resolvers {
		resolverType, err := extractResolverType(resolver, index)
		if err != nil {
			return nil, err
		}
		marshal, _ := yaml.Marshal(resolver)
		var filter ResolverConfig
		switch ResolverType(resolverType) {
		case FILTER:
			filter = &FilterConfig{}
		case FILE:
			filter = &FileConfig{}
		case FORWARD, FORWARD_GROUP:
			filter = &ForwardConfig{}
		case MOCK:
			filter = &MockConfig{}
		case PRELOADER:
			filter = &PreloaderConfig{}
		default:
			return nil, fmt.Errorf("unknown resolver type: %s", resolverType)
		}
		err = yaml.Unmarshal(marshal, filter)
		if err != nil {
			return nil, fmt.Errorf("marshal resolver type: %s fail, %s", resolverType, err)
		}
		if err = normalizeResolverRules(filter, basePath); err != nil {
			return nil, err
		}
		resolverConfigs = append(resolverConfigs, filter)
	}
	httpConfig, err := ParseHttpAddr(_config.Http)
	if err != nil {
		return nil, err
	}
	return &SwitchyConfig{
		Addr:      _config.Addr,
		TTL:       _config.TTL,
		Http:      httpConfig,
		Resolvers: resolverConfigs,
	}, nil
}

func ParseRule(rules []string) ([]string, error) {
	parsedRules, err := parseRule(rules, nil, BasePath)
	if err != nil {
		return nil, err
	}
	return parsedRules, nil
}

func extractResolverType(resolver map[string]interface{}, index int) (string, error) {
	rawType, ok := resolver["type"]
	if !ok {
		return "", fmt.Errorf("resolver[%d] missing type", index)
	}
	resolverType, ok := rawType.(string)
	if !ok {
		return "", fmt.Errorf("resolver[%d] type must be string, got %T", index, rawType)
	}
	resolverType = strings.TrimSpace(resolverType)
	if resolverType == "" {
		return "", fmt.Errorf("resolver[%d] type must not be empty", index)
	}
	return resolverType, nil
}

func inferParseBasePath(contentReader io.Reader) string {
	if BasePath != "" {
		return BasePath
	}

	type namedReader interface {
		Name() string
	}

	readerWithName, ok := contentReader.(namedReader)
	if !ok {
		return BasePath
	}

	fileName := strings.TrimSpace(readerWithName.Name())
	if fileName == "" {
		return BasePath
	}

	absoluteName, err := filepath.Abs(fileName)
	if err != nil {
		return filepath.Dir(fileName)
	}
	return filepath.Dir(absoluteName)
}

func normalizeResolverRules(resolverConfig ResolverConfig, basePath string) error {
	var (
		rules  []string
		assign func([]string)
	)

	switch config := resolverConfig.(type) {
	case *FilterConfig:
		rules = config.Rule
		assign = func(parsed []string) { config.Rule = parsed }
	case *ForwardConfig:
		rules = config.Rule
		assign = func(parsed []string) { config.Rule = parsed }
	case *PreloaderConfig:
		rules = config.Rule
		assign = func(parsed []string) { config.Rule = parsed }
	case *MockConfig:
		rules = config.Rule
		assign = func(parsed []string) { config.Rule = parsed }
	default:
		return nil
	}
	if rules == nil {
		return nil
	}

	parsedRules, err := parseRule(rules, nil, basePath)
	if err != nil {
		return err
	}
	assign(parsedRules)
	return nil
}

func parseRule(rules []string, visited map[string]struct{}, basePath string) ([]string, error) {
	if visited == nil {
		visited = make(map[string]struct{})
	}
	parsedRules := make([]string, 0, len(rules))
	for _, s := range rules {
		rule := strings.TrimSpace(s)
		if rule == "" || strings.HasPrefix(rule, "#") {
			continue
		}

		cmdType, target, hasCommand := strings.Cut(rule, ":")
		if !hasCommand {
			parsedRules = append(parsedRules, rule)
			continue
		}

		cmdType = strings.TrimSpace(strings.ToLower(cmdType))

		switch cmdType {
		case "include":
			resolvedTarget, isHTTP, err := resolveIncludeTarget(target, basePath)
			if err != nil {
				return nil, err
			}
			if _, ok := visited[resolvedTarget]; ok {
				return nil, fmt.Errorf("include cycle detected: %s", resolvedTarget)
			}

			visited[resolvedTarget] = struct{}{}
			targetRules, err := readIncludeRules(resolvedTarget, isHTTP)
			if err != nil {
				delete(visited, resolvedTarget)
				return nil, err
			}
			nestedParsed, err := parseRule(targetRules, visited, basePath)
			delete(visited, resolvedTarget)
			if err != nil {
				return nil, err
			}
			parsedRules = append(parsedRules, nestedParsed...)

		case "v2fly":
			listName := strings.TrimSpace(target)
			if listName == "" {
				return nil, fmt.Errorf("v2fly list name is empty")
			}
			lines, err := fetchV2flyList(listName)
			if err != nil {
				return nil, err
			}
			parsedRules = append(parsedRules, parseV2flyRules(lines)...)

		default:
			parsedRules = append(parsedRules, rule)
		}
	}
	return parsedRules, nil
}

func resolveIncludeTarget(target string, basePath string) (string, bool, error) {
	target = strings.TrimSpace(target)
	if target == "" {
		return "", false, fmt.Errorf("include target is empty")
	}

	if strings.HasPrefix(target, "http://") || strings.HasPrefix(target, "https://") {
		parsedURL, err := url.Parse(target)
		if err != nil {
			return "", true, fmt.Errorf("invalid include url %s: %w", target, err)
		}
		return parsedURL.String(), true, nil
	}

	resolvedTarget := target
	if basePath != "" && !filepath.IsAbs(resolvedTarget) {
		resolvedTarget = filepath.Join(basePath, resolvedTarget)
	}
	absoluteTarget, err := filepath.Abs(resolvedTarget)
	if err != nil {
		return "", false, fmt.Errorf("resolve include path %s fail: %w", target, err)
	}
	return filepath.Clean(absoluteTarget), false, nil
}

func readIncludeRules(target string, isHTTP bool) ([]string, error) {
	var (
		reader io.ReadCloser
		err    error
	)

	if isHTTP {
		resp, requestErr := includeHTTPClient.Get(target)
		if requestErr != nil {
			return nil, fmt.Errorf("request include %s fail: %w", target, requestErr)
		}
		if resp.StatusCode != http.StatusOK {
			closeErr := resp.Body.Close()
			if closeErr != nil {
				return nil, fmt.Errorf("request include %s fail: status %s and close body: %w", target, resp.Status, closeErr)
			}
			return nil, fmt.Errorf("request include %s fail: status %s", target, resp.Status)
		}
		reader = resp.Body
	} else {
		reader, err = os.Open(target)
		if err != nil {
			return nil, fmt.Errorf("open include %s fail: %w", target, err)
		}
	}

	all, err := io.ReadAll(reader)
	closeErr := reader.Close()
	if err != nil {
		return nil, fmt.Errorf("read include %s fail: %w", target, err)
	}
	if closeErr != nil {
		return nil, fmt.Errorf("close include %s fail: %w", target, closeErr)
	}
	return strings.Split(string(all), "\n"), nil
}

// v2flyPendingSentinel keeps a v2fly:<list> rule from collapsing the resolver
// to AcceptAll while the cache is being fetched in the background. The .invalid
// TLD is reserved by RFC 6761, so this domain can never resolve nor match a
// real query — the resolver effectively contributes nothing from this entry
// until the background download writes a real cache and the config reloads.
const v2flyPendingSentinel = "full:__v2fly_pending__.invalid"

func fetchV2flyList(listName string) ([]string, error) {
	if lines, ok := loadV2flyMem(listName); ok {
		log.Printf("v2fly %s: using in-memory rules (disk cache unwritable)", listName)
		clearV2flyPending(listName)
		return lines, nil
	}
	cached, fresh, cacheErr := readV2flyCache(listName)
	if cacheErr == nil {
		if fresh {
			log.Printf("v2fly %s: using cached rules", listName)
			clearV2flyPending(listName)
			return cached, nil
		}
		log.Printf("v2fly %s: using stale cached rules; scheduling background refresh", listName)
		markV2flyPending(listName)
		return cached, nil
	}

	log.Printf("v2fly %s: no cache; scheduling background download", listName)
	markV2flyPending(listName)
	return []string{v2flyPendingSentinel}, nil
}

func downloadV2flyList(listName string) ([]string, error) {
	v2flyURL := fmt.Sprintf("https://raw.githubusercontent.com/v2fly/domain-list-community/release/%s.txt", listName)
	return readIncludeRules(v2flyURL, true)
}

func parseV2flyRules(lines []string) []string {
	rules := make([]string, 0, len(lines))
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		prefix, value, hasPrefix := strings.Cut(line, ":")
		if !hasPrefix {
			rules = append(rules, stripV2flyAttrs(line))
			continue
		}

		prefix = strings.TrimSpace(strings.ToLower(prefix))
		value = stripV2flyAttrs(strings.TrimSpace(value))
		if value == "" {
			continue
		}

		switch prefix {
		case "domain":
			rules = append(rules, value)
		case "full", "keyword", "regexp":
			rules = append(rules, prefix+":"+value)
		default:
			continue
		}
	}
	return rules
}

// stripV2flyAttrs removes @attribute tags from a v2fly domain value.
// e.g. "a.alimama.cn:@ads" → "a.alimama.cn"
func stripV2flyAttrs(s string) string {
	if idx := strings.Index(s, ":@"); idx >= 0 {
		s = s[:idx]
	}
	return strings.TrimSpace(s)
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

package main

import (
	"fmt"
	"net/http"
	"sort"
	"sync"
	"time"

	"dns-switchy/resolver"

	"github.com/miekg/dns"
)

// cacheHitName 是缓存命中时 Success 收到的 resolver 名，统计里单列为 cache_hits。
const cacheHitName = "dnsCache"

// queryStats 统计经 UDP/TCP 进来的 DNS 查询结果（面板的 /api/query 诊断查询不计），供
// GET /api/stats 读取。按 resolver 名字计数，名字与查询日志里的 resolver 字段一致。
// 方法对 nil 接收者是空操作：单测里直接构造的 server 不带统计。
type queryStats struct {
	since     time.Time
	mu        sync.Mutex
	total     uint64
	rcodes    map[string]uint64
	resolvers map[string]*resolverCount
}

type resolverCount struct {
	queries  uint64
	failures uint64
}

func newQueryStats() *queryStats {
	return &queryStats{
		since:     time.Now(),
		rcodes:    map[string]uint64{},
		resolvers: map[string]*resolverCount{},
	}
}

func (st *queryStats) record(name string, rcode int, failed bool) {
	if st == nil {
		return
	}
	st.mu.Lock()
	defer st.mu.Unlock()
	st.total++
	st.rcodes[dns.RcodeToString[rcode]]++
	if name == "" {
		return
	}
	rc := st.resolvers[name]
	if rc == nil {
		rc = &resolverCount{}
		st.resolvers[name] = rc
	}
	rc.queries++
	if failed {
		rc.failures++
	}
}

type resolverStats struct {
	Name     string `json:"name"`
	Queries  uint64 `json:"queries"`
	Failures uint64 `json:"failures"`
	// Alive 只对带健康追踪的 resolver（forward / forward-group / preloader）给出。
	Alive *bool `json:"alive,omitempty"`
}

type statsResponse struct {
	Since     time.Time         `json:"since"`
	Total     uint64            `json:"total"`
	CacheHits uint64            `json:"cache_hits"`
	Rcodes    map[string]uint64 `json:"rcodes"`
	Resolvers []resolverStats   `json:"resolvers"`
}

// snapshot 按当前链顺序列出 resolver（含尚无查询的），已不在链上但有计数的（热替换前的旧名字）
// 按名字排在后面。
func (st *queryStats) snapshot(chain []resolver.DnsResolver) statsResponse {
	st.mu.Lock()
	defer st.mu.Unlock()
	resp := statsResponse{Since: st.since, Total: st.total, Rcodes: map[string]uint64{}}
	for k, v := range st.rcodes {
		resp.Rcodes[k] = v
	}
	if rc := st.resolvers[cacheHitName]; rc != nil {
		resp.CacheHits = rc.queries
	}
	listed := map[string]bool{cacheHitName: true}
	for _, r := range chain {
		name := fmt.Sprintf("%s", r)
		if listed[name] {
			continue
		}
		listed[name] = true
		item := resolverStats{Name: name}
		if rc := st.resolvers[name]; rc != nil {
			item.Queries, item.Failures = rc.queries, rc.failures
		}
		if h, ok := r.(resolver.HealthAware); ok {
			alive := h.Alive()
			item.Alive = &alive
		}
		resp.Resolvers = append(resp.Resolvers, item)
	}
	var rest []string
	for name := range st.resolvers {
		if !listed[name] {
			rest = append(rest, name)
		}
	}
	sort.Strings(rest)
	for _, name := range rest {
		rc := st.resolvers[name]
		resp.Resolvers = append(resp.Resolvers, resolverStats{Name: name, Queries: rc.queries, Failures: rc.failures})
	}
	return resp
}

// apiStatsHandler serves GET /api/stats.
func (s *DnsSwitchyServer) apiStatsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if s.stats == nil {
		http.Error(w, "stats not enabled", http.StatusNotFound)
		return
	}
	gen := s.acquireGen()
	defer s.releaseGen(gen)
	var chain []resolver.DnsResolver
	if gen != nil {
		chain = gen.resolvers
	}
	writeJSON(w, http.StatusOK, s.stats.snapshot(chain))
}

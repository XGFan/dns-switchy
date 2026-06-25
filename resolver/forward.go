package resolver

import (
	"context"
	"dns-switchy/config"
	"dns-switchy/util"
	"errors"
	"fmt"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"github.com/miekg/dns"
	"log"
	"net/netip"
	"strings"
	"sync"
	"time"
)

var BreakError = errors.New("stop on fail")

type Forward struct {
	Name string
	upstream.Upstream
	util.DomainMatcher
	ttl         time.Duration
	stat        ForwardStat
	breakOnFail bool
	nftSet      string
	nftSetTTL   time.Duration
}

func (forward *Forward) TTL() time.Duration {
	return forward.ttl
}

func (forward *Forward) NftSetSpec() (set4 string, ttl time.Duration) {
	return forward.nftSet, forward.nftSetTTL
}

func (forward *Forward) Close() {
	_ = forward.Upstream.Close()
	log.Printf("%s closed", forward)
}

func (forward *Forward) String() string {
	return forward.Name
}

func (forward *Forward) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	domain := strings.TrimRight(question.Name, ".")
	return forward.MatchDomain(domain)
}

func (forward *Forward) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	if forward.stat.isAlive() {
		resp, err := forward.Exchange(msg)
		if changed, alive := forward.stat.checkStatus(err); changed && !alive {
			log.Printf("%s is dead, will skip", forward.String())
		}
		if err != nil {
			if forward.breakOnFail {
				return resp, BreakError
			}
		}
		return resp, err
	} else {
		probe := msg.Copy()
		go func(probe *dns.Msg) {
			_, err := forward.Exchange(probe)
			if changed, alive := forward.stat.checkStatus(err); changed && alive {
				log.Printf("%s is alive, will cusome", forward.String())
			}
		}(probe)
		if forward.breakOnFail {
			return nil, BreakError
		}
		return nil, errors.New(forward.String() + ": too many fail, just skip")
	}
}

type ForwardStat struct {
	mu           sync.Mutex
	alive        bool
	failCount    int
	successCount int
}

func (stat *ForwardStat) isAlive() bool {
	stat.mu.Lock()
	defer stat.mu.Unlock()
	return stat.alive
}

func (stat *ForwardStat) snapshot() (alive bool, failCount int, successCount int) {
	stat.mu.Lock()
	defer stat.mu.Unlock()
	return stat.alive, stat.failCount, stat.successCount
}

func (stat *ForwardStat) checkStatus(e error) (changed bool, alive bool) {
	stat.mu.Lock()
	defer stat.mu.Unlock()

	if stat.alive {
		if e != nil {
			stat.failCount += 1
			if stat.failCount >= 5 {
				stat.failCount = 0
				stat.successCount = 0
				stat.alive = false
				changed = true
			}
		} else {
			stat.failCount = 0
		}
	} else {
		if e != nil {
			stat.successCount = 0
		} else {
			stat.successCount += 1
			if stat.successCount >= 5 {
				stat.failCount = 0
				stat.successCount = 0
				stat.alive = true
				changed = true
			}
		}
	}
	return changed, stat.alive
}

// MultiUpstream races several upstreams concurrently (first success wins) and
// tracks in-flight Exchange goroutines so Close() can wait for losers to exit
// before tearing down the upstream connections (avoids Exchange-after-close).
type MultiUpstream struct {
	upstreams []upstream.Upstream
	wg        sync.WaitGroup
}

func NewMultiUpstream(upstreams []upstream.Upstream) *MultiUpstream {
	return &MultiUpstream{upstreams: upstreams}
}

func (mu *MultiUpstream) Close() error {
	// Wait for all in-flight racing Exchange goroutines (the losers that are
	// still blocked inside up.Exchange) to return before closing upstreams.
	mu.wg.Wait()
	for _, u := range mu.upstreams {
		_ = u.Close()
	}
	return nil
}

func (mu *MultiUpstream) Exchange(m *dns.Msg) (*dns.Msg, error) {
	if len(mu.upstreams) == 1 {
		// Single upstream: synchronous, no goroutine, already covered by the
		// caller's lifecycle (outer RCU). No WaitGroup tracking needed.
		return mu.upstreams[0].Exchange(m)
	}
	result := make(chan interface{})
	ctx, cancelFunc := context.WithCancel(context.Background())
	defer cancelFunc()
	for _, u := range mu.upstreams {
		mu.wg.Add(1)
		go func(up upstream.Upstream, q *dns.Msg) {
			defer mu.wg.Done()
			resp, err := up.Exchange(q.Copy())
			var r interface{}
			if err != nil {
				r = err
			} else {
				if resp.Rcode == dns.RcodeRefused {
					r = errors.New(up.Address() + " refused request: " + q.Question[0].String())
				} else {
					r = resp
				}
			}
			select {
			case <-ctx.Done():
				return
			case result <- r:
				return
			}
		}(u, m)
	}
	for range mu.upstreams {
		ret := <-result
		if r, ok := ret.(*dns.Msg); ok {
			return r, nil
		}
	}
	return nil, errors.New("all upstreams fail")
}

func (mu *MultiUpstream) Address() string {
	addresses := make([]string, 0)
	for _, u := range mu.upstreams {
		addresses = append(addresses, u.Address())
	}
	return strings.Join(addresses, ",")
}

func NewForward(config *config.ForwardConfig) (*Forward, error) {
	var err error
	domainMatcher, err := util.NewDomainMatcher(config.Rule)
	if err != nil {
		return nil, fmt.Errorf("init domain matcher fail: %w", err)
	}
	upstreams := make([]upstream.Upstream, 0)
	if config.UpstreamConfig.Url != "" {
		firstLevel, err := createUpStream(config.UpstreamConfig)
		if err == nil {
			upstreams = append(upstreams, firstLevel)
		} else {
			log.Printf("init first class upstream with %v fail: %v ", config.UpstreamConfig, err)
		}
	}
	for _, upConfig := range config.Upstreams {
		one, err := createUpStream(upConfig)
		if err == nil {
			upstreams = append(upstreams, one)
		} else {
			log.Printf("init upstream with %v fail: %v ", upConfig, err)
		}
	}
	if len(upstreams) == 0 {
		err = fmt.Errorf("all url fails")
	}
	up := NewMultiUpstream(upstreams)

	if err != nil {
		return nil, fmt.Errorf("init upstream with %v fail: %w ", config, err)
	}
	return &Forward{
		Name:          config.Name,
		Upstream:      up,
		DomainMatcher: domainMatcher,
		ttl:           config.TTL,
		stat:          ForwardStat{alive: true},
		breakOnFail:   config.BreakOnFail,
		nftSet:        config.NftSet,
		nftSetTTL:     config.NftSetTTL,
	}, nil
}

func createUpStream(upConfig config.UpstreamConfig) (upstream.Upstream, error) {
	var sr = upstream.StaticResolver{}
	if upConfig.Config.ServerIP != nil {
		for _, ipa := range upConfig.Config.ServerIP {
			sr = append(sr, netip.MustParseAddr(ipa.String()))
		}
	}
	one, e := upstream.AddressToUpstream(upConfig.Url, &upstream.Options{
		Bootstrap: sr,
		Timeout:   upConfig.Config.Timeout,
	})
	return one, e
}

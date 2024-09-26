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
}

func (forward *Forward) TTL() time.Duration {
	return forward.ttl
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
	if forward.stat.alive {
		resp, err := forward.Exchange(msg)
		if forward.stat.checkStatus(err) {
			log.Printf("%s is dead, will skip", forward.String())
		}
		if err != nil {
			if forward.breakOnFail {
				return resp, BreakError
			}
		}
		return resp, err
	} else {
		go func() {
			_, err := forward.Exchange(msg)
			if forward.stat.checkStatus(err) {
				log.Printf("%s is alive, will cusome", forward.String())
			}
		}()
		if forward.breakOnFail {
			return nil, BreakError
		}
		return nil, errors.New(forward.String() + ": too many fail, just skip")
	}
}

type ForwardStat struct {
	alive        bool
	failCount    int
	successCount int
}

func (stat *ForwardStat) checkStatus(e error) (changed bool) {
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
	return
}

type MultiUpstream []upstream.Upstream

func (mu MultiUpstream) Close() error {
	for _, u := range mu {
		_ = u.Close()
	}
	return nil
}

func (mu MultiUpstream) Exchange(m *dns.Msg) (*dns.Msg, error) {
	result := make(chan interface{})
	ctx, cancelFunc := context.WithCancel(context.Background())
	defer cancelFunc()
	for _, u := range mu {
		go func(up upstream.Upstream, q *dns.Msg) {
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
	for range mu {
		ret := <-result
		if r, ok := ret.(*dns.Msg); ok {
			return r, nil
		}
	}
	return nil, errors.New("all upstreams fail")
}

func (mu MultiUpstream) Address() string {
	addresses := make([]string, 0)
	for _, u := range mu {
		addresses = append(addresses, u.Address())
	}
	return strings.Join(addresses, ",")
}

func NewForwardGroup(config *config.ForwardGroupConfig) (*Forward, error) {
	var up upstream.Upstream
	var err error
	upstreams := make([]upstream.Upstream, 0)
	for _, upConfig := range config.Upstreams {
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
		if e == nil {
			upstreams = append(upstreams, one)
		} else {
			log.Printf("init upstream with %v fail: %v ", upConfig, err)
		}
	}
	if len(upstreams) == 0 {
		err = fmt.Errorf("all url fails")
	}
	up = MultiUpstream(upstreams)

	if err != nil {
		return nil, fmt.Errorf("init upstream with %v fail: %w ", config, err)
	}
	return &Forward{
		Name:          config.Name,
		Upstream:      up,
		DomainMatcher: util.NewDomainMatcher(config.Rule),
		ttl:           config.TTL,
		stat:          ForwardStat{alive: true},
		breakOnFail:   config.BreakOnFail,
	}, nil
}

func NewForward(config *config.ForwardConfig) (*Forward, error) {
	var sr = upstream.StaticResolver{}
	if config.Config.ServerIP != nil {
		for _, ipa := range config.Config.ServerIP {
			sr = append(sr, netip.MustParseAddr(ipa.String()))
		}
	}

	up, err := upstream.AddressToUpstream(config.Url, &upstream.Options{
		Bootstrap: sr,
		Timeout:   config.Config.Timeout,
	})
	if err != nil {
		return nil, fmt.Errorf("init upstream with %v fail: %w ", config, err)
	}
	return &Forward{
		Name:          config.Name,
		Upstream:      up,
		DomainMatcher: util.NewDomainMatcher(config.Rule),
		ttl:           config.TTL,
		stat:          ForwardStat{alive: true},
		breakOnFail:   config.BreakOnFail,
	}, nil
}

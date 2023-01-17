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
	"net"
	"strings"
	"time"
)

const (
	EdnsCSDefaultNetmaskV4 uint8 = 24  // default network mask for IPv4 address for EDNS ClientSubnet option
	EdnsCSDefaultNetmaskV6 uint8 = 112 // default network mask for IPv6 address for EDNS ClientSubnet option
)

type Forward struct {
	Name string
	upstream.Upstream
	util.DomainMatcher
	clientIP string
	ttl      time.Duration
	stat     ForwardStat
}

func (upstreamDNS *Forward) TTL() time.Duration {
	return upstreamDNS.ttl
}

func (upstreamDNS *Forward) Close() {
	log.Printf("%s closed", upstreamDNS)
}

func (upstreamDNS *Forward) String() string {
	return upstreamDNS.Name
}

func (upstreamDNS *Forward) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	domain := strings.TrimRight(question.Name, ".")
	return upstreamDNS.MatchDomain(domain)
}

func (upstreamDNS *Forward) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	if upstreamDNS.clientIP != "" {
		setECS(msg, net.ParseIP(upstreamDNS.clientIP))
	}
	if upstreamDNS.stat.alive {
		exchange, err := upstreamDNS.Exchange(msg)
		if upstreamDNS.stat.checkStatus(err) {
			log.Printf("%s is dead, will skip", upstreamDNS.String())
		}
		return exchange, err
	} else {
		go func() {
			_, err := upstreamDNS.Exchange(msg)
			if upstreamDNS.stat.checkStatus(err) {
				log.Printf("%s is alive, will cusome", upstreamDNS.String())
			}
		}()
		return nil, errors.New(upstreamDNS.String() + ": too many fail, just skip")
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

func setECS(m *dns.Msg, ip net.IP) {
	e := new(dns.EDNS0_SUBNET)
	e.Code = dns.EDNS0SUBNET
	if ip.To4() != nil {
		e.Family = 1
		e.SourceNetmask = EdnsCSDefaultNetmaskV4
		e.Address = ip.To4().Mask(net.CIDRMask(int(e.SourceNetmask), 32))
	} else {
		e.Family = 2
		e.SourceNetmask = EdnsCSDefaultNetmaskV6
		e.Address = ip.Mask(net.CIDRMask(int(e.SourceNetmask), 128))
	}
	e.SourceScope = 0

	// If OPT record already exists - add EDNS option inside it
	// Note that servers may return FORMERR if they meet 2 OPT records.
	for _, ex := range m.Extra {
		if ex.Header().Rrtype == dns.TypeOPT {
			opt := ex.(*dns.OPT)
			opt.Option = append(opt.Option, e)
		}
	}

	// Create an OPT record and add EDNS option inside it
	o := new(dns.OPT)
	o.SetUDPSize(4096)
	o.Hdr.Name = "."
	o.Hdr.Rrtype = dns.TypeOPT
	o.Option = append(o.Option, e)
	m.Extra = append(m.Extra, o)
}

type MultiUpstream []upstream.Upstream

func (mu MultiUpstream) Exchange(m *dns.Msg) (*dns.Msg, error) {
	result := make(chan interface{})
	ctx, cancelFunc := context.WithCancel(context.Background())
	defer cancelFunc()
	for _, u := range mu {
		go func(up upstream.Upstream, q *dns.Msg) {
			exchange, err := up.Exchange(q.Copy())
			var r interface{}
			if err != nil {
				r = err
			} else {
				if exchange.Rcode == dns.RcodeRefused {
					r = errors.New(up.Address() + " refused request: " + q.Question[0].String())
				} else {
					r = exchange
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
		one, e := upstream.AddressToUpstream(upConfig.Url, &upstream.Options{
			Bootstrap:     upConfig.Config.Bootstrap,
			Timeout:       upConfig.Config.Timeout,
			ServerIPAddrs: upConfig.Config.ServerIP,
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
	}, nil
}

func NewForward(config *config.ForwardConfig) (*Forward, error) {
	up, err := upstream.AddressToUpstream(config.Url, &upstream.Options{
		Bootstrap:     config.Config.Bootstrap,
		Timeout:       config.Config.Timeout,
		ServerIPAddrs: config.Config.ServerIP,
	})
	if err != nil {
		return nil, fmt.Errorf("init upstream with %v fail: %w ", config, err)
	}
	return &Forward{
		Name:          config.Name,
		Upstream:      up,
		DomainMatcher: util.NewDomainMatcher(config.Rule),
		clientIP:      config.Config.ClientIP,
		ttl:           config.TTL,
		stat:          ForwardStat{alive: true},
	}, nil
}
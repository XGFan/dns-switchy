package resolver

import (
	"dns-switchy/matcher"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"github.com/miekg/dns"
	"log"
	"net"
	"strings"
	"time"
)

type DnsResolver interface {
	HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool
}

type UpstreamDNS struct {
	Name string
	upstream.Upstream
	matcher.Matcher
	clientIP   string
	cache      map[dns.Question]CacheItem
	cacheLimit int
}

type CacheItem struct {
	validBefore time.Time
	item        *dns.Msg
}

func (upstreamDNS *UpstreamDNS) String() string {
	return upstreamDNS.Name
}

func (upstreamDNS *UpstreamDNS) HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool {
	domain := strings.TrimRight(msg.Question[0].Name, ".")
	if upstreamDNS.Match(domain) {
		err := upstreamDNS.forwarded(writer, msg)
		if err != nil {
			log.Printf("upstream [%s] error: %v\n", upstreamDNS.Name, err)
		}
		return true
	}
	return false
}

func (upstreamDNS *UpstreamDNS) checkCache(question *dns.Question) *dns.Msg {
	c, exist := upstreamDNS.cache[*question]
	if upstreamDNS.cache != nil && len(upstreamDNS.cache) > upstreamDNS.cacheLimit {
		go func() {
			before := len(upstreamDNS.cache)
			for d, item := range upstreamDNS.cache {
				if item.validBefore.Before(time.Now()) {
					delete(upstreamDNS.cache, d)
				}
			}
			after := len(upstreamDNS.cache)
			log.Printf("upstream [%s] clean cache: from %d to %d", upstreamDNS.Name, before, after)
			if after > upstreamDNS.cacheLimit {
				log.Printf("upstream [%s] hint cache limit: resize %d to %d", upstreamDNS.Name,
					upstreamDNS.cacheLimit,
					upstreamDNS.cacheLimit*2)
				upstreamDNS.cacheLimit *= 2
			}
		}()
	}
	if exist && c.validBefore.After(time.Now()) {
		return c.item
	}
	return nil
}

func (upstreamDNS *UpstreamDNS) forwarded(writer dns.ResponseWriter, msg *dns.Msg) error {
	question := msg.Question[0]
	cache := upstreamDNS.checkCache(&question)
	if cache != nil {
		cache.SetReply(msg)
		return writer.WriteMsg(cache)
	}
	log.Printf("[%s] recv [%s]: %s %s", upstreamDNS.Name,
		writer.RemoteAddr(),
		dns.TypeToString[question.Qtype],
		question.Name)
	if upstreamDNS.clientIP != "" {
		setECS(msg, net.ParseIP(upstreamDNS.clientIP))
	}
	resp, err := upstreamDNS.Exchange(msg)
	if err != nil {
		return err
	} else {
		upstreamDNS.cache[question] = CacheItem{
			validBefore: time.Now().Add(time.Second * 60),
			item:        resp,
		}
		//log.Printf("\n---resp start---\n %v\n---resp end---", resp)
		return writer.WriteMsg(resp)
	}
}

var ednsCSDefaultNetmaskV4 uint8 = 24  // default network mask for IPv4 address for EDNS ClientSubnet option
var ednsCSDefaultNetmaskV6 uint8 = 112 // default network mask for IPv6 address for EDNS ClientSubnet option

func setECS(m *dns.Msg, ip net.IP) {
	e := new(dns.EDNS0_SUBNET)
	e.Code = dns.EDNS0SUBNET
	if ip.To4() != nil {
		e.Family = 1
		e.SourceNetmask = ednsCSDefaultNetmaskV4
		e.Address = ip.To4().Mask(net.CIDRMask(int(e.SourceNetmask), 32))
	} else {
		e.Family = 2
		e.SourceNetmask = ednsCSDefaultNetmaskV6
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

package resolver

import (
	"dns-switchy/config"
	"dns-switchy/util"
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
	return upstreamDNS.Exchange(msg)
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

func NewForward(config *config.ForwardConfig) *Forward {
	up, err := upstream.AddressToUpstream(config.Url, &upstream.Options{
		Bootstrap:     config.Config.Bootstrap,
		Timeout:       config.Config.Timeout,
		ServerIPAddrs: config.Config.ServerIP,
	})
	if err != nil {
		log.Printf("init upstream fail: %+v", err)
	}
	return &Forward{
		Name:          config.Name,
		Upstream:      up,
		DomainMatcher: util.NewDomainMatcher(ParseRule(config.Rule)),
		clientIP:      config.Config.ClientIP,
		ttl:           config.TTL,
	}
}

package resolver

import (
	"dns-switchy/matcher"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"github.com/miekg/dns"
	"net"
	"strings"
)

type DnsResolver interface {
	Accept(msg *dns.Msg) bool
	Resolve(msg *dns.Msg) (*dns.Msg, error)
}

type UpstreamDNS struct {
	Name string
	upstream.Upstream
	matcher.Matcher
	clientIP string
}

func (upstreamDNS *UpstreamDNS) String() string {
	return upstreamDNS.Name
}

func (upstreamDNS *UpstreamDNS) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	domain := strings.TrimRight(question.Name, ".")
	return upstreamDNS.Match(domain)
}

func (upstreamDNS *UpstreamDNS) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	if upstreamDNS.clientIP != "" {
		setECS(msg, net.ParseIP(upstreamDNS.clientIP))
	}
	return upstreamDNS.Exchange(msg)
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

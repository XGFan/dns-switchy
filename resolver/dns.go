package resolver

import (
	"dns-switchy/matcher"
	"github.com/AdguardTeam/dnsproxy/upstream"
	"github.com/miekg/dns"
	"log"
	"strings"
)

type DnsResolver interface {
	HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool
}

type UpstreamDNS struct {
	Name string
	upstream.Upstream
	matcher.Matcher
}

func (upstreamDNS *UpstreamDNS) String() string {
	return upstreamDNS.Name
}

func (upstreamDNS *UpstreamDNS) HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool {
	question := msg.Question[0]
	domain := strings.TrimRight(question.Name, ".")
	if upstreamDNS.Match(domain) {
		upstreamDNS.forwarded(writer, msg)
		return true
	}
	return false
}

func (upstreamDNS *UpstreamDNS) forwarded(writer dns.ResponseWriter, msg *dns.Msg) {
	log.Printf("[%s] recv [%s]: %s %s", upstreamDNS.Name,
		writer.RemoteAddr(),
		dns.TypeToString[msg.Question[0].Qtype],
		msg.Question[0].Name)
	resp, err := upstreamDNS.Exchange(msg)
	if err != nil {
		log.Printf("upstream error: %v", err)
	} else {
		//log.Printf("\n---resp start---\n %v\n---resp end---", resp)
		err := writer.WriteMsg(resp)
		if err != nil {
			log.Printf("write error: %v", err)
		}
	}
}

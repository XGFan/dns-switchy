package resolver

import (
	"fmt"
	"github.com/miekg/dns"
	"log"
	"net"
	"os"
	"strings"
	"time"
)

type Lease struct {
	location string
	domain   string
	cache    map[string]string
	ticker   *time.Ticker
}

func (lease Lease) Close() {
	lease.ticker.Stop()
	log.Printf("%s closed", lease)
}

func NewLease(leaseLocation string, searchDomain string) *Lease {
	lease := &Lease{
		location: leaseLocation,
		domain:   searchDomain,
		ticker:   time.NewTicker(time.Minute * 3),
	}
	go func() {
		for range lease.ticker.C {
			lease.update()
		}
	}()
	return lease
}

func NewDefaultLease() *Lease {
	return NewLease("/tmp/dhcp.leases", "lan")
}

func (lease Lease) String() string {
	return fmt.Sprintf("DHCP.Lease(Location: %s, Domain: %s)", lease.location, lease.domain)
}

func (lease *Lease) update() {
	file, e := os.ReadFile(lease.location)
	if e != nil {
		return
	}
	cache := make(map[string]string, 0)
	for _, line := range strings.Split(string(file), "\n") {
		if line != "" {
			parts := strings.Split(line, " ")
			if len(parts) == 5 && parts[3] != "*" {
				cache[strings.ToLower(dns.Fqdn(parts[3]))] = parts[2]
				cache[strings.ToLower(dns.Fqdn(parts[3]+"."+lease.domain))] = parts[2]
			}
		}
	}
	lease.cache = cache
}

func (lease *Lease) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	if question.Qtype == dns.TypeA {
		_, exist := lease.cache[strings.ToLower(question.Name)]
		return exist
	}
	return false
}

func (lease *Lease) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	question := msg.Question[0]
	ip := lease.cache[strings.ToLower(question.Name)]
	rr := &dns.A{
		Hdr: dns.RR_Header{Name: question.Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 0},
		A:   net.ParseIP(ip),
	}
	m := new(dns.Msg)
	m.SetReply(msg)
	m.Rcode = dns.RcodeSuccess
	m.Answer = append(m.Answer, rr)
	return m, nil
}

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
	_cache   map[string]string
	_last    time.Time
}

func NewDefaultLease() *Lease {
	return &Lease{
		location: "/tmp/dhcp.leases",
		domain:   "lan",
	}
}

func (lease Lease) String() string {
	return fmt.Sprintf("DHCP.Lease(Location: %s, Domain: %s)", lease.location, lease.domain)
}

func checkAndUpdate(lease *Lease) {
	if time.Now().Sub(lease._last).Seconds() > 180 {
		file, _ := os.ReadFile(lease.location)
		cache := make(map[string]string, 0)
		for _, line := range strings.Split(string(file), "\n") {
			if line != "" {
				parts := strings.Split(line, " ")
				if len(parts) == 5 && parts[3] != "*" {
					cache[strings.ToLower(parts[3]+".")] = parts[2]
					cache[strings.ToLower(parts[3]+"."+lease.domain+".")] = parts[2]
				}
			}
		}
		log.Printf("update lease cache, size: %d", len(cache))
		lease._cache = cache
		lease._last = time.Now()
	}
}

func (lease *Lease) HandleDns(writer dns.ResponseWriter, msg *dns.Msg) bool {
	question := msg.Question[0]
	if question.Qtype == dns.TypeA {
		checkAndUpdate(lease)
		ip, exist := lease._cache[strings.ToLower(question.Name)]
		if exist {
			rr := &dns.A{
				Hdr: dns.RR_Header{Name: question.Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 0},
				A:   net.ParseIP(ip),
			}
			m := new(dns.Msg)
			m.SetReply(msg)
			m.Rcode = dns.RcodeSuccess
			m.Answer = append(m.Answer, rr)
			_ = writer.WriteMsg(m)
			return true
		}
	}
	return false
}

package resolver

import (
	"fmt"
	"github.com/miekg/dns"
	"io/ioutil"
	"log"
	"net"
	"os"
	"regexp"
	"runtime"
	"strings"
)

type Hosts map[string]string

func (h Hosts) loadSystemHosts() {
	var hostLocation string
	if runtime.GOOS == "windows" {
		hostLocation = "%SystemRoot%\\System32\\drivers\\etc\\hosts"
	} else {
		hostLocation = "/etc/hosts"
	}
	open, err := os.Open(hostLocation)
	if err != nil {
		log.Println("read hosts file error:", err)
	}
	defer open.Close()
	all, _ := ioutil.ReadAll(open)
	lines := strings.Split(string(all), "\n")
	re := regexp.MustCompile("\\s+")
	for _, line := range lines {
		if !strings.HasPrefix(line, "#") && strings.TrimSpace(line) != "" {
			split := re.Split(line, -1)
			if len(split) == 2 {
				h[dns.Fqdn(split[1])] = split[0]
			} else if len(split) != 0 {
				log.Printf("Invalid line in hosts: %s", line)
			}
		}
	}
}

func NewHosts(m map[string]string) Hosts {
	hosts := make(Hosts, 0)
	hosts.loadSystemHosts()
	for k, v := range m {
		if k != "" && v != "" {
			hosts[dns.Fqdn(k)] = v
		}
	}
	return hosts
}

func (h Hosts) String() string {
	return fmt.Sprintf("Hosts(%d)", len(h))
}

func (h Hosts) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	if question.Qtype == dns.TypeA {
		_, exist := h[question.Name]
		return exist
	}
	return false
}

func (h Hosts) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	question := msg.Question[0]
	rr := &dns.A{
		Hdr: dns.RR_Header{Name: question.Name, Rrtype: dns.TypeA, Class: dns.ClassINET},
		A:   net.ParseIP(h[question.Name]),
	}
	m := new(dns.Msg)
	m.SetReply(msg)
	m.Answer = append(m.Answer, rr)
	return m, nil
}

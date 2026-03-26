package resolver

import (
	"dns-switchy/config"
	"fmt"
	"github.com/miekg/dns"
	"log"
	"net"
	"os"
	"reflect"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"
)

var BlankSeparator = regexp.MustCompile("\\s+")
var LineSeparator = regexp.MustCompile("[\r\n]")

type QueryMap map[DomainQuery]string

func (q QueryMap) put(domain string, ipStr string) {
	ip := net.ParseIP(ipStr)
	if ip != nil {
		if ip.To4() != nil {
			q[DomainQuery{
				Domain: strings.ToLower(dns.Fqdn(domain)),
				Type:   dns.TypeA,
			}] = ipStr
		} else {
			q[DomainQuery{
				Domain: strings.ToLower(dns.Fqdn(domain)),
				Type:   dns.TypeAAAA,
			}] = ipStr
		}
	}
}
func (q QueryMap) exist(domain string, dnsType uint16) bool {
	_, exist := q[DomainQuery{
		Domain: strings.ToLower(dns.Fqdn(domain)),
		Type:   dnsType,
	}]
	return exist
}

type FileParser interface {
	Parse(filePath string) QueryMap
}

type DomainQuery struct {
	Domain string
	Type   uint16
}

type FileResolver struct {
	NoCache
	location      string
	mu            sync.RWMutex
	inMemory      QueryMap
	inConfig      QueryMap
	refreshTicker *time.Ticker
	fileParser    FileParser
	stop          chan struct{}
	done          chan struct{}
	closeOnce     sync.Once
}

func (fileResolver *FileResolver) String() string {
	return fmt.Sprintf("FileResolver(%s,%s)", reflect.TypeOf(fileResolver.fileParser), fileResolver.location)
}

func (fileResolver *FileResolver) start() {
	defer close(fileResolver.done)
	for {
		select {
		case <-fileResolver.stop:
			return
		case <-fileResolver.refreshTicker.C:
			fileResolver.update()
		}
	}
}

func (fileResolver *FileResolver) update() {
	file, e := os.ReadFile(fileResolver.location)
	if e != nil {
		log.Println(e)
		return
	}
	inMemory := fileResolver.fileParser.Parse(string(file))
	fileResolver.mu.Lock()
	fileResolver.inMemory = inMemory
	fileResolver.mu.Unlock()
}

func (fileResolver *FileResolver) Close() {
	fileResolver.closeOnce.Do(func() {
		if fileResolver.refreshTicker != nil {
			fileResolver.refreshTicker.Stop()
		}
		if fileResolver.stop != nil {
			close(fileResolver.stop)
		}
		if fileResolver.done != nil {
			<-fileResolver.done
		}
	})
}

func (fileResolver *FileResolver) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	if fileResolver.inConfig.exist(question.Name, question.Qtype) {
		return true
	}
	fileResolver.mu.RLock()
	defer fileResolver.mu.RUnlock()
	return fileResolver.inMemory.exist(question.Name, question.Qtype)
}

func (fileResolver *FileResolver) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	question := msg.Question[0]
	query := DomainQuery{strings.ToLower(question.Name), question.Qtype}
	fileResolver.mu.RLock()
	ip := fileResolver.inMemory[query]
	fileResolver.mu.RUnlock()
	if ip == "" {
		ip = fileResolver.inConfig[query]
	}
	var rr dns.RR
	switch question.Qtype {
	case dns.TypeA:
		rr = &dns.A{
			Hdr: dns.RR_Header{Name: question.Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 0},
			A:   net.ParseIP(ip),
		}
	case dns.TypeAAAA:
		rr = &dns.AAAA{
			Hdr:  dns.RR_Header{Name: question.Name, Rrtype: dns.TypeAAAA, Class: dns.ClassINET, Ttl: 0},
			AAAA: net.ParseIP(ip),
		}
	}
	m := new(dns.Msg)
	m.SetReply(msg)
	m.Rcode = dns.RcodeSuccess
	m.RecursionAvailable = true
	if rr != nil {
		m.Answer = append(m.Answer, rr)
	}
	return m, nil
}

type Lease struct {
	domain string
}

func (lease *Lease) Parse(content string) QueryMap {
	inMemory := make(QueryMap)
	for _, line := range LineSeparator.Split(content, -1) {
		if strings.TrimSpace(line) != "" {
			parts := BlankSeparator.Split(line, -1)
			if len(parts) == 5 && parts[3] != "*" {
				inMemory.put(parts[3], parts[2])
				inMemory.put(parts[3]+"."+lease.domain, parts[2])
			}
		}
	}
	return inMemory
}

type Hosts struct {
}

func (h Hosts) Parse(content string) QueryMap {
	inMemory := make(QueryMap)
	lines := LineSeparator.Split(content, -1)
	for _, line := range lines {
		if !strings.HasPrefix(line, "#") && strings.TrimSpace(line) != "" {
			split := BlankSeparator.Split(line, -1)
			ipStr := split[0]
			if len(split) > 1 {
				for i := 1; i < len(split) && i <= 2; i++ {
					inMemory.put(split[i], ipStr)
				}
			} else if len(split) != 0 {
				log.Printf("Invalid line in hosts: %s", line)
			}
		}
	}
	return inMemory
}

func NewFile(config *config.FileConfig) (*FileResolver, error) {
	var fileParser FileParser
	var location = config.Location
	switch config.FileType {
	case "host":
		fileParser = &Hosts{}
		if location == "system" {
			location = getSystemLocation()
		}
	case "lease":
		fileParser = &Lease{
			domain: config.ExtraConfig["domain"],
		}
	default:
		return nil, fmt.Errorf("unknown file type: %s", config.FileType)
	}
	if config.RefreshInterval <= 0 {
		return nil, fmt.Errorf("refreshInterval must greater than zero: %v", config)
	}
	resolver := &FileResolver{
		location:      location,
		inMemory:      nil,
		inConfig:      fileParser.Parse(config.ExtraContent),
		refreshTicker: time.NewTicker(config.RefreshInterval),
		fileParser:    fileParser,
		stop:          make(chan struct{}),
		done:          make(chan struct{}),
	}
	resolver.update()
	go resolver.start()
	return resolver, nil
}

func getSystemLocation() string {
	if runtime.GOOS == "windows" {
		return "%SystemRoot%\\System32\\drivers\\etc\\hosts"
	} else {
		return "/etc/hosts"
	}
}

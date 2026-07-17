package resolver

import (
	"dns-switchy/config"
	"dns-switchy/util"
	"fmt"
	"log"
	"net"
	"reflect"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/miekg/dns"
	"golang.org/x/net/ipv4"
)

// Mdns 把 DNS-only 客户端的 .local A 查询桥接到 LAN mDNS(见 docs/adr/0001)。
// mDNS 侧是 querier-only:绑 :5353 加组播组、从 5353 发标准查询、收组播应答;
// 绝不宣告名字、绝不应答他人查询(QR=0 的包一律静默丢弃)。
// .local 在此终局应答:命中回 A,非 A 类型回 NODATA,miss 回 NXDOMAIN(负缓存),
// 运行期 socket 故障回 BreakError——永不落到链条下游,这是定义性质,不可配置。
type Mdns struct {
	util.DomainMatcher
	conn        mdnsConn
	group       *net.UDPAddr
	ifaceName   string
	ttl         time.Duration
	negativeTTL time.Duration
	timeout     time.Duration
	negCache    util.Cache

	mu      sync.Mutex
	waiters map[string][]chan *dns.Msg // key: 小写 FQDN

	closeOnce sync.Once
	done      chan struct{}
	dead      atomic.Bool
}

// mdnsConn 抽象组播 socket 读写,单测注入 fake responder 用。
type mdnsConn interface {
	WriteToUDP(b []byte, addr *net.UDPAddr) (int, error)
	ReadFromUDP(b []byte) (int, *net.UDPAddr, error)
	Close() error
}

const (
	defaultMdnsTTL         = time.Minute
	defaultMdnsNegativeTTL = 30 * time.Second
	defaultMdnsTimeout     = time.Second
	// mdnsRetransmitDelay 窗口内重发一次:Wi-Fi 组播丢包会把在线设备误判成 miss,
	// 且被负缓存放大;两个包的成本换掉这个故障模式,不做配置项。
	mdnsRetransmitDelay = 400 * time.Millisecond
)

var mdnsGroup = &net.UDPAddr{IP: net.IPv4(224, 0, 0, 251), Port: 5353}

// negMarker 是负缓存条目;必须与 util.None(零值 Msg)可区分,否则 Get 的 miss
// 和"缓存的 miss"混为一谈。
var negMarker = func() dns.Msg {
	m := dns.Msg{}
	m.Rcode = dns.RcodeNameError
	return m
}()

func NewMdns(cfg *config.MdnsConfig) (*Mdns, error) {
	name := strings.TrimSpace(cfg.Interface)
	if name == "" {
		return nil, fmt.Errorf("mdns resolver requires interface")
	}
	iface, err := net.InterfaceByName(name)
	if err != nil {
		return nil, fmt.Errorf("mdns interface %q: %w", name, err)
	}
	// ListenMulticastUDP 自带 SO_REUSEADDR/SO_REUSEPORT,与本机其他 mDNS 栈共存
	// (macOS 冒烟);正式部署机(路由器)上不应有 avahi/umdns 抢 5353。
	udpConn, err := net.ListenMulticastUDP("udp4", iface, mdnsGroup)
	if err != nil {
		return nil, fmt.Errorf("mdns listen %s on %s: %w", mdnsGroup, name, err)
	}
	pc := ipv4.NewPacketConn(udpConn)
	if err = pc.SetMulticastInterface(iface); err != nil {
		_ = udpConn.Close()
		return nil, fmt.Errorf("mdns set multicast interface %s: %w", name, err)
	}
	_ = pc.SetMulticastLoopback(false)

	rule := cfg.Rule
	if len(rule) == 0 {
		// DomainMatcher 空白名单=全收;mdns 只该管 .local,缺省补上,防止吞掉全部查询
		rule = []string{"local"}
	}
	matcher, err := util.NewDomainMatcher(rule)
	if err != nil {
		_ = udpConn.Close()
		return nil, fmt.Errorf("init domain matcher fail: %w", err)
	}
	m := newMdnsResolver(udpConn, mdnsGroup, matcher, cfg.TTL, cfg.NegativeTTL, cfg.Timeout)
	m.ifaceName = name
	return m, nil
}

// newMdnsResolver 组装 resolver 并启动读循环;拆出来供单测注入 fake conn。
func newMdnsResolver(conn mdnsConn, group *net.UDPAddr, matcher util.DomainMatcher,
	ttl, negativeTTL, timeout time.Duration) *Mdns {
	if ttl <= 0 {
		ttl = defaultMdnsTTL
	}
	if negativeTTL <= 0 {
		negativeTTL = defaultMdnsNegativeTTL
	}
	if timeout <= 0 {
		timeout = defaultMdnsTimeout
	}
	m := &Mdns{
		DomainMatcher: matcher,
		conn:          conn,
		group:         group,
		ttl:           ttl,
		negativeTTL:   negativeTTL,
		timeout:       timeout,
		negCache:      util.NewDnsCache(negativeTTL),
		waiters:       make(map[string][]chan *dns.Msg),
		done:          make(chan struct{}),
	}
	go m.readLoop()
	return m
}

func (m *Mdns) String() string {
	return fmt.Sprintf("Mdns(%s)", m.ifaceName)
}

func (m *Mdns) TTL() time.Duration {
	return m.ttl
}

func (m *Mdns) Accept(msg *dns.Msg) bool {
	question := msg.Question[0]
	domain := strings.TrimRight(question.Name, ".")
	return m.MatchDomain(domain)
}

func (m *Mdns) Close() {
	m.closeOnce.Do(func() {
		_ = m.conn.Close()
		<-m.done
		log.Printf("%s closed", m)
	})
}

func (m *Mdns) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	question := msg.Question[0]
	// 非 A 类型就地 NODATA:名字空间不外泄,客户端(getaddrinfo 并发 A+AAAA)秒回落
	if question.Qtype != dns.TypeA {
		res := new(dns.Msg)
		res.SetReply(msg)
		return res, nil
	}
	if cached := m.negCache.Get(question); !reflect.DeepEqual(cached, util.None) {
		return nxdomain(msg), nil
	}
	if m.dead.Load() {
		return nil, fmt.Errorf("mdns reader closed: %w", BreakError)
	}

	name := strings.ToLower(question.Name)
	ch := make(chan *dns.Msg, 1)
	m.addWaiter(name, ch)
	defer m.removeWaiter(name, ch)

	query, err := buildMdnsQuery(name)
	if err != nil {
		return nil, fmt.Errorf("mdns pack query: %v: %w", err, BreakError)
	}
	if _, err = m.conn.WriteToUDP(query, m.group); err != nil {
		return nil, fmt.Errorf("mdns send: %v: %w", err, BreakError)
	}

	deadline := time.NewTimer(m.timeout)
	defer deadline.Stop()
	retransmit := time.NewTimer(mdnsRetransmitDelay)
	defer retransmit.Stop()
	for {
		select {
		case resp := <-ch:
			return m.buildAnswer(msg, name, resp), nil
		case <-retransmit.C:
			// 重发失败不致命:首发已成功,窗口继续等
			_, _ = m.conn.WriteToUDP(query, m.group)
		case <-deadline.C:
			// reader 若在等待期间死亡,超时是"设施故障"不是"查无此名":
			// 回 SERVFAIL 且不写负缓存,避免把故障伪装成 NXDOMAIN 缓存 30s
			if m.dead.Load() {
				return nil, fmt.Errorf("mdns reader closed: %w", BreakError)
			}
			m.negCache.Set(question, negMarker, m.negativeTTL)
			return nxdomain(msg), nil
		}
	}
}

// readLoop 只消费应答:QR=0(他人查询)与解析失败的包静默丢弃——querier-only 红线。
func (m *Mdns) readLoop() {
	defer close(m.done)
	buf := make([]byte, 9000)
	for {
		n, _, err := m.conn.ReadFromUDP(buf)
		if err != nil {
			m.dead.Store(true)
			return
		}
		resp := new(dns.Msg)
		if resp.Unpack(buf[:n]) != nil {
			continue
		}
		if !resp.Response {
			continue
		}
		m.dispatch(resp)
	}
}

func (m *Mdns) dispatch(resp *dns.Msg) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.waiters) == 0 {
		return
	}
	for _, rr := range append(resp.Answer, resp.Extra...) {
		a, ok := rr.(*dns.A)
		if !ok {
			continue
		}
		name := strings.ToLower(a.Hdr.Name)
		chans, ok := m.waiters[name]
		if !ok {
			continue
		}
		for _, ch := range chans {
			select {
			case ch <- resp:
			default:
			}
		}
		delete(m.waiters, name)
	}
}

func (m *Mdns) addWaiter(name string, ch chan *dns.Msg) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.waiters[name] = append(m.waiters[name], ch)
}

func (m *Mdns) removeWaiter(name string, ch chan *dns.Msg) {
	m.mu.Lock()
	defer m.mu.Unlock()
	chans := m.waiters[name]
	for i, c := range chans {
		if c == ch {
			chans = append(chans[:i], chans[i+1:]...)
			break
		}
	}
	if len(chans) == 0 {
		delete(m.waiters, name)
	} else {
		m.waiters[name] = chans
	}
}

// buildAnswer 把 mDNS 应答里属于该名字的 A 记录转成 unicast DNS 应答。
// 名字改写为客户端问的名字(mDNS 应答保留注册方大小写,如 MBP.local),
// class 清掉 mDNS cache-flush 高位(0x8001 → IN),否则客户端见到非法 class。
func (m *Mdns) buildAnswer(msg *dns.Msg, name string, resp *dns.Msg) *dns.Msg {
	res := new(dns.Msg)
	res.SetReply(msg)
	for _, rr := range append(resp.Answer, resp.Extra...) {
		a, ok := rr.(*dns.A)
		if !ok || strings.ToLower(a.Hdr.Name) != name {
			continue
		}
		copied := dns.Copy(a).(*dns.A)
		copied.Hdr.Name = msg.Question[0].Name
		copied.Hdr.Class = dns.ClassINET
		res.Answer = append(res.Answer, copied)
	}
	if len(res.Answer) == 0 {
		// 应答里没有可用 A(理论上 dispatch 只投递含该名 A 的包,防御分支)
		return nxdomain(msg)
	}
	return res
}

func nxdomain(msg *dns.Msg) *dns.Msg {
	res := new(dns.Msg)
	res.SetRcode(msg, dns.RcodeNameError)
	return res
}

// buildMdnsQuery 构造标准 mDNS 组播查询:id=0、RD=0、QM(不设 QU 位,应答走组播)。
func buildMdnsQuery(name string) ([]byte, error) {
	q := new(dns.Msg)
	q.Question = []dns.Question{{Name: name, Qtype: dns.TypeA, Qclass: dns.ClassINET}}
	return q.Pack()
}

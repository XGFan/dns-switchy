package resolver

import (
	"dns-switchy/config"
	"errors"
	"net"
	"sync"
	"testing"
	"time"

	"github.com/miekg/dns"

	"dns-switchy/util"
)

// fakeMdnsConn 扮演 LAN:测试从 wrote 观察 resolver 发出的查询,向 inbox 注入应答。
type fakeMdnsConn struct {
	wrote     chan []byte
	inbox     chan []byte
	writeErr  error
	closed    chan struct{}
	closeOnce sync.Once
}

func newFakeMdnsConn() *fakeMdnsConn {
	return &fakeMdnsConn{
		wrote:  make(chan []byte, 16),
		inbox:  make(chan []byte, 16),
		closed: make(chan struct{}),
	}
}

func (f *fakeMdnsConn) WriteToUDP(b []byte, _ *net.UDPAddr) (int, error) {
	if f.writeErr != nil {
		return 0, f.writeErr
	}
	f.wrote <- append([]byte(nil), b...)
	return len(b), nil
}

func (f *fakeMdnsConn) ReadFromUDP(b []byte) (int, *net.UDPAddr, error) {
	select {
	case pkt := <-f.inbox:
		n := copy(b, pkt)
		return n, &net.UDPAddr{IP: net.IPv4(192, 168, 2, 50), Port: 5353}, nil
	case <-f.closed:
		return 0, nil, net.ErrClosed
	}
}

func (f *fakeMdnsConn) Close() error {
	f.closeOnce.Do(func() { close(f.closed) })
	return nil
}

func newTestMdns(t *testing.T, conn mdnsConn, timeout, negativeTTL time.Duration) *Mdns {
	t.Helper()
	matcher, err := util.NewDomainMatcher([]string{"local"})
	if err != nil {
		t.Fatalf("matcher: %v", err)
	}
	m := newMdnsResolver(conn, mdnsGroup, matcher, time.Minute, negativeTTL, timeout)
	t.Cleanup(m.Close)
	return m
}

func aQuery(name string) *dns.Msg {
	msg := new(dns.Msg)
	msg.SetQuestion(name, dns.TypeA)
	return msg
}

// mdnsAnswer 构造一条 mDNS 风格应答:注册方大小写、cache-flush class(0x8001)。
func mdnsAnswer(name string, ip net.IP) []byte {
	resp := new(dns.Msg)
	resp.Response = true
	resp.Authoritative = true
	resp.Answer = []dns.RR{&dns.A{
		Hdr: dns.RR_Header{Name: name, Rrtype: dns.TypeA, Class: dns.ClassINET | 0x8000, Ttl: 120},
		A:   ip,
	}}
	packed, err := resp.Pack()
	if err != nil {
		panic(err)
	}
	return packed
}

// TestMdnsHit 命中:首答即返;应答名字大小写/cache-flush class 被归一;
// 期间混入的 QR=0 查询包(他人查询)被静默忽略(querier-only)。
func TestMdnsHit(t *testing.T) {
	conn := newFakeMdnsConn()
	m := newTestMdns(t, conn, 2*time.Second, time.Minute)

	go func() {
		<-conn.wrote // 等 resolver 发出查询
		// 先注入一个他人查询(QR=0),必须被忽略
		foreign := new(dns.Msg)
		foreign.SetQuestion("mbp.local.", dns.TypeA)
		packed, _ := foreign.Pack()
		conn.inbox <- packed
		// 再注入真实应答,名字用注册方大写
		conn.inbox <- mdnsAnswer("MBP.local.", net.IPv4(192, 168, 2, 165))
	}()

	start := time.Now()
	resp, err := m.Resolve(aQuery("mbp.local."))
	if err != nil {
		t.Fatalf("resolve: %v", err)
	}
	if elapsed := time.Since(start); elapsed > time.Second {
		t.Fatalf("first answer should return early, took %s", elapsed)
	}
	if resp.Rcode != dns.RcodeSuccess || len(resp.Answer) != 1 {
		t.Fatalf("want 1 answer, got rcode=%d answers=%v", resp.Rcode, resp.Answer)
	}
	a := resp.Answer[0].(*dns.A)
	if a.Hdr.Name != "mbp.local." {
		t.Fatalf("answer name should match question, got %q", a.Hdr.Name)
	}
	if a.Hdr.Class != dns.ClassINET {
		t.Fatalf("cache-flush bit should be cleared, got class %#x", a.Hdr.Class)
	}
	if !a.A.Equal(net.IPv4(192, 168, 2, 165)) {
		t.Fatalf("wrong ip %s", a.A)
	}
}

// TestMdnsMissAndNegativeCache miss:窗口超时 → NXDOMAIN;负缓存期内二次查询
// 秒回且不再发组播。
func TestMdnsMissAndNegativeCache(t *testing.T) {
	conn := newFakeMdnsConn()
	m := newTestMdns(t, conn, 100*time.Millisecond, time.Minute)

	start := time.Now()
	resp, err := m.Resolve(aQuery("ghost.local."))
	if err != nil {
		t.Fatalf("resolve: %v", err)
	}
	if resp.Rcode != dns.RcodeNameError {
		t.Fatalf("want NXDOMAIN, got %d", resp.Rcode)
	}
	if elapsed := time.Since(start); elapsed < 100*time.Millisecond {
		t.Fatalf("miss should wait full window, took %s", elapsed)
	}
	<-conn.wrote // 第一次 miss 发过查询

	start = time.Now()
	resp, err = m.Resolve(aQuery("ghost.local."))
	if err != nil {
		t.Fatalf("cached resolve: %v", err)
	}
	if resp.Rcode != dns.RcodeNameError {
		t.Fatalf("want cached NXDOMAIN, got %d", resp.Rcode)
	}
	if elapsed := time.Since(start); elapsed > 50*time.Millisecond {
		t.Fatalf("negative cache should answer instantly, took %s", elapsed)
	}
	select {
	case pkt := <-conn.wrote:
		t.Fatalf("negative-cached miss must not send multicast, sent %d bytes", len(pkt))
	default:
	}
}

// TestMdnsNonAQueryNodata 非 A 类型:立即空 NOERROR,不发组播。
func TestMdnsNonAQueryNodata(t *testing.T) {
	conn := newFakeMdnsConn()
	m := newTestMdns(t, conn, 2*time.Second, time.Minute)

	msg := new(dns.Msg)
	msg.SetQuestion("mbp.local.", dns.TypeAAAA)
	start := time.Now()
	resp, err := m.Resolve(msg)
	if err != nil {
		t.Fatalf("resolve: %v", err)
	}
	if resp.Rcode != dns.RcodeSuccess || len(resp.Answer) != 0 {
		t.Fatalf("want empty NOERROR, got rcode=%d answers=%v", resp.Rcode, resp.Answer)
	}
	if elapsed := time.Since(start); elapsed > 50*time.Millisecond {
		t.Fatalf("NODATA should be instant, took %s", elapsed)
	}
	select {
	case <-conn.wrote:
		t.Fatal("non-A query must not send multicast")
	default:
	}
}

// TestMdnsSendErrorBreaks socket 故障:BreakError 终止链条,.local 不落下游。
func TestMdnsSendErrorBreaks(t *testing.T) {
	conn := newFakeMdnsConn()
	conn.writeErr = errors.New("network is down")
	m := newTestMdns(t, conn, time.Second, time.Minute)

	_, err := m.Resolve(aQuery("mbp.local."))
	if !errors.Is(err, BreakError) {
		t.Fatalf("want BreakError, got %v", err)
	}
}

// TestMdnsRetransmit 窗口内重发:首发无人应答时约 400ms 后补发一次。
func TestMdnsRetransmit(t *testing.T) {
	conn := newFakeMdnsConn()
	m := newTestMdns(t, conn, 2*time.Second, time.Minute)

	go func() {
		<-conn.wrote // 首发,不应答
		<-conn.wrote // 重发后再应答
		conn.inbox <- mdnsAnswer("slowpi.local.", net.IPv4(192, 168, 2, 99))
	}()

	resp, err := m.Resolve(aQuery("slowpi.local."))
	if err != nil {
		t.Fatalf("resolve: %v", err)
	}
	if len(resp.Answer) != 1 {
		t.Fatalf("want answer after retransmit, got %v", resp.Answer)
	}
}

// TestNewMdnsValidation 建链期校验:interface 缺失/不存在直接失败。
func TestNewMdnsValidation(t *testing.T) {
	if _, err := NewMdns(&config.MdnsConfig{}); err == nil {
		t.Fatal("missing interface should fail")
	}
	if _, err := NewMdns(&config.MdnsConfig{Interface: "no-such-iface0"}); err == nil {
		t.Fatal("nonexistent interface should fail")
	}
}

// TestStrictValidateMdns 保存时校验:与建链同样拦截 interface 问题,真实 loopback 放行。
func TestStrictValidateMdns(t *testing.T) {
	if err := strictValidateMdns(&config.MdnsConfig{}); err == nil {
		t.Fatal("missing interface should fail")
	}
	if err := strictValidateMdns(&config.MdnsConfig{Interface: "no-such-iface0"}); err == nil {
		t.Fatal("nonexistent interface should fail")
	}
	ifaces, err := net.Interfaces()
	if err != nil {
		t.Skipf("list interfaces: %v", err)
	}
	for _, ifc := range ifaces {
		if ifc.Flags&net.FlagLoopback != 0 {
			if err := strictValidateMdns(&config.MdnsConfig{Interface: ifc.Name}); err != nil {
				t.Fatalf("real interface %s should pass: %v", ifc.Name, err)
			}
			return
		}
	}
	t.Skip("no loopback interface found")
}

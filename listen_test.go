package main

import (
	"context"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"dns-switchy/config"
	"dns-switchy/resolver"

	"github.com/miekg/dns"
)

func mockConfig(t *testing.T, addr, answer string) *config.SwitchyConfig {
	t.Helper()
	conf, err := config.ParseConfig(strings.NewReader(`addr: "` + addr + `"
ttl: 0s
resolvers:
  - type: mock
    answer: "` + answer + `"
    rule:
      - mock.example
    queryType:
      - A
`))
	if err != nil {
		t.Fatalf("parse mock config: %v", err)
	}
	return conf
}

func queryA(t *testing.T, network, addr, name string) *dns.Msg {
	t.Helper()
	c := &dns.Client{Net: network, Timeout: 2 * time.Second}
	resp, _, err := c.Exchange(makeQuery(dns.Fqdn(name), dns.TypeA), addr)
	if err != nil {
		t.Fatalf("%s query %s @%s: %v", network, name, addr, err)
	}
	return resp
}

func firstA(t *testing.T, resp *dns.Msg) string {
	t.Helper()
	if len(resp.Answer) == 0 {
		t.Fatalf("no answer in %v", resp)
	}
	return resp.Answer[0].(*dns.A).A.String()
}

func shutdownOnCleanup(t *testing.T, s **DnsSwitchyServer) {
	t.Cleanup(func() {
		if *s != nil {
			(*s).Shutdown()
		}
	})
}

// 新地址被占用时，整体重建必须失败并保留旧服务继续应答（以前是旧服务已关、新服务静默放弃监听）。
func TestReloadServerKeepsOldServerWhenUDPBindFails(t *testing.T) {
	oldAddr := reserveUDPAddr(t)
	running, err := reloadServer(nil, mockConfig(t, oldAddr, "1.1.1.1"))
	if err != nil {
		t.Fatalf("initial reloadServer: %v", err)
	}
	shutdownOnCleanup(t, &running)

	occupied, err := net.ListenPacket("udp", "127.0.0.1:0") // 不带 reuseport，新服务绑不上
	if err != nil {
		t.Fatalf("occupy udp: %v", err)
	}
	defer occupied.Close()

	previous := running
	running, err = reloadServer(running, mockConfig(t, occupied.LocalAddr().String(), "2.2.2.2"))
	if err == nil || !strings.Contains(err.Error(), "listen udp") {
		t.Fatalf("reloadServer error = %v, want listen udp failure", err)
	}
	if running != previous {
		t.Fatal("reloadServer did not return the previous server on listen failure")
	}
	if got := firstA(t, queryA(t, "udp", oldAddr, "mock.example")); got != "1.1.1.1" {
		t.Fatalf("old server answer = %s, want 1.1.1.1", got)
	}
}

// 地址不变的整体重建：新服务先在同一地址绑定（reuseport），旧服务停掉后由新服务应答。
func TestReloadServerSameAddrSwitchesToNewServer(t *testing.T) {
	addr := reserveUDPAddr(t)
	running, err := reloadServer(nil, mockConfig(t, addr, "1.1.1.1"))
	if err != nil {
		t.Fatalf("initial reloadServer: %v", err)
	}
	shutdownOnCleanup(t, &running)

	running, err = reloadServer(running, mockConfig(t, addr, "2.2.2.2"))
	if err != nil {
		t.Fatalf("same-addr reloadServer: %v", err)
	}
	for i := 0; i < 5; i++ {
		if got := firstA(t, queryA(t, "udp", addr, "mock.example")); got != "2.2.2.2" {
			t.Fatalf("query %d answer = %s, want 2.2.2.2 from the new server", i, got)
		}
	}
	if got := firstA(t, queryA(t, "tcp", addr, "mock.example")); got != "2.2.2.2" {
		t.Fatalf("tcp answer = %s, want 2.2.2.2", got)
	}
}

// 超过 512 字节的应答：UDP（无 EDNS）按协议置 TC 截断，客户端改走 TCP 必须拿到完整应答。
func TestServerServesTCPWithoutTruncation(t *testing.T) {
	const records = 60
	srv := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(*dns.Msg) bool { return true },
		resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
			resp := new(dns.Msg)
			resp.SetReply(msg)
			for i := 0; i < records; i++ {
				resp.Answer = append(resp.Answer, &dns.A{
					Hdr: dns.RR_Header{Name: msg.Question[0].Name, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 60},
					A:   net.IPv4(10, 0, byte(i/256), byte(i%256)),
				})
			}
			return resp, nil
		},
	}})
	srv.config = &config.SwitchyConfig{Addr: reserveUDPAddr(t)}
	if err := srv.Listen(); err != nil {
		t.Fatalf("Listen: %v", err)
	}
	srv.Start()
	t.Cleanup(srv.Shutdown)

	udpResp := queryA(t, "udp", srv.config.Addr, "big.example")
	if !udpResp.Truncated {
		t.Fatalf("udp response truncated = false with %d answers, want TC set", len(udpResp.Answer))
	}
	tcpResp := queryA(t, "tcp", srv.config.Addr, "big.example")
	if tcpResp.Truncated || len(tcpResp.Answer) != records {
		t.Fatalf("tcp response truncated=%v answers=%d, want false/%d", tcpResp.Truncated, len(tcpResp.Answer), records)
	}
}

// TCP 只是大应答的回退通道：它绑不上时 Listen 仍成功，UDP 照常服务。
func TestListenTCPFailureKeepsUDP(t *testing.T) {
	occupied, err := net.Listen("tcp", "127.0.0.1:0") // 不带 reuseport
	if err != nil {
		t.Fatalf("occupy tcp: %v", err)
	}
	defer occupied.Close()
	addr := occupied.Addr().String()

	var running *DnsSwitchyServer
	running, err = reloadServer(nil, mockConfig(t, addr, "1.1.1.1"))
	if err != nil {
		t.Fatalf("reloadServer with occupied tcp port: %v", err)
	}
	shutdownOnCleanup(t, &running)
	if running.tcpListener != nil {
		t.Fatal("tcpListener != nil, want TCP disabled when its port is occupied")
	}
	if got := firstA(t, queryA(t, "udp", addr, "mock.example")); got != "1.1.1.1" {
		t.Fatalf("udp answer = %s, want 1.1.1.1", got)
	}
}

// http 配成 unix socket 时，整体重建后新服务的 socket 文件必须还在、可连（旧服务关闭时不能把它删掉）。
func TestReloadServerKeepsUnixHTTPSocketReachable(t *testing.T) {
	// unix socket 路径有长度上限（macOS 104 字节），不用可能很长的 t.TempDir()。
	dir, err := os.MkdirTemp("/tmp", "dsw")
	if err != nil {
		t.Fatalf("mkdir temp: %v", err)
	}
	t.Cleanup(func() { _ = os.RemoveAll(dir) })
	sock := filepath.Join(dir, "api.sock")

	withHTTP := func(answer string) *config.SwitchyConfig {
		conf := mockConfig(t, reserveUDPAddr(t), answer)
		conf.Http = &config.HttpConfig{Network: "unix", Addr: sock}
		return conf
	}
	running, err := reloadServer(nil, withHTTP("1.1.1.1"))
	if err != nil {
		t.Fatalf("initial reloadServer: %v", err)
	}
	shutdownOnCleanup(t, &running)
	running, err = reloadServer(running, withHTTP("2.2.2.2"))
	if err != nil {
		t.Fatalf("second reloadServer: %v", err)
	}

	client := &http.Client{
		Timeout: 2 * time.Second,
		Transport: &http.Transport{DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
			var d net.Dialer
			return d.DialContext(ctx, "unix", sock)
		}},
	}
	resp, err := client.Get("http://unix/panel.js")
	if err != nil {
		t.Fatalf("GET over unix socket after rebuild: %v", err)
	}
	_ = resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want 200", resp.StatusCode)
	}
}

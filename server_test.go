package main

import (
	"bytes"
	"dns-switchy/config"
	"dns-switchy/resolver"
	"dns-switchy/util"
	"net"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/miekg/dns"
)

type testResolver struct {
	acceptFn  func(msg *dns.Msg) bool
	resolveFn func(msg *dns.Msg) (*dns.Msg, error)
	ttl       time.Duration
}

func (r *testResolver) Close() {
}

func (r *testResolver) Accept(msg *dns.Msg) bool {
	if r.acceptFn == nil {
		return false
	}
	return r.acceptFn(msg)
}

func (r *testResolver) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	if r.resolveFn == nil {
		resp := new(dns.Msg)
		resp.SetReply(msg)
		return resp, nil
	}
	return r.resolveFn(msg)
}

func (r *testResolver) TTL() time.Duration {
	return r.ttl
}

type captureDNSResponseWriter struct {
	msg       *dns.Msg
	localAddr net.Addr
	peerAddr  net.Addr
}

func newCaptureDNSResponseWriter() *captureDNSResponseWriter {
	return &captureDNSResponseWriter{
		localAddr: &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 53},
		peerAddr:  &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 53000},
	}
}

func (w *captureDNSResponseWriter) LocalAddr() net.Addr {
	return w.localAddr
}

func (w *captureDNSResponseWriter) RemoteAddr() net.Addr {
	return w.peerAddr
}

func (w *captureDNSResponseWriter) WriteMsg(msg *dns.Msg) error {
	w.msg = msg.Copy()
	return nil
}

func (w *captureDNSResponseWriter) Write(data []byte) (int, error) {
	return len(data), nil
}

func (w *captureDNSResponseWriter) Close() error {
	return nil
}

func (w *captureDNSResponseWriter) TsigStatus() error {
	return nil
}

func (w *captureDNSResponseWriter) TsigTimersOnly(_ bool) {
}

func (w *captureDNSResponseWriter) Hijack() {
}

func newServerForTest(resolvers []resolver.DnsResolver) *DnsSwitchyServer {
	return &DnsSwitchyServer{
		resolvers: resolvers,
		dnsCache:  &util.NoCache{},
	}
}

func makeQuery(name string, qtype uint16) *dns.Msg {
	msg := new(dns.Msg)
	msg.Question = []dns.Question{{
		Name:   name,
		Qtype:  qtype,
		Qclass: dns.ClassINET,
	}}
	return msg
}

func TestDnsMsgHandlerMalformedAndNoResolverPolicy(t *testing.T) {
	tests := []struct {
		name      string
		msg       *dns.Msg
		resolvers []resolver.DnsResolver
		wantRcode int
	}{
		{
			name: "MalformedLenQuestionNotOneReturnsFORMERR",
			msg: &dns.Msg{Question: []dns.Question{
				{Name: "first.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET},
				{Name: "second.example.", Qtype: dns.TypeA, Qclass: dns.ClassINET},
			}},
			resolvers: nil,
			wantRcode: dns.RcodeFormatError,
		},
		{
			name:      "NoResolverAcceptsReturnsREFUSED",
			msg:       makeQuery("example.com.", dns.TypeA),
			resolvers: []resolver.DnsResolver{&testResolver{}},
			wantRcode: dns.RcodeRefused,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := newServerForTest(tt.resolvers)
			wire := newCaptureDNSResponseWriter()

			server.dnsMsgHandler(&DnsWriter{writer: wire, msg: tt.msg, start: time.Now().UnixMilli()}, tt.msg)

			if wire.msg == nil {
				t.Fatalf("expected DNS response with rcode %s, got no response", dns.RcodeToString[tt.wantRcode])
			}
			if wire.msg.Rcode != tt.wantRcode {
				t.Fatalf("rcode = %s, want %s", dns.RcodeToString[wire.msg.Rcode], dns.RcodeToString[tt.wantRcode])
			}
		})
	}
}

func TestHttpHandlerNormalizeQuestionKey(t *testing.T) {
	var acceptedQuestion string
	server := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(msg *dns.Msg) bool {
			acceptedQuestion = msg.Question[0].Name
			return true
		},
		resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
			resp := new(dns.Msg)
			resp.SetReply(msg)
			return resp, nil
		},
	}})

	r := httptest.NewRequest(http.MethodGet, "/dns-query?question=WWW.Example.COM&type=A", nil)
	w := httptest.NewRecorder()

	server.httpHandler().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Fatalf("http status = %d, want %d", w.Code, http.StatusOK)
	}
	want := strings.ToLower(dns.Fqdn("WWW.Example.COM"))
	if acceptedQuestion != want {
		t.Fatalf("question key = %q, want normalized %q", acceptedQuestion, want)
	}
}

func TestDnsMsgHandlerNormalizeCanonicalQuestion(t *testing.T) {
	var acceptedQuestion string
	server := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(msg *dns.Msg) bool {
			acceptedQuestion = msg.Question[0].Name
			return true
		},
		resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
			resp := new(dns.Msg)
			resp.SetReply(msg)
			return resp, nil
		},
	}})

	req := makeQuery("WWW.Example.COM", dns.TypeA)
	wire := newCaptureDNSResponseWriter()
	server.dnsMsgHandler(&DnsWriter{writer: wire, msg: req, start: time.Now().UnixMilli()}, req)

	want := strings.ToLower(dns.Fqdn("WWW.Example.COM"))
	if acceptedQuestion != want {
		t.Fatalf("question key = %q, want normalized %q", acceptedQuestion, want)
	}
}

func TestHttpInvalidTypeReturnsBadRequest(t *testing.T) {
	server := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(msg *dns.Msg) bool {
			t.Fatalf("resolver should not be called for invalid http type")
			return false
		},
	}})

	r := httptest.NewRequest(http.MethodGet, "/dns-query?question=example.com&type=NOT_A_REAL_TYPE", nil)
	w := httptest.NewRecorder()

	server.httpHandler().ServeHTTP(w, r)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("http status = %d, want %d", w.Code, http.StatusBadRequest)
	}
	if !strings.Contains(w.Body.String(), "Invalid type") {
		t.Fatalf("http body = %q, want message containing %q", w.Body.String(), "Invalid type")
	}
}

func largeReplyFor(msg *dns.Msg) *dns.Msg {
	resp := new(dns.Msg)
	resp.SetReply(msg)
	for i := 0; i < 128; i++ {
		resp.Answer = append(resp.Answer, &dns.TXT{
			Hdr: dns.RR_Header{
				Name:   msg.Question[0].Name,
				Rrtype: dns.TypeTXT,
				Class:  dns.ClassINET,
				Ttl:    60,
			},
			Txt: []string{strings.Repeat("x", 200)},
		})
		packed, err := resp.Pack()
		if err == nil && len(packed) > 1800 {
			break
		}
	}
	return resp
}

func packMsg(t *testing.T, msg *dns.Msg) []byte {
	t.Helper()
	packed, err := msg.Pack()
	if err != nil {
		t.Fatalf("pack response fail: %v", err)
	}
	return packed
}

func TestDnsWriterSuccessTruncateAndEDNSPolicy(t *testing.T) {
	tests := []struct {
		name       string
		udpSize    uint16
		wantMaxLen int
		wantMinLen int
	}{
		{
			name:       "TruncateDefaultWithoutEDNSUses512",
			wantMaxLen: 512,
		},
		{
			name:       "EDNSAdvertisedSizeIsHonored",
			udpSize:    1400,
			wantMinLen: 513,
			wantMaxLen: 1400,
		},
	}

	for idx, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := makeQuery("large.example.", dns.TypeA)
			req.Id = uint16(100 + idx)
			req.RecursionDesired = true
			req.CheckingDisabled = true
			if tt.udpSize > 0 {
				req.SetEdns0(tt.udpSize, false)
			}
			resp := largeReplyFor(req)
			resp.Id = req.Id + 1
			resp.Opcode = dns.OpcodeStatus
			resp.RecursionDesired = false
			resp.CheckingDisabled = false
			sourcePacked := packMsg(t, resp)
			wire := newCaptureDNSResponseWriter()

			(&DnsWriter{writer: wire, msg: req, start: time.Now().UnixMilli()}).Success("test-resolver", resp)

			if wire.msg == nil {
				t.Fatal("expected DNS response to be written")
			}
			packed := packMsg(t, wire.msg)
			if len(packed) > tt.wantMaxLen {
				t.Fatalf("response size = %d, want <= %d", len(packed), tt.wantMaxLen)
			}
			if len(packed) < tt.wantMinLen {
				t.Fatalf("response size = %d, want >= %d", len(packed), tt.wantMinLen)
			}
			if wire.msg.Id != req.Id {
				t.Fatalf("written id = %d, want %d", wire.msg.Id, req.Id)
			}
			if wire.msg.Opcode != req.Opcode {
				t.Fatalf("written opcode = %d, want %d", wire.msg.Opcode, req.Opcode)
			}
			if wire.msg.RecursionDesired != req.RecursionDesired {
				t.Fatalf("written RD = %v, want %v", wire.msg.RecursionDesired, req.RecursionDesired)
			}
			if wire.msg.CheckingDisabled != req.CheckingDisabled {
				t.Fatalf("written CD = %v, want %v", wire.msg.CheckingDisabled, req.CheckingDisabled)
			}
			if !bytes.Equal(packMsg(t, resp), sourcePacked) {
				t.Fatal("source response was mutated during DNS write")
			}
		})
	}
}

func TestDnsWriterSuccessResponseCopyIsolation(t *testing.T) {
	sharedResp := largeReplyFor(makeQuery("shared.example.", dns.TypeA))
	sharedResp.Id = 7
	sharedResp.Opcode = dns.OpcodeStatus
	sharedResp.RecursionDesired = false
	sharedResp.CheckingDisabled = false
	sharedPacked := packMsg(t, sharedResp)

	firstReq := makeQuery("shared.example.", dns.TypeA)
	firstReq.Id = 111
	firstReq.RecursionDesired = true

	secondReq := makeQuery("shared.example.", dns.TypeA)
	secondReq.Id = 222
	secondReq.CheckingDisabled = true
	secondReq.SetEdns0(1400, false)

	firstWire := newCaptureDNSResponseWriter()
	secondWire := newCaptureDNSResponseWriter()

	(&DnsWriter{writer: firstWire, msg: firstReq, start: time.Now().UnixMilli()}).Success("test-resolver", sharedResp)
	(&DnsWriter{writer: secondWire, msg: secondReq, start: time.Now().UnixMilli()}).Success("test-resolver", sharedResp)

	if firstWire.msg == nil || secondWire.msg == nil {
		t.Fatal("expected both DNS responses to be written")
	}
	if firstWire.msg.Id != firstReq.Id {
		t.Fatalf("first write id = %d, want %d", firstWire.msg.Id, firstReq.Id)
	}
	if secondWire.msg.Id != secondReq.Id {
		t.Fatalf("second write id = %d, want %d", secondWire.msg.Id, secondReq.Id)
	}
	if firstWire.msg.CheckingDisabled {
		t.Fatal("first write unexpectedly picked up second request CD bit")
	}
	if !secondWire.msg.CheckingDisabled {
		t.Fatal("second write missing request CD bit")
	}
	firstPacked := packMsg(t, firstWire.msg)
	if len(firstPacked) > 512 {
		t.Fatalf("first response size = %d, want <= 512", len(firstPacked))
	}
	secondPacked := packMsg(t, secondWire.msg)
	if len(secondPacked) <= 512 || len(secondPacked) > 1400 {
		t.Fatalf("second response size = %d, want within (512, 1400]", len(secondPacked))
	}
	if !bytes.Equal(packMsg(t, sharedResp), sharedPacked) {
		t.Fatal("shared source response was mutated across writes")
	}
}

func TestHttpWriterSuccessResponseCopyPreservesLargeResponse(t *testing.T) {
	req := makeQuery("http.example.", dns.TypeA)
	resp := largeReplyFor(req)
	before := packMsg(t, resp)

	recorder := httptest.NewRecorder()
	(&HttpWriter{writer: recorder, msg: req, start: time.Now().UnixMilli()}).Success("http-resolver", resp)

	if recorder.Body.Len() == 0 {
		t.Fatal("expected HTTP response body")
	}
	if recorder.Header().Get("content-type") != "application/json" {
		t.Fatalf("content-type = %q, want %q", recorder.Header().Get("content-type"), "application/json")
	}
	if len(before) <= 512 {
		t.Fatalf("test setup produced small response size %d, want > 512", len(before))
	}
	if !bytes.Equal(packMsg(t, resp), before) {
		t.Fatal("HTTP writer mutated source response")
	}
}

func reserveUDPAddr(t *testing.T) string {
	t.Helper()
	listener, err := net.ListenPacket("udp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("reserve udp addr fail: %v", err)
	}
	addr := listener.LocalAddr().String()
	if err = listener.Close(); err != nil {
		t.Fatalf("close reserved udp listener fail: %v", err)
	}
	return addr
}

func TestStartReturnsImmediately(t *testing.T) {
	server := &DnsSwitchyServer{
		config:   &config.SwitchyConfig{Addr: reserveUDPAddr(t)},
		dnsCache: &util.NoCache{},
	}

	startDone := make(chan struct{})
	go func() {
		server.Start()
		close(startDone)
	}()

	select {
	case <-startDone:
	case <-time.After(200 * time.Millisecond):
		go server.Shutdown()
		t.Fatal("Start blocked, expected immediate return")
	}

	time.Sleep(50 * time.Millisecond)
	shutdownDone := make(chan struct{})
	go func() {
		server.Shutdown()
		close(shutdownDone)
	}()

	select {
	case <-shutdownDone:
	case <-time.After(2 * time.Second):
		t.Fatal("Shutdown blocked, expected worker exit")
	}
}

func TestReloadServerStopsPreviousListeners(t *testing.T) {
	oldAddr := reserveUDPAddr(t)
	newAddr := reserveUDPAddr(t)

	runningServer, err := reloadServer(nil, &config.SwitchyConfig{Addr: oldAddr})
	if err != nil {
		t.Fatalf("initial reloadServer fail: %v", err)
	}

	time.Sleep(50 * time.Millisecond)
	runningServer, err = reloadServer(runningServer, &config.SwitchyConfig{Addr: newAddr})
	if err != nil {
		t.Fatalf("reloadServer fail: %v", err)
	}
	t.Cleanup(func() {
		runningServer.Shutdown()
	})

	listener, err := net.ListenPacket("udp", oldAddr)
	if err != nil {
		t.Fatalf("old udp listener still active on reload: %v", err)
	}
	if err = listener.Close(); err != nil {
		t.Fatalf("close udp listener fail: %v", err)
	}
}

func TestReadConfigMissingFileReturnsError(t *testing.T) {
	missingPath := filepath.Join(t.TempDir(), "missing-config.yaml")

	defer func() {
		if recovered := recover(); recovered != nil {
			t.Fatalf("ReadConfig should return error, panicked: %v", recovered)
		}
	}()

	conf, err := ReadConfig(&missingPath)
	if err == nil {
		t.Fatal("ReadConfig error = nil, want missing file error")
	}
	if conf != nil {
		t.Fatalf("ReadConfig config = %v, want nil on missing file", conf)
	}
}

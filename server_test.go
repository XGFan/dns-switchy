package main

import (
	"bytes"
	"dns-switchy/config"
	"dns-switchy/resolver"
	"dns-switchy/util"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
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

type fakeCacheSetCall struct {
	question dns.Question
	msg      dns.Msg
	ttl      time.Duration
}

type fakeCache struct {
	getResult dns.Msg
	setCalls  []fakeCacheSetCall
}

func (c *fakeCache) Get(_ dns.Question) dns.Msg {
	return c.getResult
}

func (c *fakeCache) Set(q dns.Question, msg dns.Msg, ttl time.Duration) {
	c.setCalls = append(c.setCalls, fakeCacheSetCall{
		question: q,
		msg:      *msg.Copy(),
		ttl:      ttl,
	})
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

func makeAResponse(msg *dns.Msg, ip string) *dns.Msg {
	resp := new(dns.Msg)
	resp.SetReply(msg)
	resp.Answer = []dns.RR{&dns.A{
		Hdr: dns.RR_Header{
			Name:   msg.Question[0].Name,
			Rrtype: dns.TypeA,
			Class:  dns.ClassINET,
			Ttl:    60,
		},
		A: net.ParseIP(ip),
	}}
	return resp
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

	r := httptest.NewRequest(http.MethodGet, "/api/query?question=WWW.Example.COM&type=A", nil)
	w := httptest.NewRecorder()

	server.httpMux().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Fatalf("http status = %d, want %d", w.Code, http.StatusOK)
	}
	want := strings.ToLower(dns.Fqdn("WWW.Example.COM"))
	if acceptedQuestion != want {
		t.Fatalf("question key = %q, want normalized %q", acceptedQuestion, want)
	}
}

func TestHttpHandlerDefaultsTypeToA(t *testing.T) {
	var acceptedType uint16
	resolveCalls := 0
	server := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(msg *dns.Msg) bool {
			acceptedType = msg.Question[0].Qtype
			return true
		},
		resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
			resolveCalls++
			resp := new(dns.Msg)
			resp.SetReply(msg)
			return resp, nil
		},
	}})

	r := httptest.NewRequest(http.MethodGet, "/api/query?question=example.com", nil)
	w := httptest.NewRecorder()

	server.httpMux().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Fatalf("http status = %d, want %d", w.Code, http.StatusOK)
	}
	if acceptedType != dns.TypeA {
		t.Fatalf("resolver saw qtype = %s, want %s when type is omitted", dns.TypeToString[acceptedType], dns.TypeToString[dns.TypeA])
	}
	if resolveCalls != 1 {
		t.Fatalf("resolve calls = %d, want 1", resolveCalls)
	}
}

func TestHttpHandlerMissingQuestionReturnsBadRequest(t *testing.T) {
	resolverCalled := 0
	server := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(msg *dns.Msg) bool {
			resolverCalled++
			return true
		},
	}})

	r := httptest.NewRequest(http.MethodGet, "/api/query?type=A", nil)
	w := httptest.NewRecorder()

	server.httpMux().ServeHTTP(w, r)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("http status = %d, want %d", w.Code, http.StatusBadRequest)
	}
	if body := w.Body.String(); body != "Missing question" {
		t.Fatalf("http body = %q, want %q", body, "Missing question")
	}
	if resolverCalled != 0 {
		t.Fatalf("resolver calls = %d, want 0", resolverCalled)
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

func TestDnsMsgHandlerCacheHitBypassesResolvers(t *testing.T) {
	query := makeQuery("Cache.Example.COM", dns.TypeA)
	query.Id = 1234
	cachedResp := makeAResponse(makeQuery("cache.example.com.", dns.TypeA), "1.1.1.1")
	cache := &fakeCache{getResult: *cachedResp.Copy()}

	acceptCalls := 0
	resolveCalls := 0
	server := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(msg *dns.Msg) bool {
			acceptCalls++
			return true
		},
		resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
			resolveCalls++
			return makeAResponse(msg, "9.9.9.9"), nil
		},
	}})
	server.dnsCache = cache

	wire := newCaptureDNSResponseWriter()
	server.dnsMsgHandler(&DnsWriter{writer: wire, msg: query, start: time.Now().UnixMilli()}, query)

	if acceptCalls != 0 {
		t.Fatalf("accept calls = %d, want 0 on cache hit", acceptCalls)
	}
	if resolveCalls != 0 {
		t.Fatalf("resolve calls = %d, want 0 on cache hit", resolveCalls)
	}
	if len(cache.setCalls) != 0 {
		t.Fatalf("cache set calls = %d, want 0 on cache hit", len(cache.setCalls))
	}
	if wire.msg == nil {
		t.Fatal("expected cached DNS response, got nil")
	}
	if wire.msg.Id != query.Id {
		t.Fatalf("response id = %d, want %d", wire.msg.Id, query.Id)
	}
	if got, want := wire.msg.Answer[0].String(), cachedResp.Answer[0].String(); got != want {
		t.Fatalf("cached answer = %q, want %q", got, want)
	}
}

func TestDnsMsgHandlerFallsThroughOnRecoverableError(t *testing.T) {
	query := makeQuery("fallback.example.", dns.TypeA)
	cache := &fakeCache{}

	firstAcceptCalls := 0
	firstResolveCalls := 0
	secondAcceptCalls := 0
	secondResolveCalls := 0
	server := newServerForTest([]resolver.DnsResolver{
		&testResolver{
			acceptFn: func(msg *dns.Msg) bool {
				firstAcceptCalls++
				return true
			},
			resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
				firstResolveCalls++
				return nil, errors.New("temporary upstream failure")
			},
		},
		&testResolver{
			ttl: time.Minute,
			acceptFn: func(msg *dns.Msg) bool {
				secondAcceptCalls++
				return true
			},
			resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
				secondResolveCalls++
				return makeAResponse(msg, "2.2.2.2"), nil
			},
		},
	})
	server.dnsCache = cache

	wire := newCaptureDNSResponseWriter()
	server.dnsMsgHandler(&DnsWriter{writer: wire, msg: query, start: time.Now().UnixMilli()}, query)

	if firstAcceptCalls != 1 || firstResolveCalls != 1 {
		t.Fatalf("first resolver calls = accept %d resolve %d, want 1/1", firstAcceptCalls, firstResolveCalls)
	}
	if secondAcceptCalls != 1 || secondResolveCalls != 1 {
		t.Fatalf("second resolver calls = accept %d resolve %d, want 1/1", secondAcceptCalls, secondResolveCalls)
	}
	if wire.msg == nil {
		t.Fatal("expected fallback DNS response, got nil")
	}
	if wire.msg.Rcode != dns.RcodeSuccess {
		t.Fatalf("rcode = %s, want %s", dns.RcodeToString[wire.msg.Rcode], dns.RcodeToString[dns.RcodeSuccess])
	}
	if got, want := wire.msg.Answer[0].String(), "fallback.example.\t60\tIN\tA\t2.2.2.2"; got != want {
		t.Fatalf("answer = %q, want %q", got, want)
	}
	if len(cache.setCalls) != 1 {
		t.Fatalf("cache set calls = %d, want 1 after fallback success", len(cache.setCalls))
	}
}

func TestDnsMsgHandlerStopsOnBreakError(t *testing.T) {
	query := makeQuery("break.example.", dns.TypeA)
	cache := &fakeCache{}

	firstResolveCalls := 0
	laterAcceptCalls := 0
	laterResolveCalls := 0
	server := newServerForTest([]resolver.DnsResolver{
		&testResolver{
			acceptFn: func(msg *dns.Msg) bool {
				return true
			},
			resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
				firstResolveCalls++
				return nil, resolver.BreakError
			},
		},
		&testResolver{
			acceptFn: func(msg *dns.Msg) bool {
				laterAcceptCalls++
				return true
			},
			resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
				laterResolveCalls++
				return makeAResponse(msg, "3.3.3.3"), nil
			},
		},
	})
	server.dnsCache = cache

	wire := newCaptureDNSResponseWriter()
	server.dnsMsgHandler(&DnsWriter{writer: wire, msg: query, start: time.Now().UnixMilli()}, query)

	if firstResolveCalls != 1 {
		t.Fatalf("break resolver resolve calls = %d, want 1", firstResolveCalls)
	}
	if laterAcceptCalls != 0 || laterResolveCalls != 0 {
		t.Fatalf("later resolver calls = accept %d resolve %d, want 0/0 after BreakError", laterAcceptCalls, laterResolveCalls)
	}
	if len(cache.setCalls) != 0 {
		t.Fatalf("cache set calls = %d, want 0 on BreakError", len(cache.setCalls))
	}
	if wire.msg == nil {
		t.Fatal("expected failure DNS response, got nil")
	}
	if wire.msg.Rcode != dns.RcodeServerFailure {
		t.Fatalf("rcode = %s, want %s", dns.RcodeToString[wire.msg.Rcode], dns.RcodeToString[dns.RcodeServerFailure])
	}
}

func TestDnsMsgHandlerCachesOnlySuccessfulAnsweredResponses(t *testing.T) {
	tests := []struct {
		name         string
		makeResponse func(msg *dns.Msg) *dns.Msg
		wantCache    bool
		wantTTL      time.Duration
	}{
		{
			name: "SuccessWithAnswerCaches",
			makeResponse: func(msg *dns.Msg) *dns.Msg {
				return makeAResponse(msg, "4.4.4.4")
			},
			wantCache: true,
			wantTTL:   45 * time.Second,
		},
		{
			name: "SuccessWithEmptyAnswerSkipsCache",
			makeResponse: func(msg *dns.Msg) *dns.Msg {
				resp := new(dns.Msg)
				resp.SetReply(msg)
				return resp
			},
			wantCache: false,
			wantTTL:   45 * time.Second,
		},
		{
			name: "NonSuccessRcodeWithAnswerSkipsCache",
			makeResponse: func(msg *dns.Msg) *dns.Msg {
				resp := makeAResponse(msg, "5.5.5.5")
				resp.Rcode = dns.RcodeNameError
				return resp
			},
			wantCache: false,
			wantTTL:   45 * time.Second,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			query := makeQuery("Cache-Policy.Example.COM", dns.TypeA)
			cache := &fakeCache{}
			server := newServerForTest([]resolver.DnsResolver{&testResolver{
				ttl: tt.wantTTL,
				acceptFn: func(msg *dns.Msg) bool {
					return true
				},
				resolveFn: func(msg *dns.Msg) (*dns.Msg, error) {
					return tt.makeResponse(msg), nil
				},
			}})
			server.dnsCache = cache

			wire := newCaptureDNSResponseWriter()
			server.dnsMsgHandler(&DnsWriter{writer: wire, msg: query, start: time.Now().UnixMilli()}, query)

			gotCalls := len(cache.setCalls)
			if tt.wantCache {
				if gotCalls != 1 {
					t.Fatalf("cache set calls = %d, want 1", gotCalls)
				}
				if cache.setCalls[0].ttl != tt.wantTTL {
					t.Fatalf("cache ttl = %s, want %s", cache.setCalls[0].ttl, tt.wantTTL)
				}
				wantQuestion := dns.Question{Name: "cache-policy.example.com.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
				if cache.setCalls[0].question != wantQuestion {
					t.Fatalf("cache question = %#v, want %#v", cache.setCalls[0].question, wantQuestion)
				}
				if cache.setCalls[0].msg.Rcode != dns.RcodeSuccess || len(cache.setCalls[0].msg.Answer) == 0 {
					t.Fatalf("cached msg = rcode %s answers %d, want successful answered response", dns.RcodeToString[cache.setCalls[0].msg.Rcode], len(cache.setCalls[0].msg.Answer))
				}
			} else if gotCalls != 0 {
				t.Fatalf("cache set calls = %d, want 0", gotCalls)
			}
		})
	}
}

func TestHttpInvalidTypeReturnsBadRequest(t *testing.T) {
	server := newServerForTest([]resolver.DnsResolver{&testResolver{
		acceptFn: func(msg *dns.Msg) bool {
			t.Fatalf("resolver should not be called for invalid http type")
			return false
		},
	}})

	r := httptest.NewRequest(http.MethodGet, "/api/query?question=example.com&type=NOT_A_REAL_TYPE", nil)
	w := httptest.NewRecorder()

	server.httpMux().ServeHTTP(w, r)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("http status = %d, want %d", w.Code, http.StatusBadRequest)
	}
	if !strings.Contains(w.Body.String(), "Invalid type") {
		t.Fatalf("http body = %q, want message containing %q", w.Body.String(), "Invalid type")
	}
}

func TestCalcTTLChoosesSmallestPositiveResolverTTL(t *testing.T) {
	got := calcTTL([]resolver.DnsResolver{
		&testResolver{ttl: 5 * time.Minute},
		&testResolver{ttl: 0},
		&testResolver{ttl: -1 * time.Second},
		&testResolver{ttl: 45 * time.Second},
		&testResolver{ttl: 2 * time.Minute},
	})

	if got != 45*time.Second {
		t.Fatalf("calcTTL() = %s, want %s", got, 45*time.Second)
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

func TestReadConfigSetsBasePathFromFileDir(t *testing.T) {
	dir := t.TempDir()
	rulesDir := filepath.Join(dir, "rules")
	if err := os.MkdirAll(rulesDir, 0700); err != nil {
		t.Fatalf("create rules dir fail: %v", err)
	}
	if err := os.WriteFile(filepath.Join(rulesDir, "extra.rules"), []byte("qq.com\n!ads.qq.com\n"), 0600); err != nil {
		t.Fatalf("write include file fail: %v", err)
	}
	configFile := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(configFile, []byte(`
addr: ":1053"
resolvers:
  - type: forward
    name: include-dns
    url: 8.8.8.8
    rule:
      - include:rules/extra.rules
      - baidu.com
`), 0600); err != nil {
		t.Fatalf("write config file fail: %v", err)
	}

	basePath := config.BasePath
	t.Cleanup(func() {
		config.BasePath = basePath
	})

	parsed, err := ReadConfig(&configFile)
	if err != nil {
		t.Fatalf("ReadConfig() error = %v", err)
	}
	if config.BasePath != dir {
		t.Fatalf("config.BasePath = %q, want %q", config.BasePath, dir)
	}

	forward, ok := parsed.Resolvers[0].(*config.ForwardConfig)
	if !ok {
		t.Fatalf("expected forward config, got %T", parsed.Resolvers[0])
	}
	if want := []string{"qq.com", "!ads.qq.com", "baidu.com"}; !reflect.DeepEqual(forward.Rule, want) {
		t.Fatalf("forward.Rule = %#v, want %#v", forward.Rule, want)
	}
}

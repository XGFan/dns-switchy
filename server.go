package main

import (
	"context"
	"embed"
	"io/fs"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"encoding/json"
	"errors"
	"fmt"
	"log"

	"dns-switchy/config"
	"dns-switchy/nftset"
	"dns-switchy/resolver"
	"dns-switchy/util"

	"github.com/miekg/dns"
)

//go:embed all:web/dist
var webFS embed.FS

func ReadConfig(file *string) (*config.SwitchyConfig, error) {
	log.Printf("Config: %s", *file)
	open, err := os.Open(*file)
	if err != nil {
		return nil, err
	}
	//goland:noinspection GoUnhandledErrorResult
	defer open.Close()
	config.BasePath = filepath.Dir(open.Name())
	return config.ParseConfig(open)
}

func printRuntimeInfo() {
	executable, e := os.Executable()
	if e == nil {
		log.Printf("Executable Path: %s", executable)
	}
	wd, e := os.Getwd()
	if e == nil {
		log.Printf("Working Path: %s", wd)
	}
}

// resolverGen is one generation of the resolver chain. The query path snapshots
// the active generation once and uses it end-to-end. When a generation is
// retired (replaced by a swap) it is only closed after the last in-flight query
// releases it (inUse drops to 0). closeOnce guards against the double-close that
// would otherwise corrupt non-idempotent Forward.Close (forward.go:38).
type resolverGen struct {
	resolvers []resolver.DnsResolver
	// inUse counts in-flight queries holding this generation. It is incremented
	// under genMu.RLock (acquire) and decremented/read under genMu.Lock
	// (release/swap); atomic ops keep the concurrent RLock increments safe.
	inUse     atomic.Int64
	retired   bool
	closeOnce sync.Once
}

func (g *resolverGen) closeAll() {
	g.closeOnce.Do(func() {
		for _, r := range g.resolvers {
			r.Close()
		}
	})
}

type DnsSwitchyServer struct {
	config     *config.SwitchyConfig
	udpServer  *dns.Server
	tcpServer  *dns.Server
	httpServer *http.Server
	gen        atomic.Pointer[resolverGen]
	genMu      sync.RWMutex // protects gen.inUse / gen.retired
	dnsCache   util.Cache
	nftWriter  nftset.Writer
	configCtl  *ConfigController // nil when the config editor API is not wired (e.g. unit tests)
	apiKey     string            // 见 auth.go：空 = 不鉴权；创建后只读
	stats      *queryStats       // nil = 不统计（单测直接构造的 server）
	shutdown   bool
	wg         sync.WaitGroup

	// 由 Listen 预先绑定；Start 只在这些 socket 上 serve。
	udpConn      net.PacketConn
	tcpListener  net.Listener
	httpListener net.Listener
}

// acquireGen pins the active resolver generation for the duration of a query.
// The RLock spans "load pointer + inUse++" so the increment lands on the same
// generation that was loaded, closing the load-then-increment race.
func (s *DnsSwitchyServer) acquireGen() *resolverGen {
	s.genMu.RLock()
	gen := s.gen.Load()
	if gen != nil {
		gen.inUse.Add(1)
	}
	s.genMu.RUnlock()
	return gen
}

// releaseGen drops a query's reference to a generation and closes it if it is
// both retired and no longer referenced.
func (s *DnsSwitchyServer) releaseGen(gen *resolverGen) {
	if gen == nil {
		return
	}
	s.genMu.Lock()
	remaining := gen.inUse.Add(-1)
	shouldClose := gen.retired && remaining == 0
	s.genMu.Unlock()
	if shouldClose {
		gen.closeAll()
	}
}

// SwapResolvers builds a new resolver chain from conf and atomically installs it
// as the active generation. The previous generation is retired and closed only
// once its last in-flight query finishes (RCU). On build failure the running
// state is left untouched. The DNS cache is cleared after a successful swap so
// stale routing decisions are not masked by previously cached answers.
func (s *DnsSwitchyServer) SwapResolvers(conf *config.SwitchyConfig) error {
	newR, err := resolver.CreateResolvers(conf)
	if err != nil {
		// CreateResolvers already closes anything it built before failing.
		return err
	}
	s.installGen(newR)
	s.config = conf
	s.dnsCache.Clear()
	return nil
}

// installGen atomically installs newR as the active resolver generation, retires
// the previous one, and closes it immediately if no query holds it (otherwise
// the last in-flight query closes it on release). It does not touch the cache or
// s.config — SwapResolvers wraps those concerns.
func (s *DnsSwitchyServer) installGen(newR []resolver.DnsResolver) {
	newGen := &resolverGen{resolvers: newR}
	s.genMu.Lock()
	old := s.gen.Load()
	s.gen.Store(newGen)
	var closeOld bool
	if old != nil {
		old.retired = true
		closeOld = old.inUse.Load() == 0
	}
	s.genMu.Unlock()
	if old != nil && closeOld {
		old.closeAll()
	}
}

func (s *DnsSwitchyServer) Shutdown() {
	log.Println("Shutdown server")
	if s.udpServer != nil {
		_ = s.udpServer.Shutdown()
	}
	if s.tcpServer != nil {
		_ = s.tcpServer.Shutdown()
	}
	if s.httpServer != nil {
		_ = s.httpServer.Shutdown(context.Background())
	}
	s.closeListeners()
	s.closeResolvers()
	s.wg.Wait()
}

func (s *DnsSwitchyServer) closeResolvers() {
	if gen := s.gen.Load(); gen != nil {
		gen.closeAll()
	}
}

func (s *DnsSwitchyServer) Start() {
	printRuntimeInfo()
	var resolvers []resolver.DnsResolver
	if gen := s.gen.Load(); gen != nil {
		resolvers = gen.resolvers
	}
	log.Printf("Started at %s\nHTTP: %s\nTTL: %s\nResolvers: %s", s.config.Addr, s.config.Http, s.config.TTL, resolvers)
	handler := s.dnsHandler()
	s.udpServer = &dns.Server{PacketConn: s.udpConn, Handler: handler}
	s.wg.Add(1)
	go s.serve("udp", s.udpServer.ActivateAndServe)
	if s.tcpListener != nil {
		s.tcpServer = &dns.Server{Listener: s.tcpListener, Handler: handler}
		s.wg.Add(1)
		go s.serve("tcp", s.tcpServer.ActivateAndServe)
	}
	if s.httpListener != nil {
		s.httpServer = &http.Server{Handler: s.httpMux()}
		s.wg.Add(1)
		go s.serve("http", func() error {
			if err := s.httpServer.Serve(s.httpListener); !errors.Is(err, http.ErrServerClosed) {
				return err
			}
			return nil
		})
	}
}

func (s *DnsSwitchyServer) serve(name string, fn func() error) {
	defer s.wg.Done()
	if err := fn(); err != nil {
		log.Printf("%s server stopped: %v", name, err)
	}
}

func (s *DnsSwitchyServer) dnsHandler() dns.HandlerFunc {
	return func(writer dns.ResponseWriter, msg *dns.Msg) {
		s.dnsMsgHandler(&DnsWriter{
			writer:   writer,
			msg:      msg,
			start:    time.Now().UnixMilli(),
			queryLog: s.config.QueryLog,
			stats:    s.stats,
		}, msg)
	}
}

func (s *DnsSwitchyServer) httpMux() http.Handler {
	mux := http.NewServeMux()
	// /api/* 全量鉴权（含只读的 query/config GET）；静态资源与 /panel.js 不鉴权，
	// 面板自己会在拿到 401 时渲染 key 输入界面。
	mux.HandleFunc("/api/query", s.requireAPIKey(s.apiQueryHandler))
	mux.HandleFunc("/api/config/validate", s.requireAPIKey(s.apiConfigValidateHandler))
	mux.HandleFunc("/api/config", s.requireAPIKey(s.apiConfigHandler))
	mux.HandleFunc("/api/stats", s.requireAPIKey(s.apiStatsHandler))
	mux.Handle("/", spaHandler())
	return mux
}

func (s *DnsSwitchyServer) apiQueryHandler(w http.ResponseWriter, r *http.Request) {
	queryType := r.URL.Query().Get("type")
	if queryType == "" {
		queryType = "A"
	}
	queryTypeValue, ok := dns.StringToType[strings.ToUpper(queryType)]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("Invalid type"))
		return
	}
	question := r.URL.Query().Get("question")
	if question == "" {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("Missing question"))
		return
	}
	m := new(dns.Msg)
	m.SetQuestion(dns.Fqdn(question), queryTypeValue)
	s.resolveOnly(&HttpWriter{w, m, time.Now().UnixMilli()}, m)
}

func spaHandler() http.Handler {
	subFS, err := fs.Sub(webFS, "web/dist")
	if err != nil {
		log.Printf("embed web/dist: %v", err)
		return http.NotFoundHandler()
	}
	return spaHandlerFS(subFS)
}

// spaHandlerFS 是 spaHandler 的可测形态：接受任意 fs.FS，好让单测能拿一个「没有
// panel.js」的假文件系统去覆盖探活分支（真 embed 里 panel.js 恒存在）。
func spaHandlerFS(subFS fs.FS) http.Handler {
	fileServer := http.FileServer(http.FS(subFS))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		// 没被 mux 显式注册的 /api/... 落到这里，说明是不存在的端点，如实回 404。
		// 走 SPA 兜底会回一个 index.html + 200，前端于是拿 HTML 去 JSON.parse，
		// 报出一个与真实原因（端点写错了）毫无关系的错误；反代/探活侧同理需要 4xx
		// 而不是一页 HTML。语义与 exit-pin internal/web/web.go 对齐。
		if strings.HasPrefix(path, "/api/") {
			http.NotFound(w, r)
			return
		}
		// /panel.js 是面板契约里的固定路径：net-console 既按它取组件，也拿
		// 「GET /panel.js 是不是 2xx」当探活判据。
		//
		// 它必须显式 stat，**不能走下面的 SPA 兜底**：兜底会把找不到的路径回成
		// index.html + 200，于是忘了构建前端时探活照样报在线，而宿主页面上是一个
		// 永远空着的格子——最难查的那种故障。缺失就如实 404。
		//
		// no-cache 同样是契约要求：URL 里没有内容指纹，不靠这个头收缓存的话，升级后
		// 浏览器会继续用旧面板。
		if path == "/panel.js" {
			w.Header().Set("Cache-Control", "no-cache")
			if f, err := fs.Stat(subFS, "panel.js"); err != nil || f.IsDir() {
				http.NotFound(w, r)
				return
			}
			fileServer.ServeHTTP(w, r)
			return
		}
		if path != "/" {
			cleanPath := strings.TrimPrefix(path, "/")
			if f, err := fs.Stat(subFS, cleanPath); err == nil && !f.IsDir() {
				fileServer.ServeHTTP(w, r)
				return
			}
		}
		// SPA 兜底：改写路径前先 Clone，别在调用方的 *http.Request 上就地改
		// —— 它可能还要被中间件/日志读到原始路径。
		fallback := r.Clone(r.Context())
		fallback.URL.Path = "/"
		fileServer.ServeHTTP(w, fallback)
	})
}

func (s *DnsSwitchyServer) dnsMsgHandler(resultWriter ResultWriter, msg *dns.Msg) {
	if checkAndUnify(msg) != nil {
		if msg == nil {
			log.Printf("[%s] send invalid nil msg", resultWriter.RemoteAddr())
		} else {
			log.Printf("[%s] send invalid msg [%s]", resultWriter.RemoteAddr(), msg.String())
		}
		resultWriter.Rcode(dns.RcodeFormatError)
		return
	}
	if cached := s.dnsCache.Get(msg.Question[0]); !reflect.DeepEqual(cached, util.None) {
		resultWriter.Success("dnsCache", &cached)
		return
	}
	s.resolveOnly(resultWriter, msg)
}

func (s *DnsSwitchyServer) resolveOnly(resultWriter ResultWriter, msg *dns.Msg) {
	if checkAndUnify(msg) != nil {
		if msg == nil {
			log.Printf("[%s] send invalid nil msg", resultWriter.RemoteAddr())
		} else {
			log.Printf("[%s] send invalid msg [%s]", resultWriter.RemoteAddr(), msg.String())
		}
		resultWriter.Rcode(dns.RcodeFormatError)
		return
	}
	gen := s.acquireGen()
	defer s.releaseGen(gen)
	var resolvers []resolver.DnsResolver
	if gen != nil {
		resolvers = gen.resolvers
	}
	for i, upstream := range resolvers {
		if upstream.Accept(msg) {
			resp, err := upstream.Resolve(msg)
			if err != nil {
				if errors.Is(err, resolver.BreakError) {
					resultWriter.Fail(upstream, err)
					return
				}
				if i < len(resolvers)-1 {
					continue
				} else {
					resultWriter.Fail(upstream, err)
				}
			} else {
				if resp.Rcode == dns.RcodeSuccess && len(resp.Answer) > 0 {
					s.writeNftSet(upstream, resp)
					s.dnsCache.Set(msg.Question[0], *resp, upstream.TTL())
				}
				resultWriter.Success(upstream, resp)
			}
			return
		}
	}
	resultWriter.Rcode(dns.RcodeRefused)
}

// writeNftSet 在「配了 nftset 的 resolver」cache-miss 解析成功后，把答案里的 A 记录 IP
// 同步写进对应的 nft 集合（本期仅 IPv4，忽略 AAAA）。失败非致命：只记日志，DNS 答案
// 照常返回。调用点在 dnsCache.Set/Success 之前，确保客户端拿到 IP 去连接时集合已就绪。
func (s *DnsSwitchyServer) writeNftSet(upstream resolver.DnsResolver, resp *dns.Msg) {
	if s.nftWriter == nil {
		return
	}
	na, ok := upstream.(resolver.NftSetAware)
	if !ok {
		return
	}
	set4, ttl := na.NftSetSpec()
	if set4 == "" {
		return
	}
	ips := make([]net.IP, 0, len(resp.Answer))
	for _, rr := range resp.Answer {
		if a, ok := rr.(*dns.A); ok && a.A != nil {
			ips = append(ips, a.A)
		}
	}
	if len(ips) == 0 {
		return
	}
	if err := s.nftWriter.Add(context.Background(), set4, ips, ttl); err != nil {
		log.Printf("nftset %s: add %d element(s) fail: %v", set4, len(ips), err)
	}
}

func Create(conf *config.SwitchyConfig) (*DnsSwitchyServer, error) {
	resolvers, err := resolver.CreateResolvers(conf)
	if err != nil {
		return nil, err
	}
	if conf.TTL == 0 {
		conf.TTL = calcTTL(resolvers)
	}
	s := &DnsSwitchyServer{
		config:    conf,
		dnsCache:  util.NewDnsCache(conf.TTL),
		nftWriter: nftset.NewExecWriter(conf.NftSetTable),
		apiKey:    conf.ApiKey,
		stats:     newQueryStats(),
		wg:        sync.WaitGroup{},
	}
	s.gen.Store(&resolverGen{resolvers: resolvers})
	return s, nil
}

func calcTTL(resolvers []resolver.DnsResolver) time.Duration {
	minTTL := time.Duration(0)
	for _, res := range resolvers {
		if res.TTL() > 0 && (minTTL > res.TTL() || minTTL == 0) {
			minTTL = res.TTL()
		}
	}
	return minTTL
}

type ResultWriter interface {
	RemoteAddr() net.Addr
	Success(name interface{}, resp *dns.Msg)
	Fail(name interface{}, err error)
	Rcode(rcode int)
}

type DnsWriter struct {
	writer   dns.ResponseWriter
	msg      *dns.Msg
	start    int64
	queryLog config.QueryLog // 空值（单测直接构造）按 all 处理
	stats    *queryStats
}

func (w *DnsWriter) logSuccess() bool {
	return w.queryLog == "" || w.queryLog == config.QueryLogAll
}

type HttpWriter struct {
	writer http.ResponseWriter
	msg    *dns.Msg
	start  int64
}

type FakeAddr struct {
}

func (f FakeAddr) Network() string {
	return "http"
}

func (f FakeAddr) String() string {
	return "api"
}

func (a *HttpWriter) RemoteAddr() net.Addr {
	return &FakeAddr{}
}

func (a *HttpWriter) Success(name interface{}, resp *dns.Msg) {
	a.writer.Header().Set("content-type", "application/json")
	_ = json.NewEncoder(a.writer).Encode(map[string]interface{}{
		"resolver": fmt.Sprintf("%s", name),
		"answer":   resp,
	})
}

func (a *HttpWriter) Fail(name interface{}, err error) {
	a.writer.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(a.writer).Encode(map[string]interface{}{
		"resolver": fmt.Sprintf("%s", name),
		"error":    errString(err),
	})
}

func (a *HttpWriter) Rcode(rcode int) {
	resp := new(dns.Msg)
	if a.msg != nil {
		resp.SetRcode(a.msg, rcode)
	} else {
		resp.Rcode = rcode
	}
	a.Success("policy", resp)
}

func (w *DnsWriter) RemoteAddr() net.Addr {
	return w.writer.RemoteAddr()
}

func (w *DnsWriter) Success(name interface{}, resp *dns.Msg) {
	resolverName := fmt.Sprintf("%s", name)
	w.stats.record(resolverName, resp.Rcode, false)
	if w.logSuccess() {
		remoteAddr := w.writer.RemoteAddr().String()
		structureLog := StructureLog{
			Resolver:   resolverName,
			Remote:     remoteAddr[:strings.LastIndex(remoteAddr, ":")],
			Time:       time.Now().UnixMilli() - w.start,
			Type:       dns.TypeToString[w.msg.Question[0].Qtype],
			Question:   w.msg.Question[0].Name,
			RCode:      dns.RcodeToString[resp.Rcode],
			AnswerSize: len(resp.Answer),
		}
		_ = json.NewEncoder(log.Writer()).Encode(structureLog)
	}
	writeResp := resp.Copy()
	writeResp.Id = w.msg.Id
	writeResp.Opcode = w.msg.Opcode
	if writeResp.Opcode == dns.OpcodeQuery {
		writeResp.RecursionDesired = w.msg.RecursionDesired // Copy rd bit
		writeResp.CheckingDisabled = w.msg.CheckingDisabled // Copy cd bit
	}
	writeResp.Truncate(w.maxSize())
	_ = w.writer.WriteMsg(writeResp)
}

// maxSize 是应答允许的最大字节数：TCP 不受 UDP 报文上限约束；UDP 取客户端 EDNS 声明值，缺省 512。
func (w *DnsWriter) maxSize() int {
	if _, ok := w.writer.RemoteAddr().(*net.TCPAddr); ok {
		return dns.MaxMsgSize
	}
	if opt := w.msg.IsEdns0(); opt != nil && opt.UDPSize() > 0 {
		return int(opt.UDPSize())
	}
	return 512
}

func (w *DnsWriter) Fail(name interface{}, err error) {
	resolverName := fmt.Sprintf("%s", name)
	w.stats.record(resolverName, dns.RcodeServerFailure, true)
	if w.queryLog != config.QueryLogOff {
		remoteAddr := w.writer.RemoteAddr().String()
		structureLog := StructureLog{
			Resolver: resolverName,
			Remote:   remoteAddr[:strings.LastIndex(remoteAddr, ":")],
			Time:     time.Now().UnixMilli() - w.start,
			Type:     dns.TypeToString[w.msg.Question[0].Qtype],
			Question: w.msg.Question[0].Name,
			Error:    errString(err),
		}
		_ = json.NewEncoder(log.Writer()).Encode(structureLog)
	}
	resp := new(dns.Msg)
	resp.SetRcode(w.msg, dns.RcodeServerFailure)
	_ = w.writer.WriteMsg(resp)
}

func (w *DnsWriter) Rcode(rcode int) {
	w.stats.record("", rcode, false)
	resp := new(dns.Msg)
	if w.msg != nil {
		resp.SetRcode(w.msg, rcode)
	} else {
		resp.Rcode = rcode
	}
	_ = w.writer.WriteMsg(resp)
}

func checkAndUnify(msg *dns.Msg) error {
	if msg == nil {
		return errors.New("invalid nil msg")
	}
	if len(msg.Question) != 1 {
		return fmt.Errorf("invalid question %v", msg.Question)
	}
	msg.Question[0].Name = strings.ToLower(dns.Fqdn(msg.Question[0].Name))
	return nil
}

type StructureLog struct {
	Resolver   string `json:"resolver,omitempty"`
	Remote     string `json:"remote,omitempty"`
	Time       int64  `json:"time,omitempty"`
	Type       string `json:"type,omitempty"`
	Question   string `json:"question,omitempty"`
	RCode      string `json:"rCode,omitempty"`
	AnswerSize int    `json:"answerSize"`
	// Error 必须是字符串：error 接口直接 JSON 编码只会得到 {}，日志里就看不到失败原因。
	Error string `json:"error,omitempty"`
}

func errString(err error) string {
	if err == nil {
		return ""
	}
	return err.Error()
}

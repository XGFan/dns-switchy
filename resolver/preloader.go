package resolver

import (
	"dns-switchy/config"
	"fmt"
	"github.com/miekg/dns"
	"log"
	"sync"
	"sync/atomic"
	"time"
)

// preloaderIdleTicks：一个名字连续这么多个刷新周期没被查询就淘汰、不再刷新。否则查过的每个
// 名字都会被永久保留并按周期重新解析，内存和上游请求随运行时间单调增长。
const preloaderIdleTicks = 60

// preloaderRefreshWorkers：一轮刷新最多同时在途的上游查询数。
const preloaderRefreshWorkers = 8

type Preloader struct {
	*Forward
	dnsCache  sync.Map
	lastHit   sync.Map // dns.Question -> *atomic.Int64（最近一次被查询的 UnixNano）
	ticker    *time.Ticker
	stop      chan struct{}
	done      chan struct{}
	closeOnce sync.Once
}

func (pl *Preloader) TTL() time.Duration {
	return -1
}

// NftSetSpec 显式委托内部 Forward，而非依赖匿名内嵌的方法提升：preloader 是 corp
// 解析器的常用类型，必须确保钩子能拿到它的 nftset 配置，并对 nil Forward 做防御。
func (pl *Preloader) NftSetSpec() (set4 string, ttl time.Duration) {
	if pl.Forward == nil {
		return "", 0
	}
	return pl.Forward.NftSetSpec()
}

func (pl *Preloader) Close() {
	pl.closeOnce.Do(func() {
		if pl.ticker != nil {
			pl.ticker.Stop()
		}
		if pl.stop != nil {
			close(pl.stop)
		}
		if pl.done != nil {
			<-pl.done
		}
		if pl.Forward != nil {
			pl.Forward.Close()
		}
	})
}

func (pl *Preloader) Work() {
	defer close(pl.done)
	for {
		select {
		case <-pl.stop:
			log.Printf("preloader %s exit", pl)
			return
		case <-pl.ticker.C:
			pl.refresh(time.Now())
		}
	}
}

// refresh 重新解析下个周期前就会过期的条目（最多 preloaderRefreshWorkers 个并行），全部完成才返回；
// 超过 preloaderIdleTicks 个周期没被查询的条目直接淘汰。
//
// 判定留 ttl/2 余量而不是只刷已过期的：本轮刷新后 ExpiredAt = tick + 解析耗时 + ttl，略晚于
// 下一轮 tick，只刷已过期的会让它在下一轮被跳过，实际刷新间隔变成 2×ttl。
func (pl *Preloader) refresh(now time.Time) {
	idleBefore := now.Add(-preloaderIdleTicks * pl.ttl).UnixNano()
	refreshBefore := now.Add(pl.ttl / 2)
	sem := make(chan struct{}, preloaderRefreshWorkers)
	var wg sync.WaitGroup
	pl.dnsCache.Range(func(key, value interface{}) bool {
		v := value.(TimeItem)
		if !v.ExpiredAt.Before(refreshBefore) {
			return true
		}
		oldQ := key.(dns.Question)
		if pl.lastHitOf(oldQ) < idleBefore {
			pl.dnsCache.Delete(oldQ)
			pl.lastHit.Delete(oldQ)
			return true
		}
		newMsg := new(dns.Msg)
		newMsg.Question = append(newMsg.Question, oldQ)
		newMsg.Id = dns.Id()
		newMsg.RecursionDesired = true
		sem <- struct{}{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			defer func() { <-sem }()
			_, _ = pl.PreLoad(newMsg)
		}()
		return true
	})
	wg.Wait()
}

func (pl *Preloader) touch(q dns.Question, now time.Time) {
	v, ok := pl.lastHit.Load(q)
	if !ok {
		v, _ = pl.lastHit.LoadOrStore(q, new(atomic.Int64))
	}
	v.(*atomic.Int64).Store(now.UnixNano())
}

func (pl *Preloader) lastHitOf(q dns.Question) int64 {
	if v, ok := pl.lastHit.Load(q); ok {
		return v.(*atomic.Int64).Load()
	}
	return 0
}

type TimeItem struct {
	ExpiredAt time.Time
	Item      *dns.Msg
}

func (pl *Preloader) PreLoad(msg *dns.Msg) (*dns.Msg, error) {
	resolve, err := pl.Forward.Resolve(msg)
	if err == nil && len(resolve.Answer) > 0 {
		pl.dnsCache.Store(
			msg.Question[0],
			TimeItem{time.Now().Add(pl.ttl), resolve.Copy()},
		)
	}
	return resolve, err
}

func (pl *Preloader) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	q := msg.Question[0]
	if cached, exist := pl.dnsCache.Load(q); exist {
		pl.touch(q, time.Now())
		return cached.(TimeItem).Item.Copy(), nil
	}
	resp, err := pl.PreLoad(msg)
	// 只为真正进了缓存的名字记录查询时间：lastHit 的条目随缓存条目一起淘汰，
	// 没答案、没进缓存的名字若也记录，就会在 lastHit 里永久残留。
	if _, stored := pl.dnsCache.Load(q); stored {
		pl.touch(q, time.Now())
	}
	return resp, err
}

func NewPreloader(pc *config.PreloaderConfig) (*Preloader, error) {
	if pc.TTL <= 0 {
		return nil, fmt.Errorf("invalid preloader ttl: %s", pc.TTL)
	}
	forward, err := NewForward(&pc.ForwardConfig)
	if err != nil {
		log.Println("init preloader fail")
		return nil, err
	}
	p := &Preloader{
		Forward:  forward,
		dnsCache: sync.Map{},
		ticker:   time.NewTicker(pc.TTL),
		stop:     make(chan struct{}),
		done:     make(chan struct{}),
	}
	go p.Work()
	return p, nil
}

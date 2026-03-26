package resolver

import (
	"dns-switchy/config"
	"fmt"
	"github.com/miekg/dns"
	"log"
	"sync"
	"time"
)

type Preloader struct {
	*Forward
	dnsCache  sync.Map
	ticker    *time.Ticker
	stop      chan struct{}
	done      chan struct{}
	closeOnce sync.Once
}

func (pl *Preloader) TTL() time.Duration {
	return -1
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
			pl.dnsCache.Range(func(key, value interface{}) bool {
				v := value.(TimeItem)
				if v.ExpiredAt.After(time.Now()) {
					return true
				}
				newMsg := new(dns.Msg)
				oldQ := key.(dns.Question)
				newMsg.Question = append(newMsg.Question, oldQ)
				newMsg.Id = dns.Id()
				newMsg.RecursionDesired = true
				_, _ = pl.PreLoad(newMsg)
				return true
			})
		}
	}
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
	if cached, exist := pl.dnsCache.Load(msg.Question[0]); exist {
		return cached.(TimeItem).Item.Copy(), nil
	} else {
		return pl.PreLoad(msg)
	}
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

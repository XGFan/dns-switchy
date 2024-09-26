package resolver

import (
	"dns-switchy/config"
	"github.com/miekg/dns"
	"log"
	"sync"
	"time"
)

type Preloader struct {
	*Forward
	dnsCache sync.Map
	notify   chan struct{}
}

func (pl *Preloader) TTL() time.Duration {
	return -1
}

func (pl *Preloader) Close() {
	pl.notify <- struct{}{}
	pl.Forward.Close()
}

func (pl *Preloader) Work() {
	for {
		select {
		case <-pl.notify:
			log.Printf("preloader %s exit", pl)
			return
		default:
			pl.dnsCache.Range(func(key, value interface{}) bool {
				v := value.(TimeItem)
				if v.CreateAt.Add(pl.ttl).After(time.Now()) {
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
	CreateAt time.Time
	Item     *dns.Msg
}

func (pl *Preloader) PreLoad(msg *dns.Msg) (*dns.Msg, error) {
	resolve, err := pl.Forward.Resolve(msg)
	if err == nil && len(resolve.Answer) > 0 {
		pl.dnsCache.Store(
			msg.Question[0],
			TimeItem{time.Now(), resolve},
		)
	}
	return resolve, err
}

func (pl *Preloader) Resolve(msg *dns.Msg) (*dns.Msg, error) {
	if cached, exist := pl.dnsCache.Load(msg.Question[0]); exist {
		return cached.(TimeItem).Item, nil
	} else {
		return pl.PreLoad(msg)
	}
}

func NewPreloader(pc *config.PreloaderConfig) (*Preloader, error) {
	forward, err := NewForward(&pc.ForwardConfig)
	if err != nil {
		log.Println("init preloader fail")
		return nil, err
	}
	p := &Preloader{
		Forward:  forward,
		dnsCache: sync.Map{},
		notify:   make(chan struct{}),
	}
	go p.Work()
	return p, nil
}

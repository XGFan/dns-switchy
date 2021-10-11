package main

import (
	"github.com/AdguardTeam/dnsproxy/upstream"
	"github.com/miekg/dns"
	"log"
	"sync"
	"time"
)

var count = 50000

func main() {
	simple("127.0.0.1:8053")
	adg("127.0.0.1:8053")
	simple("127.0.0.1:53")
	adg("127.0.0.1:53")
}

func adg(address string) {
	start := time.Now().UnixMilli()
	ticks := make(chan bool, 100)

	go func() {
		for i := 0; i < count; i++ {
			ticks <- true
		}
		close(ticks)
	}()

	toUpstream, err := upstream.AddressToUpstream(address, nil)
	if err != nil {
		log.Fatalln(err)
	}
	wg := sync.WaitGroup{}
	wg.Add(32)

	msg := dns.Msg{}
	msg.SetQuestion(dns.Fqdn("test4x.com"), dns.TypeA)
	for i := 0; i < 32; i++ {
		go func() {
			for range ticks {
				r, err := toUpstream.Exchange(&msg)
				if err != nil {
					log.Println(err)
				}
				if r.Rcode != dns.RcodeSuccess {
					log.Println(r)
				}
			}
			wg.Done()
		}()
	}
	wg.Wait()
	log.Println(time.Now().UnixMilli() - start)
}

func simple(address string) {
	start := time.Now().UnixMilli()
	ticks := make(chan bool, 100)

	go func() {
		for i := 0; i < count; i++ {
			ticks <- true
		}
		close(ticks)
	}()

	wg := sync.WaitGroup{}
	wg.Add(32)

	client := dns.Client{
		Net: "udp",
	}
	msg := dns.Msg{}
	msg.SetQuestion(dns.Fqdn("test4x.com"), dns.TypeA)
	for i := 0; i < 32; i++ {
		go func() {
			for range ticks {
				r, _, err := client.Exchange(&msg, address)
				if err != nil {
					log.Println(err)
				}
				if r.Rcode != dns.RcodeSuccess {
					log.Println(r)
				}
			}
			wg.Done()
		}()
	}
	wg.Wait()
	log.Println(time.Now().UnixMilli() - start)
}

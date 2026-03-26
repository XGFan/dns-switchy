package main

import (
	"dns-switchy/config"
	"flag"
	"fmt"
	"github.com/fsnotify/fsnotify"
	"log"
	"net/http"
	_ "net/http/pprof"
	"sync"
)

func main() {
	file := flag.String("c", "config.yaml", "config location")
	ts := flag.Bool("x", false, "show timestamp in log")
	flag.Parse()
	if !*ts {
		log.SetFlags(0)
	}
	conf, err := ReadConfig(file)
	passOrFatal(err)
	configChan := make(chan *config.SwitchyConfig, 1)
	configChan <- conf
	go func() {
		fmt.Println(http.ListenAndServe(":6060", nil))
	}()
	defer watchConfigFile(file, func(s *string) {
		newConfig, err := ReadConfig(file)
		if err != nil {
			log.Printf("Parse new config fail: %s", err)
			return
		}
		configChan <- newConfig
	})()
	var runningServer *DnsSwitchyServer
	for newConfig := range configChan {
		runningServer, err = reloadServer(runningServer, newConfig)
		if err != nil {
			if runningServer == nil {
				passOrFatal(err)
			}
			log.Printf("Create new server fail: %s", err)
			continue
		}
	}
}

func reloadServer(runningServer *DnsSwitchyServer, conf *config.SwitchyConfig) (*DnsSwitchyServer, error) {
	newServer, err := Create(conf)
	if err != nil {
		return runningServer, err
	}
	if runningServer != nil {
		runningServer.Shutdown()
	}
	newServer.Start()
	return newServer, nil
}

func watchConfigFile(file *string, action func(*string)) func() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Printf("Can not create watcher: %s", err)
		return func() {
		}
	}
	err = watcher.Add(*file)
	if err != nil {
		log.Printf("Can not watch file %s, Error: %s", *file, err)
		_ = watcher.Close()
		return func() {
		}
	}
	log.Printf("Watching %s", *file)
	stop := make(chan struct{})
	done := make(chan struct{})
	var closeOnce sync.Once
	go runConfigWatcher(file, watcher.Events, watcher.Errors, action, stop, done)
	return func() {
		closeOnce.Do(func() {
			close(stop)
			_ = watcher.Close()
			<-done
		})
	}
}

func runConfigWatcher(file *string, events <-chan fsnotify.Event, errs <-chan error, action func(*string), stop <-chan struct{}, done chan<- struct{}) {
	defer close(done)
	for {
		select {
		case <-stop:
			return
		case event, ok := <-events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Write == fsnotify.Write {
				log.Println("Event:", event)
				action(file)
			}
		case err, ok := <-errs:
			if !ok {
				return
			}
			if err != nil {
				log.Printf("Watch %s fail: %s", *file, err)
			}
		}
	}
}

func passOrFatal(e error) {
	if e != nil {
		log.Fatalln(e)
	}
}

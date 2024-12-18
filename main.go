package main

import (
	"flag"
	"fmt"
	"github.com/fsnotify/fsnotify"
	"log"
	"net/http"
	_ "net/http/pprof"
)

func main() {
	file := flag.String("c", "config.yaml", "config location")
	ts := flag.Bool("x", false, "show timestamp in log")
	flag.Parse()
	if !*ts {
		log.SetFlags(0)
	}
	config, err := ReadConfig(file)
	passOrFatal(err)
	server, err := Create(config)
	passOrFatal(err)
	serverChan := make(chan *DnsSwitchyServer, 1)
	serverChan <- server
	go func() {
		fmt.Println(http.ListenAndServe(":6060", nil))
	}()
	defer watchConfigFile(file, func(s *string) {
		newConfig, err := ReadConfig(file)
		if err != nil {
			log.Printf("Parse new config fail: %s", err)
			return
		}
		newServer, err := Create(newConfig)
		if err != nil {
			log.Printf("Create new server fail: %s", err)
			return
		}
		serverChan <- newServer
	})()
	var runningServer *DnsSwitchyServer
	for newServer := range serverChan {
		if runningServer != nil {
			runningServer.Shutdown()
		}
		runningServer = newServer
		runningServer.Start()
	}
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
		return func() {
		}
	}
	log.Printf("Watching %s", *file)
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if ok && event.Op&fsnotify.Write == fsnotify.Write {
					log.Println("Event:", event)
					action(file)
				}
			}
		}
	}()
	return func() {
		_ = watcher.Close()
	}
}

func passOrFatal(e error) {
	if e != nil {
		log.Fatalln(e)
	}
}

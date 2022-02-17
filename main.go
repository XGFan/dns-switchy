package main

import (
	"flag"
	"github.com/fsnotify/fsnotify"
	"log"
)

func main() {
	file := flag.String("c", "config.yaml", "config location")
	ts := flag.Bool("x", false, "show timestamp in log")
	flag.Parse()
	if !*ts {
		log.SetFlags(0)
	}
	var server DnsServer
	server.Init(file)
	defer watchConfigFile(file, server.Reload)()
	server.Run()
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
		watcher.Close()
	}
}

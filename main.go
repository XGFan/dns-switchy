package main

import (
	"context"
	"dns-switchy/config"
	"flag"
	"fmt"
	"github.com/fsnotify/fsnotify"
	"log"
	"net/http"
	_ "net/http/pprof"
	"path/filepath"
	"sync"
	"time"
)

func main() {
	rawFile := flag.String("c", "config.yaml", "config location")
	ts := flag.Bool("x", false, "show timestamp in log")
	flag.Parse()
	if !*ts {
		log.SetFlags(0)
	}
	// Resolve the config path to an absolute path so BasePath (set in ReadConfig
	// from the file's directory) and the directory watcher are correct even when
	// started with a relative -c.
	absPath, err := filepath.Abs(*rawFile)
	if err != nil {
		log.Fatalf("resolve config path %s: %s", *rawFile, err)
	}
	file := &absPath
	conf, err := ReadConfig(file)
	passOrFatal(err)
	configChan := make(chan *config.SwitchyConfig, 1)
	configChan <- conf
	go func() {
		fmt.Println(http.ListenAndServe(":6060", nil))
	}()

	// controller coordinates all config changes (web writes + external edits),
	// de-duplicating self-writes by content hash and routing resolvers-only
	// changes to the safe RCU swap. reloadFull pushes a full rebuild onto the
	// main loop (never runs on a handler/watcher stack).
	controller := NewConfigController(absPath, nil, func(c *config.SwitchyConfig) error {
		configChan <- c
		return nil
	})

	// The watcher fires controller.Reload() for any external change to the file;
	// our own writes are skipped by content hash inside Reload.
	defer watchConfigFile(file, func(*string) {
		if rerr := controller.Reload(); rerr != nil {
			log.Printf("config reload fail: %s", rerr)
		}
	})()

	retryCtx, cancelRetry := context.WithCancel(context.Background())
	defer cancelRetry()
	config.StartV2flyRetry(retryCtx, 30*time.Second, func() {
		log.Printf("v2fly retry succeeded; reloading config")
		newConfig, rerr := ReadConfig(file)
		if rerr != nil {
			log.Printf("Parse new config fail: %s", rerr)
			return
		}
		configChan <- newConfig
	})

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
		// Wire the controller <-> server both ways after each (re)build so web
		// writes and resolvers-only swaps target the live server.
		runningServer.configCtl = controller
		controller.SetServer(runningServer)
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
	// Watch the parent directory rather than the file: editors that save via
	// atomic rename (vim, sed -i) replace the inode, which drops a direct file
	// watch. Directory watching survives rename/create/remove, and we filter
	// events down to our config file's basename.
	dir := filepath.Dir(*file)
	if err = watcher.Add(dir); err != nil {
		log.Printf("Can not watch dir %s, Error: %s", dir, err)
		_ = watcher.Close()
		return func() {
		}
	}
	log.Printf("Watching %s (dir %s)", *file, dir)
	stop := make(chan struct{})
	done := make(chan struct{})
	var closeOnce sync.Once
	go runConfigWatcher(file, watcher, action, stop, done)
	return func() {
		closeOnce.Do(func() {
			close(stop)
			_ = watcher.Close()
			<-done
		})
	}
}

// configEventOps is the set of ops that signal a possible config content change
// for our file.
const configEventOps = fsnotify.Write | fsnotify.Create | fsnotify.Rename | fsnotify.Remove

func runConfigWatcher(file *string, watcher *fsnotify.Watcher, action func(*string), stop <-chan struct{}, done chan<- struct{}) {
	defer close(done)
	base := filepath.Base(*file)
	dir := filepath.Dir(*file)
	for {
		select {
		case <-stop:
			return
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if filepath.Base(event.Name) != base {
				continue
			}
			if event.Op&configEventOps == 0 {
				continue
			}
			log.Println("Event:", event)
			// On rename/create the file may be a new inode; nothing extra is
			// needed because we watch the directory, but re-Add the directory
			// defensively in case the watch was lost.
			if event.Op&(fsnotify.Rename|fsnotify.Create) != 0 {
				_ = watcher.Add(dir)
			}
			// A pure Remove (no immediate replacement) leaves no file to read;
			// the reload action will log a read error harmlessly.
			action(file)
		case err, ok := <-watcher.Errors:
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

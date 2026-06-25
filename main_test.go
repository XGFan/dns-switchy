package main

import (
	"dns-switchy/config"
	"net"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"
)

func waitForMainTest(t *testing.T, done <-chan struct{}, message string) {
	t.Helper()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal(message)
	}
}

func TestRunConfigWatcherStopsOnClosedChannels(t *testing.T) {
	tempDir := t.TempDir()
	file := filepath.Join(tempDir, "config.yaml")
	if err := os.WriteFile(file, []byte("ttl: 1s\n"), 0600); err != nil {
		t.Fatalf("write config file fail: %v", err)
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		t.Fatalf("create watcher fail: %v", err)
	}
	if err = watcher.Add(tempDir); err != nil {
		_ = watcher.Close()
		t.Fatalf("add dir watch fail: %v", err)
	}

	stop := make(chan struct{})
	done := make(chan struct{})

	go runConfigWatcher(&file, watcher, func(*string) {}, stop, done)

	// Closing the watcher closes its Events and Errors channels, which must make
	// runConfigWatcher return.
	if err = watcher.Close(); err != nil {
		t.Fatalf("close watcher fail: %v", err)
	}

	waitForMainTest(t, done, "config watcher did not exit on closed channels")
}

func TestWatchConfigFileCloseWaitsForWorkerExit(t *testing.T) {
	tempDir := t.TempDir()
	configFile := filepath.Join(tempDir, "config.yaml")
	if err := os.WriteFile(configFile, []byte("ttl: 1s\n"), 0600); err != nil {
		t.Fatalf("write config file fail: %v", err)
	}

	stopWatcher := watchConfigFile(&configFile, func(*string) {})
	for i := 0; i < 3; i++ {
		stopDone := make(chan struct{})
		go func() {
			stopWatcher()
			close(stopDone)
		}()

		waitForMainTest(t, stopDone, "watchConfigFile stop blocked")
	}
}

func TestReloadServerPreservesPreviousServerOnCreateFailure(t *testing.T) {
	oldAddr := reserveUDPAddr(t)

	runningServer, err := reloadServer(nil, &config.SwitchyConfig{Addr: oldAddr})
	if err != nil {
		t.Fatalf("initial reloadServer fail: %v", err)
	}
	t.Cleanup(func() {
		if runningServer != nil {
			runningServer.Shutdown()
		}
	})

	time.Sleep(50 * time.Millisecond)
	previousServer := runningServer

	runningServer, err = reloadServer(runningServer, &config.SwitchyConfig{
		Addr: reserveUDPAddr(t),
		Resolvers: []config.ResolverConfig{
			&config.ForwardConfig{Name: "broken-forward"},
		},
	})
	if err == nil {
		t.Fatal("reloadServer error = nil, want Create failure")
	}
	if !strings.Contains(err.Error(), "create resolver fail") {
		t.Fatalf("reloadServer error = %v, want create failure", err)
	}
	if runningServer != previousServer {
		t.Fatalf("returned server = %p, want previous server %p", runningServer, previousServer)
	}

	listener, listenErr := net.ListenPacket("udp", oldAddr)
	if listenErr == nil {
		_ = listener.Close()
		t.Fatalf("expected previous UDP listener to remain bound on %s after failed reload", oldAddr)
	}
}

package main

import (
	"os"
	"path/filepath"
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
	file := "config.yaml"
	tests := []struct {
		name  string
		close func(events chan fsnotify.Event, errs chan error)
	}{
		{
			name: "EventsChannelClosed",
			close: func(events chan fsnotify.Event, errs chan error) {
				close(events)
			},
		},
		{
			name: "ErrorsChannelClosed",
			close: func(events chan fsnotify.Event, errs chan error) {
				close(errs)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			events := make(chan fsnotify.Event)
			errs := make(chan error)
			stop := make(chan struct{})
			done := make(chan struct{})

			go runConfigWatcher(&file, events, errs, func(*string) {}, stop, done)
			tt.close(events, errs)

			waitForMainTest(t, done, "config watcher did not exit on closed channel")
		})
	}
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

package main

import (
	"dns-switchy/config"
	"dns-switchy/util"
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

func TestPruneBackups(t *testing.T) {
	dir := t.TempDir()
	cfg := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(cfg, []byte("live"), 0600); err != nil {
		t.Fatalf("write config: %v", err)
	}
	var names []string
	for i := 1; i <= 8; i++ {
		// 19-digit zero-padded counter keeps lexical order == chronological,
		// matching the real UnixNano backup naming.
		n := fmt.Sprintf("%s.%019d.bak", cfg, i)
		if err := os.WriteFile(n, []byte("bak"), 0600); err != nil {
			t.Fatalf("write backup: %v", err)
		}
		names = append(names, n)
	}
	pruneBackups(cfg, 5)
	left, err := filepath.Glob(cfg + ".*.bak")
	if err != nil {
		t.Fatal(err)
	}
	if len(left) != 5 {
		t.Fatalf("want 5 backups kept, got %d", len(left))
	}
	for _, n := range names[:3] { // 3 oldest pruned
		if _, err := os.Stat(n); !os.IsNotExist(err) {
			t.Errorf("expected oldest backup pruned: %s", n)
		}
	}
	for _, n := range names[3:] { // 5 newest kept
		if _, err := os.Stat(n); err != nil {
			t.Errorf("expected newest backup kept: %s (%v)", n, err)
		}
	}
}

func writeConfigFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(content), 0600); err != nil {
		t.Fatalf("write config: %v", err)
	}
}

func newReloaderServer(t *testing.T, content string) (*DnsSwitchyServer, *ConfigController, string, *int) {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	writeConfigFile(t, path, content)
	server := &DnsSwitchyServer{dnsCache: &util.NoCache{}}
	server.gen.Store(&resolverGen{})
	fullReloads := 0
	ctl := NewConfigController(path, server, func(*config.SwitchyConfig) error {
		fullReloads++
		return nil
	})
	server.configCtl = ctl
	return server, ctl, path, &fullReloads
}

const reloaderBase = `addr: "0.0.0.0:1153"
ttl: 5m
resolvers:
    - type: forward
      name: cn
      url: 114.114.114.114
      rule:
        - cn
`

func TestReloadSelfWriteIsNoOp(t *testing.T) {
	server, ctl, path, fullReloads := newReloaderServer(t, reloaderBase)
	genBefore := server.gen.Load()

	// Simulate our own write: file unchanged, appliedHash already matches it.
	if err := ctl.Reload(); err != nil {
		t.Fatalf("Reload no-op error: %v", err)
	}
	if *fullReloads != 0 {
		t.Fatalf("full reloads = %d, want 0 on self-write", *fullReloads)
	}
	if server.gen.Load() != genBefore {
		t.Fatal("resolver generation changed on self-write no-op")
	}
	_ = path
}

func TestReloadExternalResolversOnlyHotSwaps(t *testing.T) {
	server, ctl, path, fullReloads := newReloaderServer(t, reloaderBase)
	genBefore := server.gen.Load()

	// External edit: only resolvers changed (url + extra resolver), top-level same.
	writeConfigFile(t, path, `addr: "0.0.0.0:1153"
ttl: 5m
resolvers:
    - type: forward
      name: cn
      url: 223.5.5.5
      rule:
        - cn
    - type: mock
      queryType:
        - A
      rule:
        - mock.example
      answer: 1.2.3.4
`)
	if err := ctl.Reload(); err != nil {
		t.Fatalf("Reload resolvers-only error: %v", err)
	}
	if *fullReloads != 0 {
		t.Fatalf("full reloads = %d, want 0 for resolvers-only change", *fullReloads)
	}
	genAfter := server.gen.Load()
	if genAfter == genBefore {
		t.Fatal("resolver generation not swapped for resolvers-only external edit")
	}
	if len(genAfter.resolvers) != 2 {
		t.Fatalf("swapped generation has %d resolvers, want 2", len(genAfter.resolvers))
	}
}

func TestReloadExternalTopLevelTriggersFullReload(t *testing.T) {
	server, ctl, path, fullReloads := newReloaderServer(t, reloaderBase)
	genBefore := server.gen.Load()

	// External edit changes a top-level field (ttl).
	writeConfigFile(t, path, `addr: "0.0.0.0:1153"
ttl: 10m
resolvers:
    - type: forward
      name: cn
      url: 114.114.114.114
      rule:
        - cn
`)
	if err := ctl.Reload(); err != nil {
		t.Fatalf("Reload top-level error: %v", err)
	}
	if *fullReloads != 1 {
		t.Fatalf("full reloads = %d, want 1 for top-level change", *fullReloads)
	}
	// Full reload path does not swap the generation in place (main loop rebuilds
	// the server), so the generation pointer is unchanged here.
	if server.gen.Load() != genBefore {
		t.Fatal("top-level change should defer to full reload, not in-place swap")
	}
}

func TestSaveCreatesTimestampedBackupAndAtomicWrite(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	writeConfigFile(t, path, "ttl: 5m\n")
	ctl := NewConfigController(path, nil, nil)

	if err := ctl.Save([]byte("ttl: 10m\n")); err != nil {
		t.Fatalf("Save: %v", err)
	}
	got, _ := os.ReadFile(path)
	if string(got) != "ttl: 10m\n" {
		t.Fatalf("config after Save = %q, want updated content", got)
	}
	backups, _ := filepath.Glob(path + ".*.bak")
	if len(backups) != 1 {
		t.Fatalf("backup count = %d, want 1", len(backups))
	}
	bak, _ := os.ReadFile(backups[0])
	if string(bak) != "ttl: 5m\n" {
		t.Fatalf("backup content = %q, want original", bak)
	}

	// A second save must create a second backup, not overwrite the first.
	if err := ctl.Save([]byte("ttl: 20m\n")); err != nil {
		t.Fatalf("second Save: %v", err)
	}
	backups, _ = filepath.Glob(path + ".*.bak")
	if len(backups) != 2 {
		t.Fatalf("backup count after second save = %d, want 2", len(backups))
	}
}

func TestTopLevelOnlyIgnoresResolvers(t *testing.T) {
	a := []byte("addr: \":53\"\nttl: 5m\nresolvers:\n  - {type: forward, name: a, url: 1.1.1.1}\n")
	b := []byte("addr: \":53\"\nttl: 5m\nresolvers:\n  - {type: forward, name: b, url: 2.2.2.2}\n  - {type: mock, rule: [x], answer: 1.2.3.4}\n")
	c := []byte("addr: \":53\"\nttl: 9m\nresolvers:\n  - {type: forward, name: a, url: 1.1.1.1}\n")

	ta, err := topLevelOnly(a)
	if err != nil {
		t.Fatalf("topLevelOnly(a): %v", err)
	}
	tb, _ := topLevelOnly(b)
	tc, _ := topLevelOnly(c)
	if string(ta) != string(tb) {
		t.Fatalf("top-level differs when only resolvers changed:\n%s\nvs\n%s", ta, tb)
	}
	if string(ta) == string(tc) {
		t.Fatal("top-level should differ when ttl changed")
	}
}

package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"dns-switchy/config"

	"gopkg.in/yaml.v3"
)

// ConfigController is the single coordinator for config changes. It owns the
// on-disk config file (atomic write + timestamped backups) and tracks the
// content hash of the last config it applied so that fsnotify events caused by
// our own writes are deterministically de-duplicated (no timing window).
//
// Both the web write path and the external-watcher reload path funnel through
// here so that "swap only resolvers" stays on the safe RCU path and the
// listeners are never torn down by a self-write.
type ConfigController struct {
	path string

	mu          sync.Mutex
	appliedHash string
	// appliedTopLevel is the canonical top-level (resolvers blanked) of the
	// applied config, used to diff against external edits without re-reading the
	// now-changed file. Lazily filled on first successful apply/diff.
	appliedTopLevel []byte
	// server is the currently running server whose resolver chain is swapped on
	// resolvers-only changes. It is replaced on every full rebuild, so access is
	// guarded by mu.
	server *DnsSwitchyServer

	// reloadFull rebuilds the whole server (used when a top-level field
	// changed). Set by main; nil in unit tests that only exercise SwapResolvers.
	reloadFull func(*config.SwitchyConfig) error
}

// NewConfigController constructs a controller for the given absolute config path
// and seeds appliedHash from the current on-disk bytes (after a round-trip
// through MarshalDoc so the hash matches what subsequent writes produce).
func NewConfigController(path string, server *DnsSwitchyServer, reloadFull func(*config.SwitchyConfig) error) *ConfigController {
	c := &ConfigController{path: path, server: server, reloadFull: reloadFull}
	if b, err := c.Load(); err == nil {
		c.appliedHash = config.ConfigVersion(b)
		if top, terr := topLevelOnly(b); terr == nil {
			c.appliedTopLevel = top
		}
	}
	return c
}

// SetServer points the controller at the current running server. Called after
// each full rebuild so resolvers-only swaps target the live server.
func (c *ConfigController) SetServer(server *DnsSwitchyServer) {
	c.mu.Lock()
	c.server = server
	c.mu.Unlock()
}

func (c *ConfigController) currentServer() *DnsSwitchyServer {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.server
}

// Load reads the raw config bytes from disk.
func (c *ConfigController) Load() ([]byte, error) {
	return os.ReadFile(c.path)
}

// Save writes b to the config file atomically (temp file in the same directory
// + rename) after first creating a timestamped backup of the existing file.
// Each backup uses a fresh timestamp so prior backups are never overwritten.
func (c *ConfigController) Save(b []byte) error {
	dir := filepath.Dir(c.path)
	// Timestamped backup of the current file (best effort: a brand-new config
	// with no existing file just skips the backup).
	if existing, err := os.ReadFile(c.path); err == nil {
		backup := fmt.Sprintf("%s.%d.bak", c.path, time.Now().UnixNano())
		if werr := os.WriteFile(backup, existing, 0644); werr != nil {
			return fmt.Errorf("write backup %s: %w", backup, werr)
		}
	}
	tmp, err := os.CreateTemp(dir, ".dns-switchy-config-*.tmp")
	if err != nil {
		return fmt.Errorf("create temp config: %w", err)
	}
	tmpName := tmp.Name()
	if _, err = tmp.Write(b); err != nil {
		_ = tmp.Close()
		_ = os.Remove(tmpName)
		return fmt.Errorf("write temp config: %w", err)
	}
	if err = tmp.Close(); err != nil {
		_ = os.Remove(tmpName)
		return fmt.Errorf("close temp config: %w", err)
	}
	if err = os.Rename(tmpName, c.path); err != nil {
		_ = os.Remove(tmpName)
		return fmt.Errorf("rename temp config: %w", err)
	}
	pruneBackups(c.path, maxConfigBackups)
	return nil
}

// maxConfigBackups bounds how many timestamped `.bak` files Save keeps. Backups
// live next to the config (a persistent partition on OpenWrt), so without a cap
// repeated edits would accumulate indefinitely on limited flash.
const maxConfigBackups = 5

// pruneBackups removes the oldest "<path>.<ns>.bak" files, keeping the newest
// `keep`. The nanosecond timestamps are fixed-width for the current era, so a
// lexical sort is chronological. Best effort: errors are ignored.
func pruneBackups(path string, keep int) {
	matches, err := filepath.Glob(path + ".*.bak")
	if err != nil || len(matches) <= keep {
		return
	}
	sort.Strings(matches)
	for _, old := range matches[:len(matches)-keep] {
		_ = os.Remove(old)
	}
}

// markAppliedBytes records the content hash and canonical top-level of the bytes
// we just applied, so the fsnotify path can recognise and skip our own write and
// later diff external edits against the applied top-level.
func (c *ConfigController) markAppliedBytes(applied []byte) {
	version := config.ConfigVersion(applied)
	top, terr := topLevelOnly(applied)
	c.mu.Lock()
	c.appliedHash = version
	if terr == nil {
		c.appliedTopLevel = top
	}
	c.mu.Unlock()
}

// markApplied records only the content hash (used by the web write path which
// already knows the version it wrote and the applied bytes).
func (c *ConfigController) markApplied(version string, applied []byte) {
	top, terr := topLevelOnly(applied)
	c.mu.Lock()
	c.appliedHash = version
	if terr == nil {
		c.appliedTopLevel = top
	}
	c.mu.Unlock()
}

// AppliedHash returns the hash of the config currently considered applied.
func (c *ConfigController) AppliedHash() string {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.appliedHash
}

// Reload is invoked by the file watcher when the config file changes on disk.
// It de-duplicates self-writes by content hash, then routes the change:
//   - resolvers-only change -> server.SwapResolvers (no listener teardown)
//   - top-level change       -> reloadFull (full rebuild)
//
// Returns nil (no-op) when the change is our own write or the content is
// unchanged.
func (c *ConfigController) Reload() error {
	b, err := c.Load()
	if err != nil {
		return fmt.Errorf("read config for reload: %w", err)
	}
	version := config.ConfigVersion(b)

	c.mu.Lock()
	if version == c.appliedHash {
		c.mu.Unlock()
		log.Printf("config reload: content unchanged (hash %s), skipping", version)
		return nil
	}
	c.mu.Unlock()

	newConf, err := config.ParseConfig(bytes.NewReader(b))
	if err != nil {
		return fmt.Errorf("parse reloaded config: %w", err)
	}

	srv := c.currentServer()

	// Decide whether only resolvers changed by comparing the marshalled
	// top-level (everything except the resolvers value). If the top-level is
	// identical we take the safe resolver-swap path; otherwise we fall back to
	// the existing full-rebuild path.
	topLevelChanged, derr := c.topLevelChanged(b, srv)
	if derr != nil {
		// On any diff uncertainty, fall back to the full rebuild path which is
		// always correct (it just also rebinds the listeners).
		log.Printf("config reload: diff failed (%v), using full reload", derr)
		topLevelChanged = true
	}

	if topLevelChanged || srv == nil {
		if c.reloadFull == nil {
			return fmt.Errorf("config reload: full reload requested but no reloadFull configured")
		}
		log.Printf("config reload: top-level changed, full rebuild")
		if err = c.reloadFull(newConf); err != nil {
			return err
		}
	} else {
		log.Printf("config reload: resolvers-only change, hot-swapping")
		if err = srv.SwapResolvers(newConf); err != nil {
			return err
		}
	}
	c.markAppliedBytes(b)
	return nil
}

// topLevelChanged reports whether the on-disk config differs from the applied
// config in any top-level field other than resolvers. It compares the canonical
// top-level of newBytes against the stored applied top-level captured at the
// last apply (re-reading the file would compare it against itself).
func (c *ConfigController) topLevelChanged(newBytes []byte, srv *DnsSwitchyServer) (bool, error) {
	if srv == nil {
		return true, nil
	}
	c.mu.Lock()
	applied := c.appliedTopLevel
	c.mu.Unlock()
	if applied == nil {
		return true, fmt.Errorf("no applied top-level snapshot")
	}
	newTop, err := topLevelOnly(newBytes)
	if err != nil {
		return true, err
	}
	return !bytes.Equal(newTop, applied), nil
}

// topLevelOnly returns a canonical representation of the config's top-level
// fields with the resolvers value replaced by an empty sequence, so two configs
// that differ only in resolvers compare equal.
func topLevelOnly(b []byte) ([]byte, error) {
	doc, err := config.LoadDoc(bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	empty := &yaml.Node{Kind: yaml.SequenceNode, Tag: "!!seq"}
	if err = config.ReplaceResolvers(doc, empty); err != nil {
		return nil, err
	}
	return config.MarshalDoc(doc)
}

// ---- JSON <-> yaml.Node conversion for the HTTP config API ----

// nodeToJSONValue converts a yaml.Node into a JSON-serializable Go value while
// keeping every scalar as its original text. This is what makes `ttl: 5m`,
// `v2fly:cn`, `600s`, and unknown keys survive: yaml scalars are emitted as
// strings, never coerced to numbers/bools. Mapping key order is preserved by
// using a yamlMap (ordered) which marshals to a JSON object in key order.
func nodeToJSONValue(node *yaml.Node) interface{} {
	if node == nil {
		return nil
	}
	switch node.Kind {
	case yaml.DocumentNode:
		if len(node.Content) == 0 {
			return nil
		}
		return nodeToJSONValue(node.Content[0])
	case yaml.MappingNode:
		m := newOrderedMap()
		for i := 0; i+1 < len(node.Content); i += 2 {
			key := node.Content[i].Value
			m.set(key, nodeToJSONValue(node.Content[i+1]))
		}
		return m
	case yaml.SequenceNode:
		arr := make([]interface{}, 0, len(node.Content))
		for _, child := range node.Content {
			arr = append(arr, nodeToJSONValue(child))
		}
		return arr
	case yaml.ScalarNode:
		return scalarToJSONValue(node)
	case yaml.AliasNode:
		return nodeToJSONValue(node.Alias)
	default:
		return node.Value
	}
}

// scalarToJSONValue maps a yaml scalar to a JSON value using its yaml-resolved
// tag. Genuine bools/ints/floats are emitted as their JSON types so they
// round-trip back into typed config fields (e.g. break-on-fail: true). Strings
// stay strings, which is exactly what keeps `ttl: 5m`, `600s`, `10m`, and IPs
// from being re-typed (yaml resolves those as !!str, not numbers).
func scalarToJSONValue(node *yaml.Node) interface{} {
	switch node.Tag {
	case "!!null":
		return nil
	case "!!bool":
		return strings.EqualFold(node.Value, "true") || node.Value == "on" || node.Value == "yes"
	case "!!int":
		if i, err := strconv.ParseInt(node.Value, 0, 64); err == nil {
			return i
		}
		return node.Value
	case "!!float":
		if f, err := strconv.ParseFloat(node.Value, 64); err == nil {
			return f
		}
		return node.Value
	}
	// An unquoted scalar starting with `!` (e.g. `!login.example`) is parsed by
	// yaml as a *custom tag* with an empty value. Reconstruct the original
	// blacklist text so it survives the round-trip instead of becoming "".
	if node.Value == "" && strings.HasPrefix(node.Tag, "!") && !strings.HasPrefix(node.Tag, "!!") {
		return node.Tag
	}
	return node.Value
}

// jsonValueToNode converts a decoded JSON value (from the request body) back
// into a yaml.Node. Strings are emitted as quoted-when-needed scalars so values
// like "600s", "5m", "v2fly:cn", and "" round-trip as strings rather than being
// reinterpreted as numbers/durations. Numbers/bools/null map to their yaml
// scalar forms. Order is preserved for orderedMap inputs.
func jsonValueToNode(v interface{}) *yaml.Node {
	switch t := v.(type) {
	case nil:
		return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!null", Value: "null"}
	case *orderedMap:
		node := &yaml.Node{Kind: yaml.MappingNode, Tag: "!!map"}
		for _, k := range t.keys {
			keyNode := &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!str", Value: k}
			node.Content = append(node.Content, keyNode, jsonValueToNode(t.values[k]))
		}
		return node
	case map[string]interface{}:
		node := &yaml.Node{Kind: yaml.MappingNode, Tag: "!!map"}
		for k, val := range t {
			keyNode := &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!str", Value: k}
			node.Content = append(node.Content, keyNode, jsonValueToNode(val))
		}
		return node
	case []interface{}:
		node := &yaml.Node{Kind: yaml.SequenceNode, Tag: "!!seq"}
		for _, item := range t {
			node.Content = append(node.Content, jsonValueToNode(item))
		}
		return node
	case string:
		n := &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!str", Value: t}
		// Force quoting when an unquoted scalar would be parsed as a non-string
		// (e.g. "600", "true", "5m" is fine unquoted but keep it explicit for
		// values that look numeric/boolean/empty).
		if needsQuoting(t) {
			n.Style = yaml.DoubleQuotedStyle
		}
		return n
	case bool:
		val := "false"
		if t {
			val = "true"
		}
		return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!bool", Value: val}
	case float64:
		if t == float64(int64(t)) {
			return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!int", Value: strconv.FormatInt(int64(t), 10)}
		}
		return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!float", Value: trimFloat(t)}
	case int64:
		return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!int", Value: strconv.FormatInt(t, 10)}
	case int:
		return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!int", Value: strconv.Itoa(t)}
	default:
		return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!str", Value: fmt.Sprintf("%v", t)}
	}
}

// needsQuoting reports whether a string scalar must be double-quoted to survive
// a yaml round-trip as a string (i.e. an unquoted form would parse as a number,
// bool, null, or be empty).
func needsQuoting(s string) bool {
	if s == "" {
		return true
	}
	switch s {
	case "true", "false", "yes", "no", "on", "off", "null", "~",
		"True", "False", "Yes", "No", "On", "Off", "Null", "NULL", "TRUE", "FALSE":
		return true
	}
	// A string that parses cleanly as an int or float would be re-typed by yaml
	// if left unquoted (e.g. "600", "1.5"). Note "600s"/"5m" do NOT parse as
	// numbers, so they stay unquoted and remain strings — which is correct.
	if _, err := strconv.ParseInt(s, 10, 64); err == nil {
		return true
	}
	if _, err := strconv.ParseFloat(s, 64); err == nil {
		return true
	}
	return false
}

func trimFloat(f float64) string {
	if f == float64(int64(f)) {
		return strconv.FormatInt(int64(f), 10)
	}
	return strconv.FormatFloat(f, 'g', -1, 64)
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DNS-Switchy is a rule-based DNS proxy server written in Go. It routes DNS queries to different upstream resolvers based on domain matching rules. Supports UDP DNS, DoH, DoT, DNSCrypt, with built-in caching, hot-reload, and an embedded web portal.

## Build and Test Commands

```bash
go build -o dns-switchy        # Build binary
./dns-switchy -c config.yaml   # Run with config (-x for timestamps in logs)
go test ./...                  # Run all tests
go test ./config               # Run tests in one package
go test -run TestName ./...    # Run a single test by name
go fmt ./...                   # Format all Go files
go vet ./...                   # Lint
```

CI targets `linux/arm64` with `CGO_ENABLED=0` (see `.drone.yml`). The web frontend is pre-built and embedded via `//go:embed all:web/dist` in `server.go`.

## Architecture

### Request Flow

`main.go` boots the server, watches the config file for changes (fsnotify), and hot-reloads by creating a new `DnsSwitchyServer` and shutting down the old one.

`DnsSwitchyServer` (in `server.go`) listens on UDP (always) and HTTP (optional). Incoming DNS queries go through:

1. `checkAndUnify` - validates and normalizes the question
2. Global cache lookup (`util.Cache`)
3. Resolver chain - iterates `[]resolver.DnsResolver` in order; first resolver whose `Accept()` returns true handles the query

### Resolver Types (resolver package)

All resolvers implement `DnsResolver` interface (`dns.go`): `Accept`, `Resolve`, `Close`, `TTL`.

| Type | File | Purpose |
|------|------|---------|
| `forward` | `forward.go` | Forwards to upstream DNS servers (UDP/DoH/DoT/DNSCrypt). Supports multiple upstreams with concurrent race (first success wins). Has health tracking (`ForwardStat`) that marks upstreams dead after 5 consecutive failures. |
| `filter` | `filter.go` | Drops matching queries (returns empty `Mock` with no answer). Used for ad-blocking. |
| `file` | `file.go` | Resolves from local files (hosts format or dnsmasq lease format). Periodically refreshes from disk. |
| `mock` | `mock.go` | Returns a fixed IP for matching queries. Supports domain + query type matching. |
| `preloader` | `preloader.go` | Wraps a `Forward` with its own cache and proactively re-resolves entries before TTL expiry. |

### Config (config package)

YAML config is parsed in two stages: raw `_SwitchyConfig` struct, then converted to typed `ResolverConfig` interfaces. Rules are expanded at parse time via `parseRule()` which handles:
- `include:<path-or-url>` - recursive file/HTTP include with cycle detection
- `v2fly:<listname>` - downloads from v2fly/domain-list-community with file-based caching (`~/.dns-switchy/cache/`, 24h TTL)

### Domain Matching (util package)

`ComplexDomainSet` in `util/matcher.go` supports: suffix match (hierarchical `DomainSet` tree), `full:` exact match, `keyword:` substring, `regexp:` regex, and `!` prefix for blacklisting. Priority: blacklist > suffix > full > keyword > regexp. Empty whitelist means accept-all (except blacklisted).

`Cache` in `util/cache.go` wraps `go-utils.TTlCache`. TTL of 0 disables caching.

### HTTP / Web Portal

When `http` is set in config, `server.go` serves an API endpoint (`/api/query`) and an embedded SPA from `web/dist/`. The SPA allows browser-based DNS lookups that bypass the cache.

## Key Patterns

- Resolver order in config is the matching priority - first match wins
- `BreakError` sentinel in `forward.go` stops the resolver chain immediately on failure (when `break-on-fail: true`)
- `ResultWriter` interface abstracts DNS UDP vs HTTP API response writing (`DnsWriter` / `HttpWriter`)
- pprof is always available on `:6060`

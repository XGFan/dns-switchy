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

When `http` is set in config, `server.go` serves the API (`/api/query`, `/api/config[/validate]`) plus the portal embedded from `web/dist/`. Portal queries bypass the cache.

The portal source lives in `web/portal/` (Preact + Vite) and builds a **single self-contained ES module** `web/dist/panel.js` registering two custom elements — `<dns-card>` (summary) and `<dns-panel>` (full management) — per the shared 面板契约 (`net-console/docs/panel-contract.md`). Shadow DOM, `api-base` attribute. `web/dist/` is a **committed build artifact** (CI only runs `go build`, no node); rebuild with `cd web/portal && npm run build` after touching the frontend.

CSS goes through `src/panel-bundle.css`, which uses **cascade layers** (`@layer pico, joy`) to put Pico.css v2 below the vendored `tokens.css` + `panel.css`. This is load-bearing, not stylistic: Pico defines its colours on `:host(:not([data-theme=dark]))` (specificity 0,2,0), so tokens' bare `:host` mapping loses on specificity no matter the import order, and overriding on the `.pico` container does not reach Pico's derived variables (`--pico-primary-border`, `--pico-switch-checked-background-color`, …) because those substitute `var(--pico-primary*)` at `:host` level. Layer order beats specificity and carries the whole derived chain. When verifying, probe a **bare** Pico control (`<button>` with no class) — elements that reference `var(--joy-*)` directly (e.g. `.badge`) look correct even when the override is broken.

### API auth

`api_key` in config (empty by default) gates every `/api/*` route via the `X-Api-Key` header (`auth.go`). Static assets and `/panel.js` stay open. The key is snapshotted into `DnsSwitchyServer.apiKey` at `Create()` — safe because a changed `api_key` is a top-level change that triggers a full server rebuild, while `POST /api/config` only swaps resolvers. When auth is on, it replaces the Origin/Referer same-origin check in `guardWrite`. A whitespace-only `api_key` is rejected at parse time rather than silently disabling auth.

### Config write concurrency

`POST /api/config` holds `ConfigController.writeMu` across the whole load → version-check → validate → save → swap sequence. The optimistic version token alone is not enough: validation dials upstreams, so the window between reading the version and writing is wide, and two same-version writers would both pass the check and the later one would silently clobber the earlier. `writeMu` is deliberately separate from `mu` (which guards the small applied-state fields) so a slow validation does not block `SetServer`/`AppliedHash`.

## Key Patterns

- Resolver order in config is the matching priority - first match wins
- `BreakError` sentinel in `forward.go` stops the resolver chain immediately on failure (when `break-on-fail: true`)
- `ResultWriter` interface abstracts DNS UDP vs HTTP API response writing (`DnsWriter` / `HttpWriter`)
- pprof is always available on `:6060`

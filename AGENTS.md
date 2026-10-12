# AGENTS.md

DNS-Switchy is a rule-based DNS proxy written in Go (version per `go.mod`). It routes queries to different upstream resolvers by domain rules; supports UDP DNS, DoH, DoT, DNSCrypt, with caching, hot reload and an embedded web portal. See `README.md` / `USAGE.md` for config shape, `CONTEXT.md` for domain terms, `docs/adr/` for decisions.

## Build, run, test

```bash
go build -o dns-switchy        # build binary
./dns-switchy -c config.yaml   # run (-x adds timestamps to logs)
go fmt ./...
go vet ./...
go test ./...                  # CI runs: go vet ./... && go test -timeout 3m ./...
go test -run TestParseHttpAddr ./config   # single test

# OpenWrt ipk (service + luci-app); CI uses --arch x86_64 --upx
bash scripts/build-openwrt-ipk.sh --version v1.0.0 --arch x86_64 [--upx] [--package dns-switchy]

# web portal (web/portal/)
cd web/portal && npm run build   # writes web/dist/, then verifies panel.js is self-contained
npm test                         # vitest
npm run test:e2e                 # playwright
```

## CI / deploy

- Woodpecker (`.woodpecker.yaml`, push to `master`): vet + test → build x86_64 ipk with UPX → scp the **service ipk only** plus `deploy/openwrt/ci-deploy.sh` to the router and run it → bark notify. luci-app is still built to keep it from rotting but is not installed (net-console ADR-0005).
- `ci-deploy.sh` installs, checks the service and API (with key), runs a real `nslookup`, and only then saves the ipk as lastgood (`/mnt/ext/ipk-lastgood`); any failure reinstalls lastgood. dns-switchy is the whole LAN's DNS, so keep these checks.
- GitHub Actions (`.github/workflows/release.yml`) only runs on `v*` tags: cross-compiles 64-bit binaries (go-utils overflows 32-bit int) and publishes a GitHub Release.

## Architecture

### Request flow

`main.go` watches the config file's **directory** (fsnotify; survives atomic-rename saves) and starts pprof on `:6060`. Config changes funnel through `ConfigController` (`reloader.go`): self-writes are de-duplicated by content hash; resolvers-only changes are swapped in place (RCU), top-level changes rebuild the whole `DnsSwitchyServer` (create new, shut down old).

`DnsSwitchyServer` (`server.go`) listens on UDP always and HTTP optionally. A query goes `checkAndUnify` → global cache (`util.Cache`, TTL 0 disables) → resolver chain: first resolver whose `Accept()` returns true handles it. Resolver order in config is match priority.

- `BreakError` (`resolver/forward.go`) stops the chain immediately on failure (`break-on-fail: true`); the mdns resolver always returns it on runtime socket failure so `.local` never falls through to public upstreams.
- `ResultWriter` abstracts UDP vs HTTP API responses (`DnsWriter` / `HttpWriter`).
- Resolvers with `nftset` configured write resolved A records into an nftables set after a cache-miss resolve (`nftset/`, IPv4 only).

### Resolver types (`resolver/`, interface `DnsResolver` in `dns.go`)

| Type | Purpose |
|------|---------|
| `forward` / `forward-group` | Upstream DNS (UDP/DoH/DoT/DNSCrypt). Multiple upstreams race concurrently, first success wins. `ForwardStat` marks an upstream dead after 5 consecutive failures, alive again after 5 probe successes. |
| `filter` | Drops matching queries (empty answer); ad-blocking. |
| `file` | Hosts or dnsmasq lease file, refreshed from disk periodically. |
| `mock` | Fixed IP for matching domain + query type. |
| `preloader` | Wraps a forward with its own cache and re-resolves before TTL expiry. |
| `mdns` | Bridges `.local` hostname queries to mDNS (querier-only, binds 5353; see ADR-0001). Must precede any accept-all resolver in the chain. |

### Config and rules (`config/`)

YAML is parsed into raw `_SwitchyConfig`, then converted to typed `ResolverConfig`. `parseRule()` expands rules at parse time:

- `include:<path-or-url>` — recursive file/HTTP include with cycle detection.
- `v2fly:<listname>` — v2fly/domain-list-community list: `domain:` becomes suffix match, `full:`/`keyword:`/`regexp:` pass through, `@attr` tags stripped, other prefixes skipped.

v2fly never downloads during parse: `fetchV2flyList()` serves fresh or stale cache (24h TTL by mtime) or, with no cache, a sentinel `full:__v2fly_pending__.invalid` that keeps the resolver from collapsing to accept-all. `StartV2flyRetry` (30s loop) downloads pending lists and triggers a config reload. Cache dir: `$DNS_SWITCHY_CACHE_DIR` → `$HOME/.dns-switchy/cache` (skipped when HOME is `/`, as under OpenWrt procd) → `$TMPDIR/dns-switchy/cache`.

### Domain matching (`util/matcher.go`)

`ComplexDomainSet` supports bare-domain suffix match (`DomainSet` tree), `full:`, `keyword:`, `regexp:`, and `!` blacklist on any of them. Priority: blacklist → suffix → full → keyword → regexp. With only blacklist entries, everything else matches.

### HTTP API and auth

With `http` set, `server.go` serves `/api/query`, `/api/config`, `/api/config/validate` and the embedded portal (`//go:embed all:web/dist`). Portal queries bypass the cache.

- `api_key` (empty by default) gates every `/api/*` route via `X-Api-Key` (`auth.go`); static assets and `/panel.js` stay open. When auth is on it replaces the Origin/Referer same-origin check in `guardWrite`. A whitespace-only `api_key` fails parsing instead of silently disabling auth.
- The key is snapshotted into `DnsSwitchyServer.apiKey` at `Create()`. Safe because changing `api_key` is a top-level change (full rebuild), while `POST /api/config` only swaps resolvers.
- `POST /api/config` holds `ConfigController.writeMu` across load → version check → validate → save → swap. The optimistic version token alone is not enough: validation dials upstreams, so two same-version writers would both pass and the later would clobber the earlier. `writeMu` is separate from `mu` so slow validation does not block `SetServer`/`AppliedHash`.

### Web portal (`web/portal/`, Preact + Vite)

- Builds a single self-contained ES module `web/dist/panel.js` registering `<dns-card>` and `<dns-panel>` per the shared panel contract (`net-console/docs/panel-contract.md`); Shadow DOM, `api-base` attribute.
- `web/dist/` is a **committed build artifact**: CI has no node, so rebuild and commit it after touching the frontend.
- CSS enters through `src/panel-bundle.css`, which uses cascade layers (`@layer pico, joy`) to put Pico.css v2 below the vendored `tokens.css` + `panel.css`. This is load-bearing: Pico defines colours on `:host(:not([data-theme=dark]))` (specificity 0,2,0), so tokens' bare `:host` mapping loses regardless of import order, and overriding on the `.pico` container does not reach Pico's derived variables (`--pico-primary-border`, `--pico-switch-checked-background-color`, …), which are substituted at `:host` level. When verifying, probe a **bare** Pico control (`<button>` with no class); elements using `var(--joy-*)` directly (e.g. `.badge`) look right even when the override is broken.

## Conventions

- Wrap errors with context: `fmt.Errorf("...: %w", err)`. Logging uses `log.Printf`; fatal startup failures use `log.Fatal*`.
- Config structs use YAML tags (`yaml:",inline"` where needed); parse into a raw struct first, then convert after validation.
- Tests live in the same package; prefer table-driven tests with `t.Run`. Config tests use `config/testdata/router.yaml`.

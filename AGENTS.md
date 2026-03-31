# AGENTS.md - DNS-Switchy agent guide

## Purpose

Use this file as the working guide for autonomous coding agents in DNS-Switchy.
Keep changes narrow, verify them, and prefer repo conventions over new patterns.

DNS-Switchy is a Go DNS proxy server with resolver chaining, domain rules,
and caching. Current repo targets Go 1.26.1, matching `go.mod` and CI.

## What to read first

- `README.md` for the user-facing config shape and resolver examples.
- `.drone.yml` for CI build settings and target platform.
- `go.mod` for the active Go version and dependency set.
- The package you are editing, plus its tests.

## Working rules

- Stay within the requested task. Do not widen scope.
- Prefer existing package patterns before adding new abstractions.
- If code changes, run formatting, vetting, and tests before finishing.

## Build, format, lint, test

```bash
go build
go build -o dns-switchy
go fmt ./...
go vet ./...
go test ./...
go test ./config
go test -run TestName ./...
go test -run TestParseHttpAddr ./config
go test -run TestConfig ./config
```

Notes:

- `go build` writes the default binary as `./dns-switchy`.
- `go test -run` filters by test name. Use the exact test name from the file.
- For subtests, keep the parent test name and inspect the `t.Run` cases.

## Single test examples

```bash
go test -run TestParseHttpAddr ./config
go test -run TestForward_Resolve ./resolver
```

Replace the test names with real names from the package you are touching.

## Code style, grounded in this repo

### Imports

- Group imports in this order, with blank lines between groups.
  1. Standard library
  2. Third-party packages
  3. Local `dns-switchy/*` packages
- Let `gofmt` keep the import block tidy.

### Formatting

- Use `gofmt` for all Go files.
- Keep line wrapping and alignment to the formatter, not manual spacing.
- Prefer simple expressions over dense one-liners.

### Naming

- Packages stay lowercase and single word, like `config`, `resolver`, `util`.
- Exported types and funcs use PascalCase.
- Unexported names use camelCase.
- Test names follow `TestName` or `TestType_Method`.

### Structs and composition

- Group related fields together.
- Put embedded interfaces and structs near the top of the struct.
- Use composition and embedding, not deep inheritance-like layers.
- Config structs should use YAML tags, including `yaml:",inline"` where needed.

### Interfaces

- Keep interfaces small and focused.
- Define them in the package that uses them.
- Match the repo pattern of narrow contracts like resolver and matcher helpers.

### Errors

- Wrap errors with context using `fmt.Errorf("...: %w", err)`.
- Keep error messages specific to the failing operation.
- Use sentinel errors only when a package truly needs them.

### Logging

- Use `log.Printf` for contextual logs.
- Use `log.Fatalln` for fatal startup failures.
- When structured output is needed, encode it through `log.Writer()`.
- Keep log text short and informative.

### Configuration parsing

- Follow the repo pattern of parsing into an internal raw struct first.
- Convert raw config into exported config types after validation.
- Use YAML tags rather than custom parsing unless the format needs it.

## Testing style

- Keep tests in the same package as the code they cover.
- Prefer table-driven tests for multiple cases.
- Use `t.Run` for each case.
- Keep assertions tight and local to the case.
- Name tests after behavior, not implementation details.

Example shape:

```go
func TestParseHttpAddr(t *testing.T) {
    tests := []struct {
        name    string
        args    string
        wantErr bool
    }{
        {name: "ip:port", args: "127.0.0.1:8888"},
        {name: "only port", args: ":8888"},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := ParseHttpAddr(tt.args)
            if (err != nil) != tt.wantErr {
                t.Fatalf("ParseHttpAddr() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

## Resolver and config patterns

- Resolver order matters. First matching resolver wins.
- Domain rules are hierarchical, so parent domains cover subdomains.
- Config can include external rule files with the `include:` style shown in
  `README.md`.
- Hot reload behavior lives in the server path, so watch changes there closely.

### Rule prefixes in config

Rules are expanded at config parse time by `parseRule()` in `config/config.go`.

- Bare domain (`qq.com`) — suffix match via `DomainSet` tree.
- `!` prefix — blacklist entry. Works with all match types.
- `include:<path-or-url>` — load external rule file, recursive with cycle
  detection.
- `v2fly:<listname>` — download from v2fly/domain-list-community, parse
  `domain:` as suffix match, pass through `full:`, `keyword:`, `regexp:`
  with prefix preserved, skip `include:` and unknown prefixes.

### Domain matcher types

`NewDomainMatcher()` in `util/matcher.go` builds a `ComplexDomainSet` from
the expanded rule list. It supports:

- Bare domains — suffix match via `DomainSet` (hierarchical tree).
- `full:<domain>` — exact match only, no subdomain matching.
- `keyword:<text>` — substring match against the query domain.
- `regexp:<pattern>` — Go `regexp` match against the query domain.
- `!` prefix — blacklist. Works with all of the above.

Match priority in `MatchDomain()`: blacklist → suffix tree → full → keyword
→ regexp. If only blacklist entries exist, everything not blacklisted matches.

### v2fly cache

`fetchV2flyList()` in `config/config.go` implements a file-based cache:

- Cache directory: `~/.dns-switchy/cache/`
- Cache file: `v2fly-<listname>.txt`
- TTL: 24 hours (based on file mtime)
- Stale cache used as fallback when download fails.
- Missing cache + download failure logs a warning and returns empty (never
  blocks startup).

## What to do before handoff

- Run `go fmt ./...` on any changed Go file.
- Run `go vet ./...` if code changed.
- Run the smallest relevant `go test` command first, then `go test ./...` if
  the change touches shared behavior.
- Keep the final diff limited to the requested files.

## Cursor and Copilot rules

This repo does not contain any of these files:

- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

Do not assume extra editor rules exist unless they are added later.

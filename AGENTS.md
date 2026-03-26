# AGENTS.md - DNS-Switchy Project Guidelines

## Project Overview

DNS-Switchy is a DNS proxy server written in Go. It routes DNS queries through configurable resolvers (forward, filter, file-based, mock) with domain-based rules and caching support.

**Tech Stack:** Go 1.24+, github.com/miekg/dns, github.com/AdguardTeam/dnsproxy

---

## Build & Test Commands

### Build
```bash
go build              # Build binary (outputs to ./dns-switchy)
go build -o <name>    # Build with custom name
```

### Test
```bash
go test ./...                      # Run all tests
go test -v ./...                   # Verbose output
go test ./config                   # Test specific package
go test -run TestName ./...        # Run specific test by name
go test -run Test_parse ./config   # Run specific test in package
```

### Lint & Format
```bash
go fmt ./...           # Format all code
go vet ./...           # Static analysis
```

### Run
```bash
./dns-switchy -c config.yaml     # Run with config file
./dns-switchy -c config.yaml -x  # Run with timestamps in logs
```

---

## Code Style Guidelines

### Imports
Group imports in this order with blank lines between:
1. Standard library
2. External packages (third-party)
3. Local packages (dns-switchy/*)

```go
import (
    "context"
    "errors"
    "fmt"
    
    "github.com/miekg/dns"
    "gopkg.in/yaml.v3"
    
    "dns-switchy/config"
    "dns-switchy/util"
)
```

### Naming Conventions

- **Packages:** lowercase, single word (`config`, `resolver`, `util`)
- **Types:** PascalCase for exported, camelCase for unexported
- **Interfaces:** PascalCase, noun or verb (`DnsResolver`, `DomainMatcher`, `Cache`)
- **Constants:** PascalCase for exported, camelCase for unexported
- **Errors:** Use `var ErrName = errors.New("message")` for sentinel errors

```go
// Good
var BreakError = errors.New("stop on fail")

type DnsResolver interface { ... }
type ForwardConfig struct { ... }
```

### Struct Definitions

- Group related fields
- Embed interfaces/structs at the top
- Use yaml tags for config structs

```go
type Forward struct {
    Name string
    upstream.Upstream           // Embedded interface
    util.DomainMatcher          // Embedded interface
    ttl         time.Duration
    stat        ForwardStat
    breakOnFail bool
}

type ForwardConfig struct {
    Name        string        `yaml:"name,omitempty"`
    TTL         time.Duration `yaml:"ttl,omitempty"`
    BreakOnFail bool          `yaml:"break-on-fail,omitempty"`
}
```

### Error Handling

- Wrap errors with context using `fmt.Errorf`:
  ```go
  return nil, fmt.Errorf("create resolver fail: %w", err)
  ```
- Log errors with context using `log.Printf`:
  ```go
  log.Printf("Read %s fail: %s", target, err)
  ```
- Use `log.Fatalln(err)` for fatal startup errors
- Ignore errors explicitly with `_` when intentional:
  ```go
  defer open.Close()  // noinspection GoUnhandledErrorResult
  ```

### Interfaces

Define small, focused interfaces in the package that uses them:

```go
// resolver/dns.go
type DnsResolver interface {
    Close()
    Accept(msg *dns.Msg) bool
    Resolve(msg *dns.Msg) (*dns.Msg, error)
    TTL() time.Duration
}
```

### Testing

- Place tests in the same package (not `_test` suffix)
- Use table-driven tests for multiple cases:
```go
func TestParseHttpAddr(t *testing.T) {
    tests := []struct {
        name    string
        args    string
        wantErr bool
    }{
        {name: "ip:port", args: "127.0.0.1:8888", wantErr: false},
        {name: "only port", args: ":8888", wantErr: false},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := ParseHttpAddr(tt.args)
            if (err != nil) != tt.wantErr {
                t.Errorf("ParseHttpAddr() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

- Test naming: `Test_functionName` or `TestTypeName_MethodName`

### Logging

- Use `log.Printf` for structured logging with context
- JSON-encoded structured logs for query responses:
```go
_ = json.NewEncoder(log.Writer()).Encode(structureLog)
```
- Log format: `log.Printf("%s is dead, will skip", forward.String())`

### Configuration Parsing

- Use `gopkg.in/yaml.v3` for YAML parsing
- Define unexported `_Config` struct for raw parsing, then convert to exported type
- Use `yaml:",inline"` for embedded config fields:
```go
type PreloaderConfig struct {
    ForwardConfig `yaml:",inline"`
}
```

### Type-Safe Enum Pattern

```go
type ResolverType string

const (
    FILTER        ResolverType = "filter"
    FORWARD       ResolverType = "forward"
)

func (f ForwardConfig) Type() ResolverType {
    return FORWARD
}
```

---

## Project Structure

```
dns-switchy/
├── main.go           # Entry point, config watching
├── server.go         # DNS server implementation
├── config/           # Configuration parsing
│   ├── config.go
│   └── config_test.go
├── resolver/         # DNS resolver implementations
│   ├── init.go       # Resolver factory
│   ├── dns.go        # DnsResolver interface
│   ├── forward.go    # Upstream forwarding
│   ├── filter.go     # Query filtering
│   ├── file.go       # File-based resolution
│   └── mock.go       # Mock resolver for testing
├── util/             # Utilities
│   ├── cache.go      # TTL cache
│   └── matcher.go    # Domain/query type matchers
├── config.yaml       # Default configuration
└── go.mod
```

---

## Key Patterns

### Resolver Chain
Resolvers are checked in order. Each resolver's `Accept()` method determines if it handles the query. First match wins.

### Domain Matching
Domain rules use hierarchical matching: `qq.com` matches `www.qq.com` and `api.qq.com`.

### Rule Inclusion
Config supports `include:path/to/file.txt` for loading external rule files.

### Graceful Reload
Server watches config file for changes and hot-reloads without downtime.

---

## Notes

- Binary is built for linux/arm64 in CI (see `.drone.yml`)
- HTTP endpoint available for DNS-over-HTTP queries
- Pprof enabled on port 6060 for debugging

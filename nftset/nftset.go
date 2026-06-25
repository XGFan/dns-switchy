package nftset

import (
	"bytes"
	"context"
	"fmt"
	"net"
	"os/exec"
	"strings"
	"time"
)

// Writer 把 IP 写入 nftables 集合。
type Writer interface {
	// Add 把 ips 加入 family/table（默认 "inet fw4"）下名为 set 的 nft 集合，
	// 元素 timeout=ttl（<=0 不带 timeout）。错误返回给调用方（非致命）。
	Add(ctx context.Context, set string, ips []net.IP, ttl time.Duration) error
}

// runner 是对 exec 调用的抽象，便于单测注入。
type runner func(ctx context.Context, args []string) error

// execWriter 通过外部 nft 命令写入集合。
type execWriter struct {
	table string
	run   runner
}

// NewExecWriter 返回调用系统 nft 命令的 Writer。
// table 形如 "inet fw4"；空则默认 "inet fw4"。
func NewExecWriter(table string) Writer {
	if table == "" {
		table = "inet fw4"
	}
	return &execWriter{
		table: table,
		run:   execRun,
	}
}

// execRun 是默认的 runner，通过 exec.CommandContext 调用 nft。
func execRun(ctx context.Context, args []string) error {
	cmd := exec.CommandContext(ctx, "nft", args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg != "" {
			return fmt.Errorf("nft %s: %w; stderr: %s", strings.Join(args, " "), err, msg)
		}
		return fmt.Errorf("nft %s: %w", strings.Join(args, " "), err)
	}
	return nil
}

// buildElementSpec 把 ips 和 ttl 拼成 nft element 字符串，如 "{ 1.2.3.4 timeout 60s, 5.6.7.8 timeout 60s }"。
// ttl<=0 时不带 timeout 子句。
func buildElementSpec(ips []net.IP, ttl time.Duration) string {
	parts := make([]string, 0, len(ips))
	for _, ip := range ips {
		if ttl > 0 {
			secs := int64(ttl.Seconds())
			parts = append(parts, fmt.Sprintf("%s timeout %ds", ip.String(), secs))
		} else {
			parts = append(parts, ip.String())
		}
	}
	return "{ " + strings.Join(parts, ", ") + " }"
}

// Add 把 ips 写入 table 下的 set 集合。空 ips 直接返回 nil。
func (w *execWriter) Add(ctx context.Context, set string, ips []net.IP, ttl time.Duration) error {
	if len(ips) == 0 {
		return nil
	}

	// 约 3s 超时，不覆盖已取消的 ctx
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	spec := buildElementSpec(ips, ttl)
	// nft add element <table> <set> { ... }
	args := []string{"add", "element", w.table, set, spec}
	return w.run(ctx, args)
}

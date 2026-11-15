package nftset

import (
	"context"
	"net"
	"sync"
	"time"
)

// maxDedupWindow 是同一 (set, IP) 两次写入之间的最长间隔。
//
// 去重是为了不在每次解析时都 fork 一个 nft 进程（preloader 背后的 resolver 不进服务端缓存，
// 每次查询都会走到写集合）。窗口不能太长：防火墙重载会清空集合，窗口内被跳过的 IP 要等
// 窗口过去才补写回去，这段时间的流量会走错路由。
const maxDedupWindow = time.Minute

// NewDedupWriter 包装 w：同一 (set, IP) 在去重窗口 DedupWindow(ttl) 内只写一次。
// 跳过的前提是上次写入的集合条目能覆盖本次期望的时长（最多差一个窗口）：不同 nftset_ttl 的
// resolver 写同一集合时，短 timeout 的写入不会挡住长 timeout 的写入。写入失败不记录，下次照常重试。
//
// 代价：被跳过的那次解析，其应答仍按缓存 TTL 缓存，集合条目最多比它早一个窗口过期，
// 因此要求 nftset_ttl ≥ 缓存 TTL + DedupWindow(nftset_ttl)（配置加载时校验并告警）。
func NewDedupWriter(w Writer) Writer {
	return &dedupWriter{inner: w, seen: map[string]written{}, now: time.Now}
}

type written struct {
	at     time.Time
	expiry time.Time // 集合条目的过期时间；零值 = 不带 timeout 的永久条目
}

type dedupWriter struct {
	inner     Writer
	mu        sync.Mutex
	seen      map[string]written // set|ip -> 上次成功写入
	lastSweep time.Time
	now       func() time.Time
}

// DedupWindow 返回 NewDedupWriter 对给定 nftset_ttl 的去重窗口：min(ttl/2, 1 分钟)，ttl<=0 取 1 分钟。
func DedupWindow(ttl time.Duration) time.Duration {
	if ttl > 0 && ttl/2 < maxDedupWindow {
		return ttl / 2
	}
	return maxDedupWindow
}

func (d *dedupWriter) Add(ctx context.Context, set string, ips []net.IP, ttl time.Duration) error {
	now := d.now()
	d.mu.Lock()
	if now.Sub(d.lastSweep) > maxDedupWindow {
		for k, w := range d.seen {
			if now.Sub(w.at) >= maxDedupWindow {
				delete(d.seen, k)
			}
		}
		d.lastSweep = now
	}
	window := DedupWindow(ttl)
	fresh := make([]net.IP, 0, len(ips))
	for _, ip := range ips {
		if w, ok := d.seen[set+"|"+ip.String()]; ok && now.Sub(w.at) < window && covers(w, now, ttl, window) {
			continue
		}
		fresh = append(fresh, ip)
	}
	d.mu.Unlock()
	if len(fresh) == 0 {
		return nil
	}
	if err := d.inner.Add(ctx, set, fresh, ttl); err != nil {
		return err
	}
	w := written{at: now}
	if ttl > 0 {
		w.expiry = now.Add(ttl)
	}
	d.mu.Lock()
	for _, ip := range fresh {
		d.seen[set+"|"+ip.String()] = w
	}
	d.mu.Unlock()
	return nil
}

// covers 判断上次写入的条目能否顶替本次写入：永久条目总能顶替；否则它的过期时间
// 不能比本次写入会得到的过期时间早超过一个窗口。
func covers(w written, now time.Time, ttl, window time.Duration) bool {
	if w.expiry.IsZero() {
		return true
	}
	return ttl > 0 && !w.expiry.Before(now.Add(ttl-window))
}

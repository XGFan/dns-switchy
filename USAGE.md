# DNS-Switchy 配置参考

## 顶层配置

```yaml
addr: ":1053"            # 监听地址，UDP，必填
ttl: 5m                  # 全局缓存 TTL，可选
http: ":8080"            # HTTP API 地址，可选
nftset_table: "inet fw4" # nftset 写入的目标表/族，可选，默认 inet fw4
resolvers: []            # Resolver 列表，按顺序匹配
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `addr` | string | 是 | UDP 监听地址，格式 `:port` 或 `ip:port` |
| `ttl` | duration | 否 | 全局缓存时间，如 `5m`、`600s`。设为 `-1s` 禁用缓存 |
| `http` | string | 否 | HTTP API 地址。TCP 格式 `:8080`，Unix socket 格式 `unix:/path/to/sock` |
| `nftset_table` | string | 否 | nftset 写入的 nftables 表/族，默认 `inet fw4`。详见 [nftset 策略路由](#nftset-策略路由) |
| `resolvers` | list | 是 | Resolver 数组，按定义顺序依次匹配 |

## Resolver 链

请求按 resolver 列表顺序逐个匹配：

1. 检查 resolver 的 `rule` 和 `queryType`，不匹配则跳过
2. 匹配后交给该 resolver 处理
3. 处理成功则返回结果（写入缓存）
4. 处理失败：若不是最后一个 resolver，继续下一个；若是最后一个，返回失败
5. 所有 resolver 均不匹配 → 返回 REFUSED

`break-on-fail: true` 的 forward resolver 出错时会立即终止链，不再继续。

## Resolver 类型

### filter

过滤器，拦截匹配的请求并返回空响应（NOERROR，无应答记录）。

```yaml
- type: filter
  queryType:           # 按查询类型过滤，可选
    - TXT
  rule:                # 按域名过滤，可选
    - ad.google.com
```

`rule` 和 `queryType` 同时存在时为 AND 关系，必须都匹配才会拦截。

### forward

将请求转发到上游 DNS 服务器。

```yaml
- type: forward
  name: cn-dns              # 名称，用于日志和 HTTP API
  ttl: 600s                 # 该 resolver 的缓存时间，覆盖全局 ttl
  url: 114.114.114.114      # 上游地址
  config:
    timeout: 3s             # 上游超时
    serverIP:               # DoH/DoT 的 bootstrap IP（避免鸡生蛋问题）
      - 104.16.249.249
  rule:                     # 域名规则，不设则匹配所有
    - cn
    - v2fly:cn
  break-on-fail: false      # 出错时是否终止 resolver 链
```

上游地址格式：

| 格式 | 协议 | 示例 |
|------|------|------|
| `IP` 或 `IP:port` | UDP | `114.114.114.114`、`8.8.8.8:53` |
| `https://...` | DNS-over-HTTPS | `https://cloudflare-dns.com/dns-query` |
| `tls://...` | DNS-over-TLS | `tls://dns.google` |
| `sdns://...` | DNSCrypt | `sdns://...` |

多个上游并行查询，取最先返回的结果。每个上游有健康追踪：连续 5 次失败标记为不可用，连续 5 次成功恢复。

可选 `nftset` / `nftset_ttl` 字段把该 resolver 的 A 答案写进 nftables 集合，见 [nftset 策略路由](#nftset-策略路由)。

### forward-group

与 `forward` 相同，配置多组上游：

```yaml
- type: forward-group
  name: multi-dns
  upstreams:
    - url: 114.114.114.114
    - url: https://cloudflare-dns.com/dns-query
      config:
        timeout: 3s
        serverIP:
          - 104.16.249.249
  rule:
    - cn
```

### file

从本地文件解析域名。

#### hosts 文件

```yaml
- type: file
  fileType: host
  location: system          # "system" 使用系统 hosts 文件，或指定路径
  refreshInterval: 10m      # 定时重新加载
  extraContent: |           # 额外的内联 hosts 条目
    1.1.1.1 a.com b.com
    ::1 d.com
```

#### dnsmasq 租约文件

```yaml
- type: file
  fileType: lease
  location: /tmp/dhcp.leases
  refreshInterval: 10m
  extraConfig:
    domain: lan             # 租约条目的搜索域
```

file resolver 只做精确域名匹配（不做子域名匹配），仅响应 A 和 AAAA 查询。

同样支持 `nftset` / `nftset_ttl` 字段，把 host/lease 里的 A 记录写进集合，见 [nftset 策略路由](#nftset-策略路由)。

### mock

为匹配的请求返回固定 IP。

```yaml
- type: mock
  answer: "1.2.3.4"        # 固定应答 IP（支持 IPv4 和 IPv6）
  rule:
    - test.example.com
  queryType:
    - A
```

### preloader

在 forward 基础上增加预加载缓存，在缓存条目到期前自动刷新。

```yaml
- type: preloader
  name: preloaded-dns
  ttl: 300s
  url: 8.8.8.8
  rule:
    - example.com
```

preloader 维护独立缓存，不使用全局缓存。适合对延迟敏感的高频域名。

preloader 继承 forward 的全部配置，包括 `nftset` / `nftset_ttl`（见 [nftset 策略路由](#nftset-策略路由)）；由于预加载会按 `ttl` 周期重新解析，每个周期都会刷新集合条目 timeout。

### mdns

mDNS 桥接：把 DNS-only 客户端（容器、VM、无 avahi 的 Linux 等发不出组播的客户端）的 `.local` 主机名查询转成 LAN 上的 mDNS 查询，把设备当下自宣告的活答案带回。设计决策见 `docs/adr/0001`。

```yaml
- type: mdns
  interface: br-lan   # 必填：组播出入接口（配错是静默故障，建链与保存时都会校验接口存在）
  ttl: 1m             # 可选：命中 A 记录的正缓存（走全局缓存），默认 1m
  negative-ttl: 30s   # 可选：miss（窗口内无人应答）的负缓存，默认 30s
  timeout: 1s         # 可选：组播等待窗口，默认 1s；收到首个应答立即返回
  rule:
    - local           # 可选，缺省即 [local]
```

行为语义——`.local` 在此终局应答，四种结局都不会落到链条下游：

| 场景 | 应答 |
|------|------|
| 命中（设备应答） | A 记录（名字改写为客户端所问，清除 mDNS cache-flush class 位） |
| 名字存在性未知、问的不是 A（AAAA/HTTPS/…） | 立即空 NOERROR（NODATA），不发组播 |
| miss（窗口超时无人应答） | NXDOMAIN，并负缓存 `negative-ttl` |
| socket 故障 | SERVFAIL（终止链条，写死不可配） |

mDNS 侧是 **querier-only**：绑定 `:5353`、加入 `224.0.0.251` 组播组，从 5353 发标准查询、收组播应答；绝不宣告名字、绝不应答他人查询。窗口内会重发一次查询（约 400ms 处），抵御 Wi-Fi 组播丢包造成的假 miss。

**部署约束**：因为要绑定 5353，同机不能运行 avahi / umdns 等 mDNS 应答方；本 resolver 只应部署在无 mDNS 栈的机器上（典型：OpenWrt 路由器）。另外 macOS / iOS 等自带 mDNS 的客户端解析 `.local` 从不询问 DNS 服务器，本 resolver 服务不到它们，也不需要。

## 规则语法

规则用于 `forward`、`filter`、`mock` 类型的 resolver，决定哪些域名由该 resolver 处理。没有 `rule` 字段的 resolver 匹配所有域名。

### 域名匹配（默认）

直接写域名即为后缀匹配。`a.com` 匹配 `a.com` 及所有子域名。

```yaml
rule:
  - qq.com       # 匹配 qq.com 和 *.qq.com
  - cn           # 匹配所有 .cn 域名
```

### 黑名单

`!` 前缀表示排除。当规则列表中只有黑名单条目时，匹配所有非黑名单域名。

```yaml
rule:
  - cn
  - "!evil.cn"   # cn 域名都匹配，除了 evil.cn 及其子域名
```

### 高级匹配类型

| 前缀 | 匹配方式 | 示例 |
|------|----------|------|
| `full:` | 精确匹配，不含子域名 | `full:example.com` |
| `keyword:` | 域名中包含该子串 | `keyword:ads` |
| `regexp:` | Go 正则表达式 | `regexp:^cdn-\d+\.example\.com$` |

所有高级匹配类型都支持 `!` 前缀用于黑名单（如 `!keyword:ads`）。

匹配优先级：黑名单 → 后缀树 → full → keyword → regexp。

### include 外部文件

加载外部规则文件，每行一条规则。支持本地路径和 HTTP URL，支持递归引用（有循环检测）。

```yaml
rule:
  - include:extra-rules.txt
  - include:https://example.com/rules.txt
```

本地路径相对于配置文件所在目录。

### v2fly 域名列表

引用 [v2fly/domain-list-community](https://github.com/v2fly/domain-list-community) 的域名列表：

```yaml
rule:
  - v2fly:cn       # 中国大陆域名
  - v2fly:google   # Google 相关域名
```

- 自动从 GitHub 下载纯文本列表，下载发生在后台 goroutine
- 启动时仅读缓存，不发网络请求；缺失或过期会标记并由后台 30s ticker 重试，下载成功后触发热重载
- 缓存有效期 24 小时；过期仍可用，背景刷新成功后替换
- 缓存目录按优先级选择：`$DNS_SWITCHY_CACHE_DIR` → `$HOME/.dns-switchy/cache` → `$TMPDIR/dns-switchy/cache`（前者无法 mkdir 时自动 fallback）
- procd-spawned 服务（HOME=`/`）建议显式 `DNS_SWITCHY_CACHE_DIR=/etc/dns-switchy/cache` 等持久路径，避免缓存随 tmpfs 重启丢失
- 磁盘写入失败时下载内容暂存进程内存，下次 reload 仍能生效（read-only 文件系统场景）

列表中的 `domain:` 条目作为后缀匹配，`full:`、`keyword:`、`regexp:` 保留各自语义。`include:` 和未知前缀被忽略。

## 缓存

- 全局缓存：由顶层 `ttl` 控制，所有有应答的成功响应按 question 缓存
- Resolver 级缓存：forward 的 `ttl` 字段覆盖全局值。设为 `-1s` 可禁用该 resolver 的缓存
- preloader 缓存：独立于全局缓存，自动在过期前刷新

## nftset 策略路由

让某个 resolver 在「命中并解析出 A 记录」时，把结果 IP 写进一个 nftables 集合（带 timeout）。路由器侧可用该集合做策略路由（按域名把流量导向特定出口）——单一事实源是 resolver 的域名规则，目标 IP 自动跟随，无需手工维护 IP 列表。

在 `forward`、`forward-group`、`preloader`、`file` 类型的 resolver 上配置：

```yaml
- type: forward
  name: corp-dns
  ttl: 600s
  url: 192.168.168.21
  rule:
    - corp.example
  nftset: corp4             # A 答案写进的集合名
  nftset_ttl: 1h            # 集合元素 timeout，须 ≥ 该 resolver 的生效缓存 TTL
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `nftset` | string | 否 | 目标集合名（位于顶层 `nftset_table` 指定的表/族下）。不配则该 resolver 不写集合 |
| `nftset_ttl` | duration | 否 | 集合元素 timeout，如 `1h`。须 ≥ 该 resolver 的生效缓存 TTL（见下）。`<=0` 时写入不带 timeout |

要点：

- **只有配了 `nftset` 的 resolver 才写集合**；其它 resolver 行为完全不变。
- **本期仅 IPv4**：只收集应答里的 A 记录写入集合，AAAA 被忽略。
- **写入时机**：仅在 cache-miss（实际解析）时同步写入，写在返回客户端之前，保证客户端拿到 IP 去连接时集合已就绪。缓存命中不重复写集合——因此要求 `nftset_ttl ≥ 该 resolver 的生效缓存 TTL`（resolver 自身配了正 `ttl` 即用其值，否则回退到顶层 `ttl`）；否则缓存命中期内集合条目可能提前过期、漏标流量。配置加载时若 `nftset_ttl` 短于生效缓存 TTL 会打印告警（非致命）。
- **写入非致命**：集合不存在或 `nft` 报错只记日志，不影响返回给客户端的 DNS 答案。
- **集合定义归路由器**：dns-switchy 只往集合里 `add element`，不负责创建集合（`type ipv4_addr; flags timeout;`）、ip rule、路由表等 plumbing。
- 顶层 `nftset_table` 统一所有 nftset 写入的表/族，默认 `inet fw4`（OpenWrt fw4 的 inet 表）。

> 写入通过外部 `nft add element <table> <set> { <ip> timeout <ttl>s, ... }` 命令完成（同一查询的多个 IP 合并为一条调用），因此运行 dns-switchy 的进程需有调用 `nft` 的权限（OpenWrt 上以 root 运行）。

## 热重载

DNS-Switchy 通过 fsnotify 监听配置文件变化。修改并保存配置文件后，程序自动：

1. 解析新配置
2. 优雅关闭当前 DNS 服务器
3. 启动新服务器

整个过程无需手动重启。

## HTTP API 与 Web Portal

配置 `http` 字段后启用 HTTP 服务，同时提供 API 和 Web Portal：

```yaml
http: ":8080"              # TCP
http: "unix:/tmp/dns.sock" # Unix socket
```

### Web Portal

浏览器访问 `http://地址:端口/` 即可打开内置 Web 管理页面。

功能：输入域名和查询类型，显示处理该请求的 resolver 名称和最终解析结果。Web Portal 的查询**不走缓存**，直接遍历 resolver 链。

### API

请求格式：

```
GET /api/query?question=example.com&type=A
```

`type` 可选，默认 `A`。支持所有 DNS 记录类型（A、AAAA、CNAME、MX、TXT、NS、SOA、PTR、SRV、CAA 等）。

API 查询同样**不走缓存**。

响应格式（JSON）：

```json
{
  "resolver": "cn-dns",
  "answer": "1.2.3.4"
}
```

## 完整配置示例

```yaml
addr: ":1053"
ttl: 5m
nftset_table: "inet fw4"      # 可选，nftset 写入的目标表/族
resolvers:
  # 过滤 TXT 查询
  - type: filter
    queryType:
      - TXT

  # 过滤广告域名
  - type: filter
    rule:
      - ad.google.com

  # corp 域名 → corp DNS，并把解析到的 A 写进 corp4 集合（供路由器策略路由）
  - type: forward
    name: corp-dns
    ttl: 600s
    url: 192.168.168.21
    rule:
      - corp.example
    nftset: corp4             # 写进 inet fw4 的 corp4 集合
    nftset_ttl: 1h            # 元素 timeout，须 ≥ 上面的 ttl(600s)

  # 本地 hosts
  - type: file
    fileType: host
    location: system
    refreshInterval: 10m

  # DHCP 租约
  - type: file
    fileType: lease
    location: /tmp/dhcp.leases
    refreshInterval: 10m
    extraConfig:
      domain: lan

  # 国内域名走国内 DNS
  - type: forward
    name: cn-dns
    ttl: 600s
    url: 114.114.114.114
    rule:
      - cn
      - qq.com
      - baidu.com
      - v2fly:cn

  # 默认走 Cloudflare DoH
  - type: forward
    name: cf-dns
    url: https://cloudflare-dns.com/dns-query
    config:
      timeout: 3s
      serverIP:
        - 104.16.249.249

  # 兜底 DNS（不缓存）
  - type: forward
    name: final-dns
    ttl: -1s
    url: 114.114.114.114
```

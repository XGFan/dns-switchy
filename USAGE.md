# DNS-Switchy 配置参考

## 顶层配置

```yaml
addr: ":1053"          # 监听地址，UDP，必填
ttl: 5m                # 全局缓存 TTL，可选
http: ":8080"          # HTTP API 地址，可选
resolvers: []          # Resolver 列表，按顺序匹配
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `addr` | string | 是 | UDP 监听地址，格式 `:port` 或 `ip:port` |
| `ttl` | duration | 否 | 全局缓存时间，如 `5m`、`600s`。设为 `-1s` 禁用缓存 |
| `http` | string | 否 | HTTP API 地址。TCP 格式 `:8080`，Unix socket 格式 `unix:/path/to/sock` |
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

- 自动从 GitHub 下载纯文本列表
- 缓存到 `~/.dns-switchy/cache/`，有效期 24 小时
- 缓存过期后尝试更新，更新失败则继续使用旧缓存
- 首次下载失败不阻塞启动，记录警告日志并跳过

列表中的 `domain:` 条目作为后缀匹配，`full:`、`keyword:`、`regexp:` 保留各自语义。`include:` 和未知前缀被忽略。

## 缓存

- 全局缓存：由顶层 `ttl` 控制，所有有应答的成功响应按 question 缓存
- Resolver 级缓存：forward 的 `ttl` 字段覆盖全局值。设为 `-1s` 可禁用该 resolver 的缓存
- preloader 缓存：独立于全局缓存，自动在过期前刷新

## 热重载

DNS-Switchy 通过 fsnotify 监听配置文件变化。修改并保存配置文件后，程序自动：

1. 解析新配置
2. 优雅关闭当前 DNS 服务器
3. 启动新服务器

整个过程无需手动重启。

## HTTP API

配置 `http` 字段后启用 HTTP 查询接口：

```yaml
http: ":8080"              # TCP
http: "unix:/tmp/dns.sock" # Unix socket
```

请求格式：

```
GET /?question=example.com&type=A
```

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
resolvers:
  # 过滤 TXT 查询
  - type: filter
    queryType:
      - TXT

  # 过滤广告域名
  - type: filter
    rule:
      - ad.google.com

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

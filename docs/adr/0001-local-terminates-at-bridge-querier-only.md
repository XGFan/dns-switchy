# `.local` 查询在桥接处终局应答;mDNS 侧桥接为标准查询者(绑 5353,只问不答)

mdns resolver(mDNS 桥接)承接全部 `.local` 查询,做了两个绑定在一起的决定:

1. **对 DNS 客户端终局应答**:`.local` 的四种结局——命中(A)、类型不符(NODATA)、miss(NXDOMAIN)、桥接故障(SERVFAIL/BreakError)——全部在 mdns resolver 就地终结,永不落到链条下游。这是写死的行为,不做成配置项。否则按链条"出错落到下一个 resolver"的默认语义,`.local` 会漏进 accept-all 的 doh 兜底,把内网主机名发给公网 DoH 服务商。
2. **mDNS 侧只问不答**:绑定 :5353、加入 `224.0.0.251` 组播组,从 5353 发标准查询、收组播应答;绝不宣告名字、绝不应答他人查询、不参与应答方协议流程(probe/announce/goodbye)。占用 5353 是"问"被逼出来的收发姿势,不是应答方身份。

## Considered Options

- **legacy unicast 查询**(RFC 6762 §6.7:临时端口发查询、等单播回复,无需绑 5353,实现简单得多)——被实验否决:2026-07-17 于 rock5b 实测,avahi 对 legacy 查询 1ms 应答(TTL=10),而 macOS mDNSResponder 对 legacy 查询 4 连测全部沉默(`MacBook-Pro.local`/`mbp.local`);同一环境下改用"绑 5353 + 加组"的标准查询,双方均稳定应答。Mac 恰是首要解析目标,legacy 方案出局。
- **静态条目**(hosts/dnsmasq 登记 `.local` 名字)——否决:与 mDNS 自宣告形成第二真相源,设备改名/换 IP 时静默漂移;桥接只回活答案(见 CONTEXT.md)。

## Consequences

- 同机不能运行 avahi/umdns 等真应答方(5353 互斥),该 resolver 仅限无 mDNS 应答方的机器(路由器)启用。
- dnsmasq forward 规则中的 `local` 成为死配置,随本决策移除(保留 `lan`/`arpa`)。
- 逃生门:file resolver 位于链条更前,可用 hosts 条目静态覆盖个别 `.local` 名字,优先级压过桥接。

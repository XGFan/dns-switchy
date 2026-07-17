# DNS-Switchy

规则式 DNS 代理:按域名规则把查询路由到不同的上游 resolver,服务于家庭网络的分流、过滤与本地名字解析。

## Language

**Resolver 链 (resolver chain)**:
按配置顺序排列的一组 resolver,查询自上而下匹配,第一个 `Accept` 的 resolver 负责应答。顺序即优先级。

**mDNS 桥接 (mDNS bridge)**:
把 DNS-only 客户端发来的 `.local` 主机名查询转成 LAN 上的 mDNS 查询,把设备当下自宣告的活答案带回给查询方。只覆盖主机名正向 IPv4 解析(名字 → A 记录);`.local` 的其他查询类型由桥接就地终结(NODATA),不含反向解析(PTR)与服务发现(DNS-SD)。
在 mDNS 侧桥接是**标准查询者(querier-only)**:从 5353 端口发标准查询、收组播应答;绝不宣告名字、绝不应答他人查询、不参与任何应答方协议流程。
_Avoid_: mDNS 应答方/responder(桥接永远不是)
_Avoid_: mDNS 反射、mDNS 转发(reflector/repeater 指组播到组播的复制,是另一种东西)

**DNS-only 客户端**:
发不出/收不到 LAN 组播、只能向 unicast DNS 服务器求解析的客户端——容器、k8s pod、VM、跨网段节点、无 avahi 的 Linux。mDNS 桥接唯一的服务对象;能自己做 mDNS 的设备(Apple 设备、带 avahi 的主机)从不询问 DNS 服务器 `.local` 名字,不在服务范围内。

**活答案 (live answer)**:
来自设备当下 mDNS 自宣告的解析结果。与静态登记(hosts 条目、DHCP 租约名)相对;mDNS 桥接只回活答案,不维护第二份名单。

**Miss**:
mDNS 桥接在等待窗口内没有收到任何应答的查询结果,即判定"此名当前无人认领"。mDNS 协议没有否定应答,miss 只能靠超时判定,因此是桥接里最贵的路径;其结果按 `negative-ttl` 缓存。

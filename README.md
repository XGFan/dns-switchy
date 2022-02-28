## DNS-Switchy

### 配置

```yaml
port: 1053 #监听端口，目前只支持UDP
ttl: 5m #全局缓存时间
resolvers:
  - type: filter #过滤器，目前只能按类型过滤（即不返回结果，比如过滤掉AAAA
    block:
      - TXT
  - type: file #文件解析
    fileType: lease #dnsmasq租约文件
    location: /tmp/dhcp.leases
    refreshInterval: 10m #刷新时间
    extraConfig:
      domain: lan #dhcp的search domain
  - type: file #host文件
    fileType: host
    location: system #可以是路径，如果是system，就按照系统的hosts文件来读取
    refreshInterval: 10m
    extraContent: |
      #语法和host一致
      1.1.1.1 a.com b.com
      2.2.2.2 c.com
      ::1 d.com
  - name: cn-dns
    type: forward
    ttl: 600s #缓存时间
    url: 114.114.114.114 #udp可以省略端口
    rule: #规则都是按域来的，a.com就覆盖了1.a.com，当规则存在时，只用该resolver处理符合规则的请求
      - cn
      - qq.com
      - baidu.com
      - include:v2-rule.txt #支持读取额外的文件
  - name: cf-dns
    type: forward
    ttl: 600s
    url: https://cloudflare-dns.com/dns-query #doh
    config:
      timeout: 3s #超时时间
      serverIP:
        - 104.16.249.249 #可选的，方便bootstrap
  - name: final-dns
    type: forward
    ttl: 60s
    url: 114.114.114.114

```

#### 处理流程

就是挨个挨个处理

+ 有缓存，返回缓存
+ 如果当前resolver能处理，就处理
    + 处理成功，就返回
    + 处理（连接失败），那就下一个
+ 不能处理就下一个
+ 最终处理成功，放入缓存
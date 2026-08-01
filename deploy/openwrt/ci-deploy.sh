#!/bin/sh
# 在路由器上执行的部署脚本。由 CI scp 到 /tmp/dns-deploy/ 后运行。
#
# dns-switchy 是全屋 LAN DNS —— 它挂了表现是全网断解析,爆炸半径是四个组件里最大的,
# 所以这里的验证与回滚不能省:装 → 服务在跑 → 带 key 探 API → 真解析一个域名 →
# 全过才把本次 ipk 存为回滚目标;任何一步失败自动装回上一个验证通过的版本。
#
# 只装服务 ipk,**不装 luci-app**(net-console ADR-0005:LuCI 入口退役,统一入口是
# 控制台;luci-app 仍被 CI 构建以防烂,需要菜单入口时手动 opkg install 产物)。
set -eu

IPK_DIR="${1:-/tmp/dns-deploy}"
CFG=/etc/dns-switchy/config.yaml
LASTGOOD_DIR=/mnt/ext/ipk-lastgood
LASTGOOD="$LASTGOOD_DIR/dns-switchy.ipk"

fail() {
    echo "部署失败: $1" >&2
    if [ "${HAVE_PREV:-0}" = 1 ]; then
        echo "装回上一个验证通过的版本…" >&2
        opkg install --force-downgrade "$LASTGOOD" >/dev/null 2>&1 || true
        /etc/init.d/dns-switchy restart || true
        sleep 2
        if pidof dns-switchy >/dev/null 2>&1; then
            echo "已回滚,上一版在跑" >&2
        else
            echo "!! 回滚后旧版本也没起来 —— 全网 DNS 现在是断的,立即人工介入" >&2
        fi
    else
        echo "!! 没有可回滚的版本(首次 lastgood 部署)—— 全网 DNS 可能断了,立即人工介入" >&2
    fi
    exit 1
}

svc_ipk=$(ls "$IPK_DIR"/dns-switchy_*.ipk 2>/dev/null | head -n1)
[ -n "$svc_ipk" ] || { echo "部署失败: 找不到 dns-switchy ipk" >&2; exit 1; }

HAVE_PREV=0
[ -f "$LASTGOOD" ] && HAVE_PREV=1

# --force-downgrade 是必须的:版本号是 0.0.0-<sha8>,sha 之间没有大小可言,不加它
# opkg 会以「已是最新」为由拒装并**返回 0**,部署静默落空。
# 刻意不用 --force-reinstall:它对本地 ipk 会先卸载、再按包名去软件源找,而这个包
# 不在任何 src 里,结果是卸载成功、安装失败、服务被删掉(transparent-proxy 实测)。
echo "安装 $svc_ipk"
opkg install --force-downgrade "$svc_ipk" || fail "opkg 安装 dns-switchy 失败"

/etc/init.d/dns-switchy restart || fail "服务重启失败"
sleep 2

pidof dns-switchy >/dev/null 2>&1 || fail "进程没起来"

# 带 key 探 /api/config:证明 HTTP 栈就绪且配置(含 api_key)加载成功。
# key 从路由器现网配置取(设备状态,CI 没有也不该有)。
api_key=$(sed -n 's/^api_key:[[:space:]]*//p' "$CFG" 2>/dev/null | tr -d '"' | head -n1)
if [ -n "$api_key" ]; then
    wget -q -O /dev/null -T 5 --header="X-Api-Key: $api_key" http://127.0.0.1:5553/api/config \
        || fail "API 不应答或拒绝了 api_key(配置可能没加载成功)"
else
    wget -q -O /dev/null -T 5 http://127.0.0.1:5553/api/config \
        || fail "API 不应答(配置可能没加载成功)"
fi

# 真解析一个域名:HTTP 活着不等于 DNS 面活着,这一步才是「全网没断解析」的直接证据。
# 用 busybox 自带的 nslookup(路由器上没有 dig);test4x.com 由 dns-switchy 本地
# split-horizon 应答,不依赖任何公网上游,上游全挂也该能答。
nslookup test4x.com 127.0.0.1 >/dev/null 2>&1 || fail "DNS 解析验证失败(test4x.com 无应答)"

# 只有验证全过的 ipk 才有资格当回滚目标。
mkdir -p "$LASTGOOD_DIR"
cp "$svc_ipk" "$LASTGOOD.new" && mv "$LASTGOOD.new" "$LASTGOOD"

echo "部署校验通过: 服务在跑,API 鉴权正常,解析正常"

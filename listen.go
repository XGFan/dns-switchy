package main

import (
	"context"
	"log"
	"net"

	"dns-switchy/config"
)

// listenConfig 统一给 DNS / HTTP 监听开 reuseport：整体重建时新服务要在旧服务关闭之前
// 绑定同一地址（绑定失败就保留旧服务继续跑），没有 reuseport 两者无法共存。
func listenConfig() net.ListenConfig {
	return net.ListenConfig{Control: reuseControl}
}

// Listen 同步绑定全部监听端口，必须在 Start 之前调用。
//
// 只有 UDP 绑定失败才返回错误：UDP 是 DNS 主通道，绑不上就不能接替旧服务。TCP（大应答
// 回退通道）和 HTTP（面板/API）绑定失败只记日志、不带它们继续——不能因为面板端口冲突
// 让整个局域网断解析。
func (s *DnsSwitchyServer) Listen() error {
	lc := listenConfig()
	ctx := context.Background()
	// net.OpError 已带「listen udp <addr>」前缀，不再重复包装。
	udp, err := lc.ListenPacket(ctx, "udp", s.config.Addr)
	if err != nil {
		return err
	}
	s.udpConn = udp
	if tcp, terr := lc.Listen(ctx, "tcp", s.config.Addr); terr != nil {
		log.Printf("DNS over TCP disabled: %v", terr)
	} else {
		s.tcpListener = tcp
	}
	if s.config.Http != nil {
		if hl, herr := listenHTTP(s.config.Http); herr != nil {
			log.Printf("HTTP API disabled: %v", herr)
		} else {
			s.httpListener = hl
		}
	}
	return nil
}

func listenHTTP(h *config.HttpConfig) (net.Listener, error) {
	if h.Network == "tcp" {
		lc := listenConfig()
		return lc.Listen(context.Background(), "tcp", h.Addr)
	}
	l, err := h.CreateListener()
	if err != nil {
		return nil, err
	}
	// 整体重建时新服务先在同一路径绑定新 socket，旧服务随后关闭；默认的 unlink-on-close 会按路径
	// 删掉新 socket 的文件，面板随即不可达。关闭时不删文件：残留的 socket 文件由下次
	// CreateListener 启动前清理。
	if ul, ok := l.(*net.UnixListener); ok {
		ul.SetUnlinkOnClose(false)
	}
	return l, nil
}

// closeListeners 兜底释放端口：dns.Server 尚未进入 serve 时 Shutdown 只返回
// "server not started"，不会关闭我们预先绑定的 socket。重复关闭的错误可忽略。
func (s *DnsSwitchyServer) closeListeners() {
	if s.udpConn != nil {
		_ = s.udpConn.Close()
	}
	if s.tcpListener != nil {
		_ = s.tcpListener.Close()
	}
	if s.httpListener != nil {
		_ = s.httpListener.Close()
	}
}

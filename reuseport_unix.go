//go:build aix || darwin || dragonfly || freebsd || linux || netbsd || openbsd

package main

import (
	"syscall"

	"golang.org/x/sys/unix"
)

const reusePortSupported = true

// reuseControl 给监听 socket 设 SO_REUSEADDR + SO_REUSEPORT，见 listenConfig。
func reuseControl(_, _ string, c syscall.RawConn) error {
	var opErr error
	err := c.Control(func(fd uintptr) {
		if opErr = unix.SetsockoptInt(int(fd), unix.SOL_SOCKET, unix.SO_REUSEADDR, 1); opErr != nil {
			return
		}
		opErr = unix.SetsockoptInt(int(fd), unix.SOL_SOCKET, unix.SO_REUSEPORT, 1)
	})
	if err != nil {
		return err
	}
	return opErr
}

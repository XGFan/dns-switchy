//go:build !aix && !darwin && !dragonfly && !freebsd && !linux && !netbsd && !openbsd

package main

import "syscall"

// 该平台没有 SO_REUSEPORT：新旧服务不能同时绑定同一地址，reloadServer 会先停旧服务。
const reusePortSupported = false

var reuseControl func(network, address string, c syscall.RawConn) error

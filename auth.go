package main

import (
	"crypto/sha256"
	"crypto/subtle"
	"net/http"
)

// apiKeyHeader 是面板契约约定的鉴权头，四个组件统一。
const apiKeyHeader = "X-Api-Key"

// authEnabled 表示本进程启用了 api-key 鉴权。api key 在 Create() 时从配置快照到
// s.apiKey：POST /api/config 只改 resolvers（顶层字段以磁盘为准），而直接编辑文件
// 改 api_key 属于顶层变更，会走 reloadFull 重建整个 server —— 两条路径都不会让
// s.apiKey 与生效配置脱节，因此这个字段是只读的，读它不需要加锁。
func (s *DnsSwitchyServer) authEnabled() bool {
	return s.apiKey != ""
}

// requireAPIKey 包装一个 /api/* handler：未配置 api_key 时直接放行（向后兼容），
// 配置了则要求请求头 X-Api-Key 匹配，否则 401。
//
// 比较前先 sha256 再 subtle.ConstantTimeCompare：两者都定长，避免长度不同导致的
// 提前返回泄漏 key 长度。
func (s *DnsSwitchyServer) requireAPIKey(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if s.authEnabled() && !apiKeyMatches(s.apiKey, r.Header.Get(apiKeyHeader)) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"error":"unauthorized"}` + "\n"))
			return
		}
		next(w, r)
	}
}

func apiKeyMatches(want, got string) bool {
	wantSum := sha256.Sum256([]byte(want))
	gotSum := sha256.Sum256([]byte(got))
	return subtle.ConstantTimeCompare(wantSum[:], gotSum[:]) == 1
}

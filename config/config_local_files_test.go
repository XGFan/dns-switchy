package config

import (
	"os"
	"path/filepath"
	"testing"
)

// TestParseLocalMachineConfigs 守卫本地机器配置(router.yaml 等,均在 .gitignore、
// 不随仓库分发)始终能被 ParseConfig 解析;文件不存在时跳过,对 CI 无影响。
func TestParseLocalMachineConfigs(t *testing.T) {
	for _, name := range []string{"router.yaml", "ric.yaml", "local.yaml"} {
		t.Run(name, func(t *testing.T) {
			path := filepath.Join("..", name)
			f, err := os.Open(path)
			if err != nil {
				t.Skipf("%s not present (machine-local file)", name)
			}
			defer f.Close()
			if _, err := ParseConfig(f); err != nil {
				t.Fatalf("parse %s: %v", name, err)
			}
		})
	}
}

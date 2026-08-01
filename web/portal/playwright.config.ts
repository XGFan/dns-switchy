import { defineConfig } from '@playwright/test'

// E2E 打的是**真的 dns-switchy 进程**（go build 出来的二进制 + 一份带 api_key 的临时
// 配置），不是 vite dev server：面板要验的正是「embed 进二进制的 panel.js + 真 API +
// api-key 拦截」这一整条，mock 掉任何一段都验不到。
// 启动脚本见 e2e/server.ts。
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:18199',
    trace: 'retain-on-failure',
  },
})

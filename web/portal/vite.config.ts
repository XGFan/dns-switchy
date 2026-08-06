// 产物是「单文件自包含 ES module」panel.js（面板契约 v1）：
// 库模式 + 关闭 code split + CSS 以 ?inline 形式 import 成字符串塞进 Shadow DOM，
// 所以 Vite 不会另外吐 .css 文件，浏览器也不会去请求任何第二个资源。
import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'

// 设了 PORTAL_API_TARGET 就把 /api 代理到那个真实后端，方便对着跑起来的 dns-switchy 调试。
const apiTarget = process.env.PORTAL_API_TARGET
// 真后端配了 api_key 时，用 PORTAL_API_KEY 让代理替开发者补上 X-Api-Key，否则 /api/* 一律 401。
const apiKey = process.env.PORTAL_API_KEY

export default defineConfig({
  plugins: [preact()],
  // 产物直接落进 web/dist，由 server.go 的 //go:embed all:web/dist 打进单二进制。
  // public/ 里的 standalone 宿主页 index.html 一并拷过去。
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // esnext：允许顶层 await 等，且不为老浏览器降级——面板只服务内网现代浏览器。
    target: 'esnext',
    lib: {
      // 入口叫 main.tsx 而不是 panel.tsx：macOS 文件系统不区分大小写，
      // 后者会和同目录的 Panel.tsx 撞成同一个文件。产物名仍是 panel.js。
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: () => 'panel.js',
    },
    rollupOptions: {
      output: {
        // 契约要求「无额外 chunk」：内联所有动态导入，且不切 vendor。
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    proxy: apiTarget
      ? { '/api': { target: apiTarget, headers: apiKey ? { 'X-Api-Key': apiKey } : undefined } }
      : undefined,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})

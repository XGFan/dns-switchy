// panel.js 的入口：注册 <dns-card> / <dns-panel> 两个 custom element（面板契约 v1）。
//
// 产物是单文件自包含 ES module —— CSS 以 ?inline 形式编译进 JS 字符串，运行时塞进
// 各自的 Shadow DOM，页面不会再去请求任何第二个资源。
import { render, type ComponentType } from 'preact'
// panel-bundle.css 用 @layer 把 Pico 压进低层、joy 的 tokens/自有样式放高层，
// 三份 CSS 由 Vite 在构建期内联成一份字符串（详见该文件头部注释）。
import CSS_TEXT from './panel-bundle.css?inline'
import { createApi, type Api } from './api'
import { Card } from './Card'
import { Panel } from './Panel'

function defineElement(tag: string, View: ComponentType<{ api: Api }>) {
  // 契约要求防重复注册：同一份 bundle 可能被宿主页面重复加载。
  if (customElements.get(tag)) return

  class PanelElement extends HTMLElement {
    private mount: HTMLDivElement | null = null

    connectedCallback() {
      // 元素被 appendChild 到别处会先 disconnect 再 connect。attachShadow 对同一个
      // 元素只能调一次，第二次抛 NotSupportedError，面板就永久空白了——所以这里
      // 复用已有的 shadowRoot，且 disconnect 时**不**丢弃它。
      const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' })
      if (!this.mount) {
        const style = document.createElement('style')
        style.textContent = CSS_TEXT
        root.appendChild(style)
        // Pico conditional 版把元素样式作用在 .pico 之下，所以内容统一挂在这个容器里。
        this.mount = document.createElement('div')
        this.mount.className = 'pico'
        root.appendChild(this.mount)
      }

      // v1：api-base 只在挂载时读一次，不要求响应属性变更。
      const apiBase = this.getAttribute('api-base') || '/api'
      render(<View api={createApi(apiBase)} />, this.mount)
    }

    disconnectedCallback() {
      // 只卸载 Preact 子树；shadowRoot 与挂载点留着，重新 connect 时直接复用。
      if (this.mount) render(null, this.mount)
    }
  }

  customElements.define(tag, PanelElement)
}

defineElement('dns-card', Card)
defineElement('dns-panel', Panel)

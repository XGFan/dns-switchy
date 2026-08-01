import { useState } from 'preact/hooks'
import type { Api } from './api'

export function Spinner({ label }: { label?: string }) {
  return (
    <span class="row">
      <span class="spinner" /> {label ? <span class="muted tiny">{label}</span> : null}
    </span>
  )
}

export function ErrorBox({ title, detail }: { title: string; detail?: string }) {
  return (
    <div class="box err">
      <strong>{title}</strong>
      {detail ? <code>{detail}</code> : null}
    </div>
  )
}

export function OkBox({ text }: { text: string }) {
  return <div class="box ok">{text}</div>
}

/**
 * 401/403 后的 key 输入界面（面板契约）。提交即写 localStorage 并重试上一个动作。
 * standalone 直连组件时才会出现；经 net-console 反代时 key 由服务端注入，走不到这里。
 */
export function KeyPrompt({ api, onSubmit }: { api: Api; onSubmit: () => void }) {
  const [value, setValue] = useState(api.key())
  return (
    <form
      class="key-prompt"
      onSubmit={(e) => {
        e.preventDefault()
        api.setKey(value.trim())
        onSubmit()
      }}
    >
      <div class="box warn" style="margin-bottom:.7rem">
        <strong>需要 API key</strong>
        <code>服务端配置了 api_key，请求需带 X-Api-Key。填入后会存在本浏览器。</code>
      </div>
      <div class="field">
        <label>API key</label>
        <input
          type="password"
          value={value}
          autocomplete="off"
          spellcheck={false}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          placeholder="config.yaml 里的 api_key"
        />
      </div>
      <button type="submit" class="btn-sm">
        保存并重试
      </button>
    </form>
  )
}

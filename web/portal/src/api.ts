// 面板与后端 /api/* 的唯一出口。契约：鉴权头统一 X-Api-Key，key 存
// localStorage['dns.apiKey']；收到 401/403 抛 AuthError，由界面切到 key 输入。
//
// 反代宿主（net-console）在服务端注入 key，面板永远拿不到 401，这套逻辑自然休眠。

export const KEY_STORAGE = 'dns.apiKey'

/** 401/403 专用错误：调用方据此渲染 key 输入界面，而不是当成普通请求失败。 */
export class AuthError extends Error {
  constructor(public status: number) {
    super(status === 403 ? 'forbidden' : 'unauthorized')
    this.name = 'AuthError'
  }
}

export function loadKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) || ''
  } catch {
    // 隐私模式 / 禁用存储时退化成「每次都要重填」，不影响主流程。
    return ''
  }
}

export function saveKey(key: string): void {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key)
    else localStorage.removeItem(KEY_STORAGE)
  } catch {
    /* 同上，忽略 */
  }
}

export interface ApiResponse<T = any> {
  status: number
  data: T
}

export interface Api {
  /** 当前生效的 key（内存态，saveKey 后由 setKey 同步进来）。 */
  key(): string
  setKey(k: string): void
  get<T = any>(path: string): Promise<ApiResponse<T>>
  postJSON<T = any>(path: string, body: unknown): Promise<ApiResponse<T>>
}

export function createApi(apiBase: string): Api {
  let key = loadKey()
  const base = apiBase.replace(/\/+$/, '')

  async function request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
    const headers = new Headers(init.headers)
    if (key) headers.set('X-Api-Key', key)
    const resp = await fetch(base + path, { ...init, headers })
    if (resp.status === 401 || resp.status === 403) throw new AuthError(resp.status)
    // 非 JSON 响应（如 400 时后端 http.Error 吐的纯文本）也要能带出正文，
    // 否则界面只剩一个光秃秃的状态码。
    const text = await resp.text()
    let data: any = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { error: text.trim() }
      }
    }
    return { status: resp.status, data: data as T }
  }

  return {
    key: () => key,
    setKey(k: string) {
      key = k
      saveKey(k)
    },
    get: (path) => request(path, { method: 'GET' }),
    postJSON: (path, body) =>
      request(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
  }
}

import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { AuthError, type Api } from './api'
import {
  ID_FIELD,
  RESOLVER_TYPES,
  blankResolver,
  buildPayloadResolvers,
  resolverLabel,
  type RawResolver,
} from './resolvers'
import { ResolverForm } from './ResolverForm'
import { ErrorBox, OkBox, Spinner } from './ui'

let idSeq = 0

interface Status {
  kind: '' | 'ok' | 'error' | 'conflict'
  msg?: string
  detail?: string
}

interface ReadOnlyTop {
  addr: string
  http: string
  nftset_table: string
  ttl: string
}

export interface ConfigTabProps {
  api: Api
  onAuthRequired: () => void
  /** 供外层（tab 切换 / beforeunload）查询是否有未保存改动。 */
  onDirtyChange?: (dirty: boolean) => void
  /**
   * 填完 api key 后由外层递增。**只有在配置还没成功加载过时**才重新拉取——
   * 若 401 是保存时撞上的，此刻用户手里有未保存草稿，重新拉会把草稿冲掉。
   */
  retryToken?: number
}

export function ConfigTab({ api, onAuthRequired, onDirtyChange, retryToken }: ConfigTabProps) {
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [ro, setRo] = useState<ReadOnlyTop>({ addr: '', http: '', nftset_table: '', ttl: '' })
  const [resolvers, setResolvers] = useState<RawResolver[]>([])
  const [version, setVersion] = useState('')
  const [selected, setSelected] = useState(-1)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: '' })
  const [addOpen, setAddOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')
  // resolver 对象是原地修改的（保留未知字段与键序），Preact 认不出来，靠这个计数器强制重渲染。
  const [, forceRender] = useState(0)
  const bump = useCallback(() => forceRender((n) => n + 1), [])

  const [dragIndex, setDragIndex] = useState(-1)
  const [dragOverIndex, setDragOverIndex] = useState(-1)
  const addWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  const clearStatus = useCallback(() => setStatus({ kind: '' }), [])

  const markDirty = useCallback(() => {
    setDirty(true)
    setJustSaved(false)
    // 内容一改，之前那条「校验通过 / 已保存」就不再成立；错误与冲突提示保留。
    setStatus((s) => (s.kind === 'ok' ? { kind: '' } : s))
    bump()
  }, [bump])

  const applyLoaded = useCallback((data: any, keepSel?: number) => {
    const cfg = data?.config || {}
    setVersion(data?.version || '')
    setRo({
      addr: cfg.addr || '',
      http: cfg.http || '',
      nftset_table: cfg.nftset_table || '',
      ttl: cfg.ttl || '',
    })
    const list: RawResolver[] = Array.isArray(cfg.resolvers) ? cfg.resolvers : []
    list.forEach((r) => {
      r[ID_FIELD] = ++idSeq
    })
    setResolvers(list)
    setSelected(
      keepSel != null && keepSel >= 0 && keepSel < list.length ? keepSel : list.length ? 0 : -1
    )
    setDirty(false)
    setJustSaved(false)
  }, [])

  const loadConfig = useCallback(
    async (keepSel?: number) => {
      setLoading(true)
      setLoadError('')
      clearStatus()
      try {
        const { status: st, data } = await api.get('/config')
        if (st !== 200) throw new Error(`HTTP ${st}${data?.error ? ' — ' + data.error : ''}`)
        applyLoaded(data, keepSel)
        setLoaded(true)
      } catch (err) {
        if (err instanceof AuthError) {
          onAuthRequired()
          return
        }
        setLoadError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    },
    [api, applyLoaded, clearStatus, onAuthRequired]
  )

  // 挂载时拉一次；retryToken 变化（刚填完 key）时，只在从未加载成功的情况下补拉。
  // 已经加载过就什么都不做——那种情况下用户可能正攥着未保存的草稿。
  useEffect(() => {
    if (!loaded && !loading && !loadError) void loadConfig()
    // loadConfig 的依赖是稳定的；这里刻意只在 retryToken 变化时重跑。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryToken])

  // 「+ Add ▾」菜单的点击外部关闭。事件是 composed 的，用 composedPath 才能穿透 shadow root。
  useEffect(() => {
    if (!addOpen) return
    const onDocClick = (e: Event) => {
      const el = addWrapRef.current
      if (el && !e.composedPath().includes(el)) setAddOpen(false)
    }
    window.addEventListener('click', onDocClick)
    return () => window.removeEventListener('click', onDocClick)
  }, [addOpen])

  const cur = selected >= 0 && selected < resolvers.length ? resolvers[selected] : null

  // 版本冲突后 Save 必须锁死：此时本地版本号已经过期，再存就是覆盖别人的写。
  // 唯一出路是冲突提示里的「重新加载」。
  const saveDisabled = busy || !dirty || status.kind === 'conflict'

  function selectResolver(i: number) {
    setSelected(i)
    setMobileView('detail')
  }

  function addResolver(type: string) {
    setAddOpen(false)
    const r = blankResolver(type)
    r[ID_FIELD] = ++idSeq
    resolvers.push(r)
    setSelected(resolvers.length - 1)
    setMobileView('detail')
    markDirty()
  }

  function deleteResolver() {
    if (selected < 0) return
    resolvers.splice(selected, 1)
    if (resolvers.length === 0) setSelected(-1)
    else if (selected >= resolvers.length) setSelected(resolvers.length - 1)
    setMobileView(resolvers.length ? 'detail' : 'list')
    markDirty()
  }

  function moveResolver(i: number, dir: number) {
    if (i < 0) return
    const j = i + dir
    if (j < 0 || j >= resolvers.length) return
    const tmp = resolvers[i]
    resolvers[i] = resolvers[j]
    resolvers[j] = tmp
    setSelected(j)
    markDirty()
  }

  function onDrop(target: number) {
    if (dragIndex < 0) {
      setDragOverIndex(-1)
      return
    }
    if (dragIndex !== target) {
      const moved = resolvers.splice(dragIndex, 1)[0]
      resolvers.splice(target, 0, moved)
      setSelected(target)
      markDirty()
    }
    setDragIndex(-1)
    setDragOverIndex(-1)
  }

  function errText(j: any): string {
    if (!j) return ''
    if (j.error) {
      if (typeof j.error === 'string') return j.error
      try {
        return JSON.stringify(j.error)
      } catch {
        return String(j.error)
      }
    }
    return ''
  }

  async function doValidate() {
    setBusy(true)
    clearStatus()
    try {
      const { status: st, data } = await api.postJSON('/config/validate', {
        resolvers: buildPayloadResolvers(resolvers),
      })
      if (st === 200 && data?.valid) {
        setStatus({ kind: 'ok', msg: 'Configuration is valid.' })
      } else {
        setStatus({
          kind: 'error',
          msg: 'Validation failed' + (data?.stage ? ` (${data.stage})` : ''),
          detail: errText(data),
        })
      }
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthRequired()
        return
      }
      setStatus({
        kind: 'error',
        msg: 'Validate request failed',
        detail: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusy(false)
    }
  }

  async function doSave() {
    setBusy(true)
    clearStatus()
    try {
      const { status: st, data } = await api.postJSON('/config', {
        version,
        resolvers: buildPayloadResolvers(resolvers),
      })
      if (st === 200 && data?.ok) {
        // 重新拉一次，拿到后端规范化后的配置与新版本号。
        const keepSel = selected
        const fresh = await api.get('/config')
        if (fresh.status === 200) applyLoaded(fresh.data, keepSel)
        setJustSaved(true)
        setStatus({ kind: 'ok', msg: 'Saved. Config reloaded and applied live.' })
      } else if (st === 409 && data?.stage === 'version') {
        // 乐观锁冲突。**不要**采纳服务端返回的新版本号：一旦采纳，用户再点一次
        // Save 就会带着新版本过校验、把别处那次写悄悄覆盖掉，乐观锁等于只挡一次。
        // 保留旧版本号 + 禁用 Save，唯一出路是「重新加载」，让冲突必须被看见。
        setStatus({ kind: 'conflict' })
      } else {
        setStatus({
          kind: 'error',
          msg: 'Save failed' + (data?.stage ? ` (${data.stage})` : ''),
          detail: errText(data),
        })
      }
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthRequired()
        return
      }
      setStatus({
        kind: 'error',
        msg: 'Save request failed',
        detail: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner label="Loading configuration…" />

  if (loadError) {
    return (
      <div>
        <ErrorBox title="Failed to load config" detail={loadError} />
        <button class="btn-sm secondary" style="margin-top:.7rem" onClick={() => void loadConfig()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div class="readonly-bar">
        <span>
          <span class="k">addr</span>
          <span class="v">{ro.addr || '—'}</span>
        </span>
        <span>
          <span class="k">http</span>
          <span class="v">{ro.http || '—'}</span>
        </span>
        <span>
          <span class="k">nftset_table</span>
          <span class="v">{ro.nftset_table || '(default)'}</span>
        </span>
        <span>
          <span class="k">ttl</span>
          <span class="v">{ro.ttl || '—'}</span>
        </span>
        <span class="note" title="顶层字段只读，改请直接编辑配置文件">
          只读，改请直接编辑配置文件
        </span>
      </div>

      <div class="toolbar">
        <button class="btn-sm secondary" disabled={busy} onClick={() => void doValidate()}>
          Validate
        </button>
        <button class="btn-sm" disabled={saveDisabled} onClick={() => void doSave()}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        {dirty && !justSaved ? <span class="dirty">● Unsaved changes</span> : null}
        {justSaved ? <span class="saved">✓ Saved</span> : null}
        <span class="spacer" />
        <span class="muted tiny">
          version <span class="mono">{version ? version.slice(0, 8) : '—'}</span>
        </span>
      </div>

      <div class="master-detail" data-view={mobileView}>
        <div class="master">
          <div class="master-head">Resolvers · order = priority</div>
          <div class="r-list">
            {resolvers.length === 0 ? (
              <div class="empty">
                <span>No resolvers yet</span>
                <span class="tiny">Use + Add below to create one</span>
              </div>
            ) : null}
            {resolvers.map((r, i) => (
              <div
                key={r[ID_FIELD]}
                class={`r-item${dragIndex === i ? ' dragging' : ''}${dragOverIndex === i ? ' dragover' : ''}`}
                aria-selected={i === selected}
                onClick={() => selectResolver(i)}
                draggable
                onDragStart={(e) => {
                  setDragIndex(i)
                  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverIndex(i)
                }}
                onDragLeave={() => setDragOverIndex((v) => (v === i ? -1 : v))}
                onDrop={(e) => {
                  e.preventDefault()
                  onDrop(i)
                }}
                onDragEnd={() => {
                  setDragIndex(-1)
                  setDragOverIndex(-1)
                }}
              >
                <span class="r-handle" title="Drag to reorder">
                  ∷
                </span>
                <span class="r-idx">{i + 1}</span>
                <span class={`r-label${r.name ? '' : ' unnamed'}`}>{resolverLabel(r)}</span>
                <span class="badge">{r.type || '?'}</span>
              </div>
            ))}
          </div>
          <div class="master-foot">
            <div class="add-wrap" ref={addWrapRef}>
              <button class="btn-sm secondary" onClick={() => setAddOpen((v) => !v)}>
                + Add ▾
              </button>
              {addOpen ? (
                <div class="add-menu">
                  {RESOLVER_TYPES.map((t) => (
                    <button key={t} onClick={() => addResolver(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <span class="spacer" />
            <button
              class="btn-icon secondary"
              title="Move up"
              disabled={selected <= 0}
              onClick={() => moveResolver(selected, -1)}
            >
              ↑
            </button>
            <button
              class="btn-icon secondary"
              title="Move down"
              disabled={selected < 0 || selected === resolvers.length - 1}
              onClick={() => moveResolver(selected, 1)}
            >
              ↓
            </button>
          </div>
        </div>

        <div class="detail">
          {cur ? (
            <ResolverForm
              // 按 resolver id 重挂：表单里有随选中项走的局部状态（extraConfig 行、
              // 拖拽下标），不重挂会把上一个 resolver 的编辑态串到下一个上。
              key={cur[ID_FIELD]}
              resolver={cur}
              busy={busy}
              saveDisabled={saveDisabled}
              onChange={markDirty}
              onBack={() => setMobileView('list')}
              onDelete={deleteResolver}
              onValidate={() => void doValidate()}
              onSave={() => void doSave()}
            />
          ) : (
            <div class="empty">
              {resolvers.length ? 'Select a resolver to edit' : 'Add a resolver to begin'}
            </div>
          )}
        </div>
      </div>

      <div style="margin-top:.7rem">
        {status.kind === 'ok' ? <OkBox text={status.msg || ''} /> : null}
        {status.kind === 'error' ? (
          <ErrorBox title={status.msg || 'Error'} detail={status.detail} />
        ) : null}
        {status.kind === 'conflict' ? (
          <div class="box err">
            <strong>配置已在别处变更</strong>
            <code>
              The configuration was modified elsewhere since you loaded it. Reload to discard your
              local changes.
            </code>
            <button
              class="btn-sm"
              style="margin-top:.6rem"
              onClick={() => {
                clearStatus()
                void loadConfig()
              }}
            >
              重新加载（丢弃本地改动）
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

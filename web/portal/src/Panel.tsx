import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { Api } from './api'
import { ConfigTab } from './ConfigTab'
import { Lookup } from './Lookup'
import { KeyPrompt } from './ui'

export function Panel({ api }: { api: Api }) {
  const [tab, setTab] = useState<'lookup' | 'config'>('lookup')
  const [needKey, setNeedKey] = useState(false)
  // 填完 key 后递增：Lookup 直接靠它重挂（无状态可丢），ConfigTab 只把它当重试信号。
  const [authEpoch, setAuthEpoch] = useState(0)
  // config tab 懒挂载，但挂上之后**永不卸载**（只用 hidden 藏起来），
  // 否则来回切 tab 会丢掉未保存的编辑。
  const [mountedConfig, setMountedConfig] = useState(false)
  const dirtyRef = useRef(false)

  useEffect(() => {
    if (tab === 'config') setMountedConfig(true)
  }, [tab])

  const onAuthRequired = useCallback(() => setNeedKey(true), [])
  const onDirtyChange = useCallback((d: boolean) => {
    dirtyRef.current = d
  }, [])

  // 有未保存改动时拦住关页面/刷新。
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  function switchTab(next: 'lookup' | 'config') {
    if (tab === 'config' && next !== 'config' && dirtyRef.current) {
      if (!confirm('You have unsaved configuration changes. Leave anyway?')) return
    }
    setTab(next)
  }

  return (
    <div>
      {/* key 输入是**内联在面板顶部**的，不替换下面的子树：Save 撞 401 时用户手里
          往往攥着一堆未保存的编辑，把 ConfigTab 卸掉等于当场丢草稿。 */}
      {needKey ? (
        <div style="margin-bottom:.8rem">
          <KeyPrompt
            api={api}
            onSubmit={() => {
              setNeedKey(false)
              setAuthEpoch((n) => n + 1)
            }}
          />
        </div>
      ) : null}

      <div class="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'lookup'} onClick={() => switchTab('lookup')}>
          Lookup
        </button>
        <button role="tab" aria-selected={tab === 'config'} onClick={() => switchTab('config')}>
          Config
        </button>
      </div>

      {/* config tab 一旦挂载就保持挂载（用 hidden 切换），否则来回切 tab 会丢掉未保存的编辑。 */}
      <div hidden={tab !== 'lookup'}>
        <Lookup key={`lookup-${authEpoch}`} api={api} onAuthRequired={onAuthRequired} />
      </div>
      {mountedConfig ? (
        <div hidden={tab !== 'config'}>
          {/* 注意这里**没有** key={authEpoch}：ConfigTab 一旦挂上就不许因为填 key 被
              重建，否则未保存的编辑全没。改用 retryToken，由它自己决定要不要补拉。 */}
          <ConfigTab
            api={api}
            onAuthRequired={onAuthRequired}
            onDirtyChange={onDirtyChange}
            retryToken={authEpoch}
          />
        </div>
      ) : null}
    </div>
  )
}

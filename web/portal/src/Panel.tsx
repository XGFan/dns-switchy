import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { Api } from './api'
import { Config } from './Config'
import { Lookup } from './Lookup'
import { KeyPrompt } from './ui'

export function Panel({ api }: { api: Api }) {
  const [needKey, setNeedKey] = useState(false)
  // 填完 key 后递增：Lookup 直接靠它重挂（无状态可丢），Config 只把它当重试信号。
  const [authEpoch, setAuthEpoch] = useState(0)
  const dirtyRef = useRef(false)

  const onAuthRequired = useCallback(() => setNeedKey(true), [])
  const onDirtyChange = useCallback((d: boolean) => {
    dirtyRef.current = d
  }, [])

  // 有未保存改动时拦住关页面/刷新。页面已经是单页，没有「离开 tab」这一步，
  // 但关页面这条路还在，保护照旧。
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

  return (
    // .panel 是面板的内容列（视觉语言 §5：72rem 居中 + 两侧 1rem），壳内与 standalone 同一份。
    <div class="panel">
      {/* key 输入是**内联在面板顶部**的，不替换下面的子树：Save 撞 401 时用户手里
          往往攥着一堆未保存的编辑，把 Config 卸掉等于当场丢草稿。 */}
      {needKey ? (
        <div style="margin-bottom:1rem">
          <KeyPrompt
            api={api}
            onSubmit={() => {
              setNeedKey(false)
              setAuthEpoch((n) => n + 1)
            }}
          />
        </div>
      ) : null}

      {/* 单页：服务概览 → 查询 → 解析器。查询区块作为 children 塞在 Config 的两段之间——
          概览与解析器读的是同一份配置状态，拆成两个组件就得把那份状态提到这里来，
          为了排个序不值当。
          Config 上**没有** key={authEpoch}：它一旦挂上就不许因为填 key 被重建，
          否则未保存的编辑全没；改用 retryToken，由它自己决定要不要补拉。 */}
      <Config
        api={api}
        onAuthRequired={onAuthRequired}
        onDirtyChange={onDirtyChange}
        retryToken={authEpoch}
      >
        <Lookup key={`lookup-${authEpoch}`} api={api} onAuthRequired={onAuthRequired} />
      </Config>
    </div>
  )
}

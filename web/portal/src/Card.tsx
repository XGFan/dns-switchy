import { useCallback, useEffect, useState } from 'preact/hooks'
import { AuthError, type Api } from './api'
import { Lookup } from './Lookup'
import { ErrorBox, KeyPrompt, Spinner } from './ui'

interface Summary {
  addr: string
  http: string
  ttl: string
  resolverCount: number
}

/** 总览卡片：服务基本状态 + 一个快捷 DNS lookup 输入框。 */
export function Card({ api }: { api: Api }) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [needKey, setNeedKey] = useState(false)
  const [epoch, setEpoch] = useState(0)

  const onAuthRequired = useCallback(() => setNeedKey(true), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .get('/config')
      .then(({ status, data }) => {
        if (cancelled) return
        if (status !== 200) {
          setError(`HTTP ${status}`)
          return
        }
        const cfg = data?.config || {}
        setSummary({
          addr: cfg.addr || '',
          http: cfg.http || '',
          ttl: cfg.ttl || '',
          resolverCount: Array.isArray(cfg.resolvers) ? cfg.resolvers.length : 0,
        })
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof AuthError) {
          setNeedKey(true)
          return
        }
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [api, epoch])

  if (needKey) {
    return (
      <KeyPrompt
        api={api}
        onSubmit={() => {
          setNeedKey(false)
          setEpoch((n) => n + 1)
        }}
      />
    )
  }

  return (
    <div>
      {loading ? <Spinner label="加载中…" /> : null}
      {error ? <ErrorBox title="状态不可用" detail={error} /> : null}
      {summary ? (
        <div class="card-stats">
          <span>
            <span class="k">resolvers</span>
            <span class="v">{summary.resolverCount}</span>
          </span>
          <span>
            <span class="k">dns</span>
            <span class="v">{summary.addr || '—'}</span>
          </span>
          <span>
            <span class="k">http</span>
            <span class="v">{summary.http || '—'}</span>
          </span>
          <span>
            <span class="k">ttl</span>
            <span class="v">{summary.ttl || '—'}</span>
          </span>
        </div>
      ) : null}
      <Lookup key={`card-lookup-${epoch}`} api={api} onAuthRequired={onAuthRequired} compact />
    </div>
  )
}

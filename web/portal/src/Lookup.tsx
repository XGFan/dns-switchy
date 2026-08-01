import { useState } from 'preact/hooks'
import { AuthError, type Api } from './api'
import { LOOKUP_TYPES, answerRows, errorText, type AnswerRow } from './dns'
import { ErrorBox, Spinner } from './ui'

interface QueryResult {
  resolver?: string
  /** 后端返回的解析失败（resolver 报错），与「请求本身失败」区分开。 */
  queryError?: string
  rows: AnswerRow[]
}

export interface LookupProps {
  api: Api
  onAuthRequired: () => void
  /** card 上的精简形态：不出表格，只出一行摘要。 */
  compact?: boolean
}

export function Lookup({ api, onAuthRequired, compact }: LookupProps) {
  const [domain, setDomain] = useState('')
  const [qtype, setQtype] = useState('A')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [reqError, setReqError] = useState('')

  async function run(e: Event) {
    e.preventDefault()
    const q = domain.trim()
    if (!q) return
    setBusy(true)
    setReqError('')
    setResult(null)
    try {
      const { status, data } = await api.get(
        `/query?question=${encodeURIComponent(q)}&type=${encodeURIComponent(qtype)}`
      )
      if (status !== 200) {
        setReqError(`HTTP ${status}${data && data.error ? ' — ' + errorText(data.error) : ''}`)
        return
      }
      setResult({
        resolver: data?.resolver,
        queryError: data?.error ? errorText(data.error) : undefined,
        rows: answerRows(data?.answer),
      })
    } catch (err) {
      if (err instanceof AuthError) {
        onAuthRequired()
        return
      }
      setReqError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <form class="lookup-form" onSubmit={run}>
        <input
          type="text"
          value={domain}
          placeholder="example.com"
          autocomplete="off"
          spellcheck={false}
          onInput={(e) => setDomain((e.target as HTMLInputElement).value)}
        />
        <select value={qtype} onChange={(e) => setQtype((e.target as HTMLSelectElement).value)}>
          {LOOKUP_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy}>
          Lookup
        </button>
      </form>

      {busy ? <Spinner label="Resolving…" /> : null}
      {reqError ? <ErrorBox title="Request failed" detail={reqError} /> : null}
      {result ? <LookupResult result={result} compact={!!compact} /> : null}
      {!busy && !reqError && !result && !compact ? (
        <p class="empty">Enter a domain to query</p>
      ) : null}
    </div>
  )
}

function LookupResult({ result, compact }: { result: QueryResult; compact: boolean }) {
  return (
    <div>
      {result.resolver ? (
        <p class="row tiny" style="margin-bottom:.5rem">
          <span class="muted">Resolver</span>
          <span class="badge accent">{result.resolver}</span>
        </p>
      ) : null}

      {result.queryError ? <ErrorBox title="Query failed" detail={result.queryError} /> : null}

      {!result.queryError && result.rows.length === 0 ? (
        <p class="muted tiny">No records found</p>
      ) : null}

      {!result.queryError && result.rows.length > 0 ? (
        compact ? (
          <p class="card-answer">
            {result.rows.map((r) => r.value).filter(Boolean).join(', ')}
          </p>
        ) : (
          <div style="overflow-x:auto">
            <table class="answers">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>TTL</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r, i) => (
                  <tr key={i}>
                    <td title={r.name}>{r.name}</td>
                    <td>
                      <span class="badge">{r.type}</span>
                    </td>
                    <td class="muted">{r.ttl}</td>
                    <td>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  )
}

import { useState } from 'preact/hooks'
import { AuthError, type Api } from './api'
import { LOOKUP_TYPES, answerRows, errorText, type AnswerRow } from './dns'
import { Empty, ErrorBox, Spinner } from './ui'

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

  function clear() {
    setResult(null)
    setReqError('')
  }

  const typeOptions = LOOKUP_TYPES.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))

  // card 上的控件走紧凑一档，且提交按钮用描边而非实心 accent——大块实心是 panel 里
  // 主操作的语言，出现在卡片上会压过状态信息（面板契约「卡片视觉基准」）。
  // 标签也不出：卡片是一眼扫的摘要，容不下表单排版。
  if (compact) {
    return (
      <div>
        <form class="lookup-form compact" onSubmit={run}>
          <input
            type="text"
            value={domain}
            placeholder="example.com"
            autocomplete="off"
            spellcheck={false}
            onInput={(e) => setDomain((e.target as HTMLInputElement).value)}
          />
          <select value={qtype} onChange={(e) => setQtype((e.target as HTMLSelectElement).value)}>
            {typeOptions}
          </select>
          <button type="submit" class="outline" disabled={busy}>
            查询
          </button>
        </form>

        {busy ? <Spinner label="查询中…" /> : null}
        {reqError ? <ErrorBox title="请求失败" detail={reqError} /> : null}
        {result ? <LookupResult result={result} compact /> : null}
      </div>
    )
  }

  // 结果区块只在发起过查询之后存在：单页里它夹在概览与解析器之间，
  // 没查过就摆一个空壳只是白占一段版面。
  const showResult = busy || !!reqError || !!result

  return (
    <>
      {/* 查询区块（§6）：区块头 + 表单；每个输入都有可见标签（§10），
          placeholder 只当示例，不兼任标签。 */}
      <section class="section section-lookup">
        <div class="section-head">
          <h2 class="section-title">查询</h2>
        </div>
        <form class="lookup-form" onSubmit={run}>
          <div class="lf-field lf-domain">
            <label for="lookup-domain">域名</label>
            <input
              id="lookup-domain"
              type="text"
              value={domain}
              placeholder="example.com"
              autocomplete="off"
              spellcheck={false}
              onInput={(e) => setDomain((e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="lf-field lf-type">
            <label for="lookup-type">类型</label>
            <select
              id="lookup-type"
              value={qtype}
              onChange={(e) => setQtype((e.target as HTMLSelectElement).value)}
            >
              {typeOptions}
            </select>
          </div>
          {/* 本区块唯一的实心主操作（§1） */}
          <button type="submit" disabled={busy} aria-busy={busy}>
            查询
          </button>
        </form>
      </section>

      {showResult ? (
        <section class="section section-result">
          <div class="section-head">
            <h2 class="section-title">结果</h2>
            <span class="section-actions">
              {result?.resolver ? (
                <span class="head-note">
                  命中 <span class="badge mono">{result.resolver}</span>
                </span>
              ) : null}
              {/* 清除只收拾本区块自己的显示状态：区块随之回到「没查过」的不渲染态。
                  查询进行中不给点——那会儿清掉，响应回来照样把结果写回去。 */}
              <button type="button" class="secondary" disabled={busy} onClick={clear}>
                清除
              </button>
            </span>
          </div>

          {busy ? <Spinner label="查询中…" /> : null}
          {reqError ? <ErrorBox title="请求失败" detail={reqError} /> : null}
          {result ? <LookupResult result={result} compact={false} /> : null}
        </section>
      ) : null}
    </>
  )
}

function LookupResult({ result, compact }: { result: QueryResult; compact: boolean }) {
  return (
    <div>
      {/* 命中的 resolver 名是标识、不是状态：中性徽章，别占 accent（§9）。
          panel 里它挂在区块头上，这里只在卡片形态渲染。 */}
      {compact && result.resolver ? (
        <p class="row tiny" style="margin-bottom:.5rem">
          <span class="muted">Resolver</span>
          <span class="badge">{result.resolver}</span>
        </p>
      ) : null}

      {result.queryError ? <ErrorBox title="解析失败" detail={result.queryError} /> : null}

      {!result.queryError && result.rows.length === 0 ? (
        compact ? (
          <p class="muted tiny">没有记录</p>
        ) : (
          <Empty title="没有记录" hint="换个记录类型，或确认该域名确实有此类记录" />
        )
      ) : null}

      {!result.queryError && result.rows.length > 0 ? (
        compact ? (
          <p class="card-answer">
            {result.rows.map((r) => r.value).filter(Boolean).join(', ')}
          </p>
        ) : (
          <div class="table-wrap">
            <table class="answers">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>类型</th>
                  <th class="num">TTL</th>
                  <th>值</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r, i) => (
                  <tr key={i}>
                    <td title={r.name}>{r.name}</td>
                    <td>
                      <span class="badge">{r.type}</span>
                    </td>
                    <td class="num muted">{r.ttl}</td>
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

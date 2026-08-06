import { useState } from 'preact/hooks'
import { FORWARDISH_TYPES, QUERY_TYPES, RULE_TYPES, type RawResolver } from './resolvers'

/** extraConfig 的一行编辑态。id 只用于列表 key，让改 key 时输入框不被重建。 */
interface ExtraRow {
  id: number
  k: string
  v: string
}

let rowSeq = 0

function initialExtraRows(r: RawResolver): ExtraRow[] {
  if (!r.extraConfig || typeof r.extraConfig !== 'object') return []
  return Object.keys(r.extraConfig).map((k) => ({ id: ++rowSeq, k, v: r.extraConfig[k] }))
}

export interface ResolverFormProps {
  resolver: RawResolver
  /** 任何字段改动后调用：标脏 + 触发重渲染（resolver 是原地修改的）。 */
  onChange: () => void
  onBack: () => void
  onDelete: () => void
}

export function ResolverForm(props: ResolverFormProps) {
  const { resolver: r, onChange } = props
  const type = String(r.type || '')
  const [ruleDrag, setRuleDrag] = useState(-1)
  const [ruleDragOver, setRuleDragOver] = useState(-1)
  // 调用方按 resolver id 给本组件加了 key，切换 resolver 会重挂，所以这份初始值
  // 总是对应当前选中的那个 resolver。
  const [extraRows, setExtraRows] = useState<ExtraRow[]>(() => initialExtraRows(r))

  // ── 字段写入：一律原地改 r，保留未知字段与键序 ──
  const setField = (key: string, val: any) => {
    r[key] = val
    onChange()
  }
  /** 可选字符串：空值直接删键，避免往 YAML 里写空标量。 */
  const setOptStr = (key: string, val: string) => {
    if (val === '' || val == null) delete r[key]
    else r[key] = val
    onChange()
  }
  const pruneConfig = (obj: RawResolver) => {
    if (obj.config && Object.keys(obj.config).length === 0) delete obj.config
  }

  // ── rule ──
  const rules: string[] = Array.isArray(r.rule) ? r.rule : []
  const addRule = () => {
    if (!Array.isArray(r.rule)) r.rule = []
    r.rule.push('')
    onChange()
  }
  const setRule = (i: number, v: string) => {
    if (Array.isArray(r.rule)) r.rule[i] = v
    onChange()
  }
  const removeRule = (i: number) => {
    if (Array.isArray(r.rule)) r.rule.splice(i, 1)
    onChange()
  }
  const moveRule = (i: number, dir: number) => {
    if (!Array.isArray(r.rule)) return
    const j = i + dir
    if (j < 0 || j >= r.rule.length) return
    const tmp = r.rule[i]
    r.rule[i] = r.rule[j]
    r.rule[j] = tmp
    onChange()
  }
  const dropRule = (target: number) => {
    if (ruleDrag >= 0 && Array.isArray(r.rule) && ruleDrag !== target) {
      const moved = r.rule.splice(ruleDrag, 1)[0]
      r.rule.splice(target, 0, moved)
      onChange()
    }
    setRuleDrag(-1)
    setRuleDragOver(-1)
  }

  // ── queryType ──
  const hasQType = (qt: string) => Array.isArray(r.queryType) && r.queryType.includes(qt)
  const toggleQType = (qt: string) => {
    if (!Array.isArray(r.queryType)) r.queryType = []
    const idx = r.queryType.indexOf(qt)
    if (idx >= 0) r.queryType.splice(idx, 1)
    else r.queryType.push(qt)
    onChange()
  }

  // ── config.timeout / config.serverIP（forward / preloader，以及 upstream 各自一份）──
  const setTimeoutOn = (obj: RawResolver, val: string) => {
    if (!obj.config) obj.config = {}
    if (val === '') delete obj.config.timeout
    else obj.config.timeout = val
    pruneConfig(obj)
    onChange()
  }
  const serverIPsOf = (obj: RawResolver): string[] =>
    obj.config && Array.isArray(obj.config.serverIP) ? obj.config.serverIP : []
  const addServerIP = (obj: RawResolver) => {
    if (!obj.config) obj.config = {}
    if (!Array.isArray(obj.config.serverIP)) obj.config.serverIP = []
    obj.config.serverIP.push('')
    onChange()
  }
  const setServerIP = (obj: RawResolver, i: number, val: string) => {
    if (obj.config && Array.isArray(obj.config.serverIP)) obj.config.serverIP[i] = val
    onChange()
  }
  const removeServerIP = (obj: RawResolver, i: number) => {
    if (obj.config && Array.isArray(obj.config.serverIP)) {
      obj.config.serverIP.splice(i, 1)
      if (obj.config.serverIP.length === 0) delete obj.config.serverIP
      pruneConfig(obj)
    }
    onChange()
  }

  // ── upstreams（forward-group）──
  const upstreams: RawResolver[] = Array.isArray(r.upstreams) ? r.upstreams : []
  const addUpstream = () => {
    if (!Array.isArray(r.upstreams)) r.upstreams = []
    // 同 blankResolver：不 seed 空串 timeout，否则存盘时 YAML 解 duration 会失败。
    r.upstreams.push({ url: '' })
    onChange()
  }
  const removeUpstream = (i: number) => {
    if (Array.isArray(r.upstreams)) r.upstreams.splice(i, 1)
    onChange()
  }

  // ── file.extraConfig：编辑态是**显式的行数组**，不是从对象反推 ──
  //
  // 早先版本每次都用 Object.keys(r.extraConfig) 反推行，有两个坑：把某行的 key
  // 清空，这行就从对象里消失、界面上连值一起蒸发；两行填成同名 key 时后写的静默
  // 覆盖先写的，用户看着两行、存下去只剩一行。行数组是编辑期的真相，r.extraConfig
  // 只在每次改动后由行重建（空 key 的行不写入），重名则明确提示、不假装没事。
  const updateExtraRows = (next: ExtraRow[]) => {
    setExtraRows(next)
    const obj: Record<string, string> = {}
    next.forEach((row) => {
      if (row.k !== '') obj[row.k] = row.v
    })
    if (Object.keys(obj).length) r.extraConfig = obj
    else delete r.extraConfig
    onChange()
  }
  const addExtra = () => updateExtraRows([...extraRows, { id: ++rowSeq, k: '', v: '' }])
  const setExtraKey = (i: number, val: string) =>
    updateExtraRows(extraRows.map((row, j) => (j === i ? { ...row, k: val } : row)))
  const setExtraVal = (i: number, val: string) =>
    updateExtraRows(extraRows.map((row, j) => (j === i ? { ...row, v: val } : row)))
  const removeExtra = (i: number) => updateExtraRows(extraRows.filter((_, j) => j !== i))

  // 重名 key：保存时后写的会赢，所以这里必须让用户看见，而不是让它默默吃掉一行。
  const duplicateExtraKeys = (() => {
    const seen = new Set<string>()
    const dup = new Set<string>()
    extraRows.forEach((row) => {
      if (row.k === '') return
      if (seen.has(row.k)) dup.add(row.k)
      seen.add(row.k)
    })
    return [...dup]
  })()

  const nftsetFields = (
    <div class="field-row">
      <div class="field">
        <label>
          nftset <span class="hint">nftables set 名</span>
        </label>
        <input
          type="text"
          value={r.nftset || ''}
          placeholder="corp4"
          onInput={(e) => setOptStr('nftset', (e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="field">
        <label>nftset_ttl</label>
        <input
          type="text"
          value={r.nftset_ttl || ''}
          placeholder="1h"
          onInput={(e) => setOptStr('nftset_ttl', (e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  )

  return (
    <div>
      <div class="detail-head">
        <button class="secondary back-btn" onClick={props.onBack}>
          ← 返回
        </button>
        <span class="detail-name">{r.name || '(unnamed)'}</span>
        {/* type 是标识不是状态：中性徽章，别占 accent（视觉语言 §9） */}
        <span class="badge">{type}</span>
      </div>

      {type !== 'file' ? (
        <div class="field">
          <label>
            name <span class="hint">可选标签</span>
          </label>
          <input
            type="text"
            value={r.name || ''}
            placeholder="(unnamed)"
            onInput={(e) => setField('name', (e.target as HTMLInputElement).value)}
          />
        </div>
      ) : null}

      {FORWARDISH_TYPES.includes(type) ? (
        <>
          <div class="field">
            <label>
              ttl <span class="hint">缓存时长，如 600s / 5m；留空用全局 ttl</span>
            </label>
            <input
              type="text"
              value={r.ttl || ''}
              placeholder="(use global ttl)"
              onInput={(e) => setOptStr('ttl', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="field">
            <label class="check-line">
              <input
                type="checkbox"
                checked={!!r['break-on-fail']}
                onChange={(e) =>
                  setField('break-on-fail', (e.target as HTMLInputElement).checked)
                }
              />
              break-on-fail <span class="hint">失败即中断 resolver 链</span>
            </label>
          </div>
        </>
      ) : null}

      {type === 'forward' || type === 'preloader' ? (
        <div class="field">
          <label>
            url <span class="hint">上游：IP、IP:port、https://…(DoH)、tls://…(DoT)</span>
          </label>
          <input
            type="text"
            value={r.url || ''}
            placeholder="114.114.114.114"
            onInput={(e) => setField('url', (e.target as HTMLInputElement).value)}
          />
        </div>
      ) : null}

      {type === 'forward-group' ? (
        <div class="field">
          <label>
            upstreams <span class="hint">并发竞速，最先成功者胜出</span>
          </label>
          {upstreams.map((u, ui) => (
            <div class="upstream-block" key={ui}>
              <div class="ub-head">
                <span class="ub-title">upstream {ui + 1}</span>
                <button class="btn-inline secondary" title="移除 upstream" onClick={() => removeUpstream(ui)}>
                  ✕
                </button>
              </div>
              <div class="field">
                <label>url</label>
                <input
                  type="text"
                  value={u.url || ''}
                  placeholder="https://dns.google/dns-query"
                  onInput={(e) => {
                    u.url = (e.target as HTMLInputElement).value
                    onChange()
                  }}
                />
              </div>
              <div class="field">
                <label>config.timeout</label>
                <input
                  type="text"
                  value={(u.config && u.config.timeout) || ''}
                  placeholder="3s"
                  onInput={(e) => setTimeoutOn(u, (e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>
                  config.serverIP <span class="hint">bootstrap IP</span>
                </label>
                <div class="row-list">
                  {serverIPsOf(u).map((ip, ipi) => (
                    <div class="line-row" key={ipi}>
                      <input
                        type="text"
                        value={ip}
                        placeholder="8.8.8.8"
                        onInput={(e) => setServerIP(u, ipi, (e.target as HTMLInputElement).value)}
                      />
                      <button class="btn-inline secondary" title="移除" onClick={() => removeServerIP(u, ipi)}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <button class="add-line" onClick={() => addServerIP(u)}>
                    + serverIP
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button class="add-line" onClick={addUpstream}>
            + 添加 upstream
          </button>
        </div>
      ) : null}

      {RULE_TYPES.includes(type) ? (
        <div class="field">
          <label>
            rule <span class="hint">一行一条 · 支持 v2fly:cn、include:…、!黑名单、keyword:、regexp:</span>
          </label>
          <div class="row-list">
            {rules.length === 0 ? (
              <p class="muted tiny" style="margin:0">
                没有规则 —— 该 resolver 会接下它作用域内的全部查询。
              </p>
            ) : null}
            {rules.map((rl, ri) => (
              <div
                class={`line-row${ruleDrag === ri ? ' dragging' : ''}${ruleDragOver === ri ? ' dragover' : ''}`}
                key={ri}
                onDragOver={(e) => {
                  e.preventDefault()
                  setRuleDragOver(ri)
                }}
                onDragLeave={() => setRuleDragOver((v) => (v === ri ? -1 : v))}
                onDrop={(e) => {
                  e.preventDefault()
                  dropRule(ri)
                }}
              >
                <span
                  class="lr-handle"
                  title="拖动排序"
                  draggable
                  onDragStart={(e) => {
                    setRuleDrag(ri)
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setRuleDrag(-1)
                    setRuleDragOver(-1)
                  }}
                >
                  ∷
                </span>
                <input
                  type="text"
                  value={rl}
                  spellcheck={false}
                  placeholder="example.com / v2fly:cn / !blocked.com"
                  onInput={(e) => setRule(ri, (e.target as HTMLInputElement).value)}
                />
                <span class="arrows">
                  <button class="btn-inline secondary" title="上移" disabled={ri === 0} onClick={() => moveRule(ri, -1)}>
                    ↑
                  </button>
                  <button
                    class="btn-inline secondary"
                    title="下移"
                    disabled={ri === rules.length - 1}
                    onClick={() => moveRule(ri, 1)}
                  >
                    ↓
                  </button>
                </span>
                <button class="btn-inline secondary" title="删除规则" onClick={() => removeRule(ri)}>
                  ✕
                </button>
              </div>
            ))}
            <button class="add-line" onClick={addRule}>
              + 添加规则
            </button>
          </div>
        </div>
      ) : null}

      {type === 'filter' || type === 'mock' ? (
        <div class="field">
          <label>
            queryType <span class="hint">匹配这些记录类型（空 = 全部）</span>
          </label>
          <div class="qtype-grid">
            {QUERY_TYPES.map((qt) => (
              <label class={`qtype-chip${hasQType(qt) ? ' on' : ''}`} key={qt}>
                <input type="checkbox" checked={hasQType(qt)} onChange={() => toggleQType(qt)} />
                <span>{qt}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {type === 'mock' ? (
        <div class="field">
          <label>
            answer <span class="hint">命中时返回的固定 IP</span>
          </label>
          <input
            type="text"
            value={r.answer || ''}
            placeholder="192.168.1.1"
            onInput={(e) => setField('answer', (e.target as HTMLInputElement).value)}
          />
        </div>
      ) : null}

      {type === 'file' ? (
        <>
          <div class="field-row">
            <div class="field">
              <label>fileType</label>
              <select
                value={r.fileType || 'host'}
                onChange={(e) => setField('fileType', (e.target as HTMLSelectElement).value)}
              >
                <option value="host">host</option>
                <option value="lease">lease</option>
              </select>
            </div>
            <div class="field">
              <label>refreshInterval</label>
              <input
                type="text"
                value={r.refreshInterval || ''}
                placeholder="10m"
                onInput={(e) => setOptStr('refreshInterval', (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          <div class="field">
            <label>
              location <span class="hint">保存时会校验路径</span>
            </label>
            <input
              type="text"
              value={r.location || ''}
              placeholder="/tmp/dhcp.leases 或 system"
              onInput={(e) => setField('location', (e.target as HTMLInputElement).value)}
            />
            {(r.location || '') === 'system' ? (
              <div class="notice notice-warn" style="margin-top:.4rem">
                <strong>system</strong> = 读操作系统 hosts 文件。非 system 的路径必须在磁盘上存在，
                否则保存会被拒（409）。
              </div>
            ) : null}
          </div>
          <details class="adv">
            <summary>Advanced · extraContent / extraConfig</summary>
            <div class="field">
              <label>
                extraContent <span class="hint">内联的 host/lease 行</span>
              </label>
              <textarea
                rows={4}
                value={r.extraContent || ''}
                placeholder="1.1.1.1 a.com b.com"
                onInput={(e) => setOptStr('extraContent', (e.target as HTMLTextAreaElement).value)}
              />
            </div>
            <div class="field">
              <label>
                extraConfig <span class="hint">key → value（如 domain → lan）</span>
              </label>
              <div class="row-list">
                {extraRows.map((kv, ki) => (
                  <div class="kv-row" key={kv.id}>
                    <input
                      class="k"
                      type="text"
                      value={kv.k}
                      spellcheck={false}
                      placeholder="key"
                      onInput={(e) => setExtraKey(ki, (e.target as HTMLInputElement).value)}
                    />
                    <input
                      class="v"
                      type="text"
                      value={kv.v}
                      spellcheck={false}
                      placeholder="value"
                      onInput={(e) => setExtraVal(ki, (e.target as HTMLInputElement).value)}
                    />
                    <button class="btn-inline secondary" title="移除" onClick={() => removeExtra(ki)}>
                      ✕
                    </button>
                  </div>
                ))}
                <button class="add-line" onClick={addExtra}>
                  + key/value
                </button>
              </div>
              {extraRows.some((row) => row.k === '') ? (
                <p class="muted tiny" style="margin:.35rem 0 0">
                  key 为空的行不会被保存。
                </p>
              ) : null}
              {duplicateExtraKeys.length ? (
                <div class="notice notice-warn" style="margin-top:.4rem">
                  <strong>重复的 key：{duplicateExtraKeys.join('、')}</strong>
                  <code>同名 key 只会保留最后一行的值，请改名或删掉多余的行。</code>
                </div>
              ) : null}
            </div>
          </details>
        </>
      ) : null}

      {type === 'forward' || type === 'preloader' ? (
        <details class="adv">
          <summary>Advanced · timeout / serverIP / nftset</summary>
          <div class="field">
            <label>config.timeout</label>
            <input
              type="text"
              value={(r.config && r.config.timeout) || ''}
              placeholder="3s"
              onInput={(e) => setTimeoutOn(r, (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="field">
            <label>
              config.serverIP <span class="hint">DoH/DoT 的 bootstrap IP</span>
            </label>
            <div class="row-list">
              {serverIPsOf(r).map((ip, ii) => (
                <div class="line-row" key={ii}>
                  <input
                    type="text"
                    value={ip}
                    placeholder="8.8.8.8"
                    onInput={(e) => setServerIP(r, ii, (e.target as HTMLInputElement).value)}
                  />
                  <button class="btn-inline secondary" title="移除" onClick={() => removeServerIP(r, ii)}>
                    ✕
                  </button>
                </div>
              ))}
              <button class="add-line" onClick={() => addServerIP(r)}>
                + serverIP
              </button>
            </div>
          </div>
          {nftsetFields}
        </details>
      ) : null}

      {type === 'forward-group' || type === 'file' ? (
        <details class="adv">
          <summary>Advanced · nftset</summary>
          {nftsetFields}
        </details>
      ) : null}

      {/* 校验/保存只留在区块头那一处：同一区块里两套「保存」既是重复入口，
          也会出现第二个实心主操作（视觉语言 §1）。这里只留危险动作。 */}
      <div class="detail-actions">
        <button class="btn-danger" onClick={props.onDelete}>
          删除该 resolver
        </button>
      </div>
    </div>
  )
}

import { describe, expect, it } from 'vitest'
import { ID_FIELD, blankResolver, buildPayloadResolvers } from './resolvers'

describe('buildPayloadResolvers', () => {
  it('剥掉前端私有的 __id，保留其余字段与键序', () => {
    const out = buildPayloadResolvers([
      { [ID_FIELD]: 7, type: 'forward', name: 'cn', url: '1.1.1.1', unknownKey: 'keep' },
    ])
    expect(ID_FIELD in out[0]).toBe(false)
    expect(Object.keys(out[0])).toEqual(['type', 'name', 'url', 'unknownKey'])
    expect(out[0].unknownKey).toBe('keep')
  })

  it('规则行 trim 后丢弃空行', () => {
    const out = buildPayloadResolvers([
      { type: 'forward', rule: ['  a.com  ', '', '   ', 'v2fly:cn'] },
    ])
    expect(out[0].rule).toEqual(['a.com', 'v2fly:cn'])
  })

  it('空 serverIP 条目被丢弃，config 变空后整个删掉', () => {
    const out = buildPayloadResolvers([
      { type: 'forward', url: 'https://d/q', config: { serverIP: ['', '  '] } },
    ])
    expect('config' in out[0]).toBe(false)
  })

  it('config 里还有 timeout 时保留 config，只清掉空 serverIP', () => {
    const out = buildPayloadResolvers([
      { type: 'forward', config: { timeout: '3s', serverIP: ['8.8.8.8', ''] } },
    ])
    expect(out[0].config).toEqual({ timeout: '3s', serverIP: ['8.8.8.8'] })
  })

  it('upstreams 里的 config 同样被清洗，且不改动原对象', () => {
    const src = [
      { type: 'forward-group', upstreams: [{ url: 'u1', config: { serverIP: [''] } }] },
    ]
    const out = buildPayloadResolvers(src)
    expect('config' in out[0].upstreams[0]).toBe(false)
    // 原对象不能被就地清洗——界面还在编辑它
    expect(src[0].upstreams[0].config).toEqual({ serverIP: [''] })
  })

  it('extraConfig 有内容就原样保留，空对象整个删掉', () => {
    const kept = buildPayloadResolvers([{ type: 'file', extraConfig: { domain: 'lan' } }])
    expect(kept[0].extraConfig).toEqual({ domain: 'lan' })

    const dropped = buildPayloadResolvers([{ type: 'file', extraConfig: {} }])
    expect('extraConfig' in dropped[0]).toBe(false)
  })

  // 回归：空串会被后端解成 time.Duration 时炸掉
  // （cannot unmarshal !!str "" into time.Duration），必须在提交前删干净。
  it('空串 timeout 被删掉，不留给后端去解析', () => {
    const out = buildPayloadResolvers([{ type: 'forward', config: { timeout: '  ' } }])
    expect('config' in out[0]).toBe(false)

    const withIP = buildPayloadResolvers([
      { type: 'forward', config: { timeout: '', serverIP: ['8.8.8.8'] } },
    ])
    expect(withIP[0].config).toEqual({ serverIP: ['8.8.8.8'] })
  })

  it('新建的 forward-group 原样提交后不含任何空串 duration', () => {
    const out = buildPayloadResolvers([{ ...blankResolver('forward-group'), [ID_FIELD]: 1 }])
    const upstream = out[0].upstreams[0]
    expect('config' in upstream).toBe(false)
    expect(JSON.stringify(out[0])).not.toContain('timeout')
  })
})

describe('blankResolver', () => {
  it('每种类型都带上 type 字段', () => {
    for (const t of ['forward', 'forward-group', 'preloader', 'filter', 'mock', 'file']) {
      expect(blankResolver(t).type).toBe(t)
    }
  })

  it('forward-group 预置一个 upstream，mock 默认 queryType=[A]', () => {
    expect(blankResolver('forward-group').upstreams).toHaveLength(1)
    expect(blankResolver('mock').queryType).toEqual(['A'])
  })

  it('file 不带 name（schema 里没有）', () => {
    expect('name' in blankResolver('file')).toBe(false)
  })
})

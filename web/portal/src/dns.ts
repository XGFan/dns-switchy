// DNS 应答的纯展示逻辑：把 miekg/dns 序列化出来的 JSON 记录转成表格行。
// 行为与旧 Alpine portal 的 RTYPE_MAP / extractValue 一一对应。

export const RTYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA',
}

/** lookup 表单可选的问题类型（与旧版一致）。 */
export const LOOKUP_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'PTR', 'SRV', 'CAA']

export function rrTypeName(rrtype: number): string {
  return RTYPE_MAP[rrtype] || `TYPE${rrtype}`
}

export function extractValue(rec: any, rrtype: number): string {
  switch (rrtype) {
    case 1:
      return rec.A || ''
    case 28:
      return rec.AAAA || rec.Aaaa || ''
    case 5:
      return rec.Cname || rec.Target || ''
    case 15:
      return (rec.Preference != null ? rec.Preference + ' ' : '') + (rec.Mx || '')
    case 16:
      if (Array.isArray(rec.Txt)) return rec.Txt.join(' ')
      return rec.Txt || ''
    case 2:
      return rec.Ns || ''
    case 6:
      return [
        rec.Ns,
        rec.Mbox,
        'serial=' + (rec.Serial || ''),
        'refresh=' + (rec.Refresh || ''),
        'retry=' + (rec.Retry || ''),
        'expire=' + (rec.Expire || ''),
        'minttl=' + (rec.Minttl || ''),
      ]
        .filter(Boolean)
        .join(' ')
    case 12:
      return rec.Ptr || ''
    case 33:
      return `${rec.Priority || 0} ${rec.Weight || 0} ${rec.Port || 0} ${rec.Target || ''}`
    case 257:
      return (
        (rec.Flag != null ? rec.Flag + ' ' : '') + (rec.Tag ? rec.Tag + ' ' : '') + (rec.Value || '')
      )
    default:
      try {
        return JSON.stringify(rec)
      } catch {
        return String(rec)
      }
  }
}

export interface AnswerRow {
  name: string
  type: string
  ttl: string
  value: string
}

/** 把 /api/query 的 answer.Answer 数组摊成表格行。 */
export function answerRows(answer: any): AnswerRow[] {
  const list = answer && Array.isArray(answer.Answer) ? answer.Answer : []
  return list.map((rec: any) => {
    const hdr = rec.Hdr || {}
    const rrtype = hdr.Rrtype || 0
    return {
      name: hdr.Name || '',
      type: rrTypeName(rrtype),
      ttl: hdr.Ttl != null ? String(hdr.Ttl) : '',
      value: extractValue(rec, rrtype),
    }
  })
}

/** /api/query 的 error 字段可能是字符串、也可能是序列化后的 error 对象。 */
export function errorText(err: unknown): string {
  if (err == null) return ''
  if (typeof err === 'string') return err
  if (typeof err === 'object' && 'message' in (err as any) && (err as any).message) {
    return String((err as any).message)
  }
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

import { describe, expect, it } from 'vitest'
import { answerRows, errorText, extractValue, rrTypeName } from './dns'

describe('rrTypeName', () => {
  it('已知类型给名字，未知类型退化成 TYPEn', () => {
    expect(rrTypeName(1)).toBe('A')
    expect(rrTypeName(65)).toBe('TYPE65')
  })
})

describe('extractValue', () => {
  it('A / AAAA / CNAME', () => {
    expect(extractValue({ A: '1.2.3.4' }, 1)).toBe('1.2.3.4')
    expect(extractValue({ AAAA: '::1' }, 28)).toBe('::1')
    expect(extractValue({ Target: 'x.example.' }, 5)).toBe('x.example.')
  })

  it('MX 带优先级，TXT 数组拼接', () => {
    expect(extractValue({ Preference: 10, Mx: 'mail.example.' }, 15)).toBe('10 mail.example.')
    expect(extractValue({ Txt: ['a', 'b'] }, 16)).toBe('a b')
  })

  it('SRV 四段固定顺序', () => {
    expect(extractValue({ Priority: 1, Weight: 2, Port: 443, Target: 'h.' }, 33)).toBe('1 2 443 h.')
  })

  it('未知类型回退成 JSON', () => {
    expect(extractValue({ Foo: 1 }, 65)).toBe('{"Foo":1}')
  })
})

describe('answerRows', () => {
  it('摊平 Answer 数组', () => {
    const rows = answerRows({
      Answer: [{ Hdr: { Name: 'a.com.', Rrtype: 1, Ttl: 300 }, A: '1.1.1.1' }],
    })
    expect(rows).toEqual([{ name: 'a.com.', type: 'A', ttl: '300', value: '1.1.1.1' }])
  })

  it('没有 answer / Answer 时给空数组', () => {
    expect(answerRows(null)).toEqual([])
    expect(answerRows({})).toEqual([])
  })
})

describe('errorText', () => {
  it('字符串原样，对象取 message，否则 JSON', () => {
    expect(errorText('boom')).toBe('boom')
    expect(errorText({ message: 'timeout' })).toBe('timeout')
    expect(errorText({ code: 2 })).toBe('{"code":2}')
    expect(errorText(null)).toBe('')
  })
})

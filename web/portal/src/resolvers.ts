// resolver 编辑的纯数据层：新建模板 + 提交前的 payload 清洗。
//
// 关键约束：resolver 对象**原样保留**从 GET /api/config 拿到的键与键序（后端靠
// orderedMap 把 JSON 键序还原成 YAML 键序），所以这里一律在原对象上增删字段，
// 不做「按 schema 重建对象」——那会丢掉未知字段和键序。

export type RawResolver = Record<string, any>

/** 「+ Add」菜单里的 resolver 类型（与旧 Alpine 版一致）。 */
export const RESOLVER_TYPES = ['forward', 'forward-group', 'preloader', 'filter', 'mock', 'file']

/** filter / mock 的 queryType 勾选项。 */
export const QUERY_TYPES = [
  'A',
  'AAAA',
  'CNAME',
  'MX',
  'TXT',
  'NS',
  'SOA',
  'PTR',
  'SRV',
  'CAA',
  'HTTPS',
]

/** 有 rule 列表的类型。 */
export const RULE_TYPES = ['forward', 'forward-group', 'preloader', 'filter', 'mock']
/** 有 ttl / break-on-fail 的类型。 */
export const FORWARDISH_TYPES = ['forward', 'forward-group', 'preloader']

export function blankResolver(type: string): RawResolver {
  switch (type) {
    case 'forward':
      return { name: '', type: 'forward', url: '', rule: [] }
    case 'forward-group':
      // 不要 seed `config: {timeout: ''}`：空串会原样进 YAML，后端把 timeout 解成
      // time.Duration 时报 `cannot unmarshal !!str "" into time.Duration`，
      // 于是新建的 forward-group 一存就失败。留空即可，用户填了才有这个键。
      return {
        name: '',
        type: 'forward-group',
        rule: [],
        upstreams: [{ url: '' }],
      }
    case 'preloader':
      return { name: '', type: 'preloader', url: '', rule: [] }
    case 'filter':
      return { name: '', type: 'filter', queryType: [], rule: [] }
    case 'mock':
      return { name: '', type: 'mock', queryType: ['A'], rule: [], answer: '' }
    case 'file':
      return { type: 'file', fileType: 'host', location: '', refreshInterval: '10m' }
    default:
      return { type }
  }
}

/** 前端给每个 resolver 挂的稳定 id，仅用于列表 key，提交前剥掉。 */
export const ID_FIELD = '__id'

// 空串 duration 会让后端 yaml 解析直接失败（`cannot unmarshal !!str "" into
// time.Duration`），所以清洗时按「没填」处理，整个键删掉。
function pruneEmptyConfig(obj: RawResolver): void {
  if (!obj.config || typeof obj.config !== 'object') return
  obj.config = { ...obj.config }
  if (Array.isArray(obj.config.serverIP)) {
    obj.config.serverIP = obj.config.serverIP
      .map((s: any) => (s || '').trim())
      .filter((s: string) => s !== '')
    if (obj.config.serverIP.length === 0) delete obj.config.serverIP
  }
  if (typeof obj.config.timeout === 'string' && obj.config.timeout.trim() === '') {
    delete obj.config.timeout
  }
  if (Object.keys(obj.config).length === 0) delete obj.config
}

/**
 * 提交前清洗：剥掉 __id 与 extraConfig 占位键、trim 规则行并丢弃空行、丢弃空
 * serverIP 条目与随之变空的 config。返回新对象，不改动编辑中的状态。
 */
export function buildPayloadResolvers(resolvers: RawResolver[]): RawResolver[] {
  return resolvers.map((r) => {
    const copy: RawResolver = {}
    for (const k of Object.keys(r)) {
      if (k === ID_FIELD) continue
      copy[k] = r[k]
    }
    if (Array.isArray(copy.rule)) {
      copy.rule = copy.rule
        .map((s: any) => (s == null ? '' : String(s)).trim())
        .filter((s: string) => s !== '')
    }
    pruneEmptyConfig(copy)
    if (Array.isArray(copy.upstreams)) {
      copy.upstreams = copy.upstreams.map((u: RawResolver) => {
        const uc: RawResolver = { ...u }
        pruneEmptyConfig(uc)
        return uc
      })
    }
    // extraConfig 由 ResolverForm 的显式行数组重建，空 key 的行本就不会写进来；
    // 这里只兜底「一个键都不剩」的情况，免得往 YAML 里写一个空 map。
    if (
      copy.extraConfig &&
      typeof copy.extraConfig === 'object' &&
      Object.keys(copy.extraConfig).length === 0
    ) {
      delete copy.extraConfig
    }
    return copy
  })
}

/** 列表里显示的标签：优先 name，没有就用 (type)。 */
export function resolverLabel(r: RawResolver): string {
  return r.name || `(${r.type || '?'})`
}

import { spawn, type ChildProcess } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export const API_KEY = 'e2e-key-abc'
export const HTTP_ADDR = '127.0.0.1:18199'

const repoRoot = path.resolve(import.meta.dirname, '../../..')

/**
 * 编译并起一个真的 dns-switchy：上游用公共 DNS，另外挂一个 mock resolver，
 * 这样 lookup 断言不依赖外网可达。
 */
export async function startServer(): Promise<{ proc: ChildProcess; configPath: string }> {
  const dir = mkdtempSync(path.join(tmpdir(), 'dns-switchy-e2e-'))
  const bin = path.join(dir, 'dns-switchy')
  execFileSync('go', ['build', '-o', bin, '.'], { cwd: repoRoot, stdio: 'inherit' })

  const configPath = path.join(dir, 'config.yaml')
  writeFileSync(
    configPath,
    [
      'addr: "127.0.0.1:15399"',
      'ttl: 5m',
      `http: "${HTTP_ADDR}"`,
      `api_key: "${API_KEY}"`,
      'resolvers:',
      '    - type: mock',
      '      name: fake',
      '      queryType:',
      '        - A',
      '      rule:',
      '        - e2e.example',
      '      answer: 9.9.9.9',
      '    - type: forward',
      '      name: public',
      '      url: 223.5.5.5',
      '',
    ].join('\n')
  )

  const proc = spawn(bin, ['-c', configPath], { stdio: 'ignore' })
  await waitForHttp(`http://${HTTP_ADDR}/panel.js`)
  return { proc, configPath }
}

async function waitForHttp(url: string, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch {
      /* 还没起来 */
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`server did not become ready: ${url}`)
}

import { expect, test } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { API_KEY, startServer } from './server'

let proc: ChildProcess
let configPath: string

test.beforeAll(async () => {
  ;({ proc, configPath } = await startServer())
})

test.afterAll(() => {
  proc?.kill()
})

test('standalone 宿主页挂载 dns-panel，401 后走 key 输入，然后能查能改', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('dns-panel')).toBeAttached()
  await expect(page.getByRole('tab', { name: 'Lookup' })).toBeVisible()

  // ── 未填 key：任何 API 调用都会 401，面板转成 key 输入界面 ──
  await page.getByPlaceholder('example.com').fill('e2e.example')
  await page.getByRole('button', { name: 'Lookup' }).click()
  await expect(page.getByText('需要 API key')).toBeVisible()

  await page.getByPlaceholder('config.yaml 里的 api_key').fill(API_KEY)
  await page.getByRole('button', { name: '保存并重试' }).click()
  await expect(page.getByRole('tab', { name: 'Lookup' })).toBeVisible()

  // key 按契约存在 localStorage['dns.apiKey']
  expect(await page.evaluate(() => localStorage.getItem('dns.apiKey'))).toBe(API_KEY)

  // ── lookup：mock resolver 的固定答案 ──
  await page.getByPlaceholder('example.com').fill('e2e.example')
  await page.getByRole('button', { name: 'Lookup' }).click()
  await expect(page.locator('table.answers')).toContainText('9.9.9.9')
  await expect(page.locator('table.answers')).toContainText('e2e.example.')

  // ── config tab：只读顶栏 + resolver 列表 ──
  await page.getByRole('tab', { name: 'Config' }).click()
  await expect(page.locator('.readonly-bar')).toContainText('127.0.0.1:15399')
  await expect(page.locator('.r-item')).toHaveCount(2)
  await expect(page.locator('.r-item').first()).toContainText('fake')

  // ── 改一个字段并保存，服务端应真的落盘 + 热替换 ──
  await page.locator('.r-item').first().click()
  const nameInput = page.locator('.detail input[type=text]').first()
  await nameInput.fill('fake-renamed')
  await expect(page.getByText('Unsaved changes')).toBeVisible()

  await page.locator('.toolbar').getByRole('button', { name: 'Validate' }).click()
  await expect(page.getByText('Configuration is valid.')).toBeVisible()

  await page.locator('.toolbar').getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Saved. Config reloaded and applied live.')).toBeVisible()

  // 刷新后新名字仍在（说明写盘了，不只是前端状态）
  await page.reload()
  await page.getByRole('tab', { name: 'Config' }).click()
  await expect(page.locator('.r-item').first()).toContainText('fake-renamed')
})

test('dns-card 渲染摘要与快捷查询', async ({ page }) => {
  await page.goto('/')
  // 先把 key 放进去，card 一挂载就要拉 /api/config
  await page.evaluate((k) => localStorage.setItem('dns.apiKey', k), API_KEY)
  await page.evaluate(() => {
    const el = document.createElement('dns-card')
    el.setAttribute('api-base', '/api')
    document.body.appendChild(el)
  })

  const card = page.locator('dns-card')
  await expect(card.locator('.card-stats')).toContainText('127.0.0.1:15399')
  // resolvers 数量（上一个用例可能改过名字，但数量恒为 2）
  await expect(card.locator('.card-stats')).toContainText('2')

  await card.getByPlaceholder('example.com').fill('e2e.example')
  await card.getByRole('button', { name: 'Lookup' }).click()
  // card 上是精简形态：只出一行值，不出表格
  await expect(card.locator('.card-answer')).toHaveText('9.9.9.9')
  await expect(card.locator('table.answers')).toHaveCount(0)
})

test('api-base 属性生效：指错前缀时请求打到那个前缀', async ({ page }) => {
  const seen: string[] = []
  page.on('request', (r) => {
    if (r.url().includes('/wrong-prefix/')) seen.push(r.url())
  })
  await page.goto('/')
  await page.evaluate((k) => localStorage.setItem('dns.apiKey', k), API_KEY)
  await page.evaluate(() => {
    const el = document.createElement('dns-card')
    el.setAttribute('api-base', '/wrong-prefix')
    document.body.appendChild(el)
  })
  await expect.poll(() => seen.length).toBeGreaterThan(0)
  expect(seen[0]).toContain('/wrong-prefix/config')
})

// M2 回归：元素被搬到别的父节点会先 disconnect 再 connect。早先版本在 disconnect 里
// 把 root 置空、再次 connect 时对同一元素二次 attachShadow，抛 NotSupportedError，
// 面板从此永久空白。
test('元素被搬动后仍然工作（shadow root 复用，不二次 attachShadow）', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.goto('/')
  await expect(page.getByRole('tab', { name: 'Lookup' })).toBeVisible()

  await page.evaluate(() => {
    const el = document.querySelector('dns-panel')!
    const box = document.createElement('div')
    document.body.appendChild(box)
    box.appendChild(el) // disconnect + reconnect
  })

  await expect(page.getByRole('tab', { name: 'Lookup' })).toBeVisible()
  await expect(page.getByPlaceholder('example.com')).toBeVisible()
  expect(errors).toEqual([])
})

// M1 回归：保存时撞 401，key 输入界面必须内联出现，**不能**把 ConfigTab 卸掉——
// 那样用户刚编辑的一堆内容会当场蒸发。
test('保存撞 401 时未保存的编辑不丢', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((k) => localStorage.setItem('dns.apiKey', k), API_KEY)
  await page.reload()

  await page.getByRole('tab', { name: 'Config' }).click()
  await page.waitForSelector('.r-item')
  await page.locator('.r-item').first().click()

  const nameInput = page.locator('.detail input[type=text]').first()
  await nameInput.fill('draft-must-survive')
  await expect(page.getByText('Unsaved changes')).toBeVisible()

  // 只让这一次保存返回 401
  await page.route('**/api/config', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"unauthorized"}' })
    } else {
      await route.continue()
    }
  })
  await page.locator('.toolbar').getByRole('button', { name: 'Save' }).click()

  await expect(page.getByText('需要 API key')).toBeVisible()
  // 草稿还在：输入框的值、以及左侧列表里的名字
  await expect(nameInput).toHaveValue('draft-must-survive')
  await expect(page.locator('.r-item').first()).toContainText('draft-must-survive')
  await expect(page.getByText('Unsaved changes')).toBeVisible()
})

// B1 回归：版本冲突后 Save 必须锁死。早先版本会采纳服务端返回的新版本号，
// 用户再点一次 Save 就 200，把别处那次写静默覆盖——乐观锁只挡一次。
test('版本冲突后 Save 被锁死，不能二次覆盖', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((k) => localStorage.setItem('dns.apiKey', k), API_KEY)
  await page.reload()

  await page.getByRole('tab', { name: 'Config' }).click()
  await page.waitForSelector('.r-item')
  await page.locator('.r-item').first().click()
  await page.locator('.detail input[type=text]').first().fill('loser-edit')
  await expect(page.getByText('Unsaved changes')).toBeVisible()

  // 带外改盘：等价于另一个客户端先存了一版
  const before = readFileSync(configPath, 'utf8')
  writeFileSync(configPath, before.replace('9.9.9.9', '8.8.8.8'))

  const toolbarSave = page.locator('.toolbar').getByRole('button', { name: 'Save' })
  await toolbarSave.click()
  await expect(page.getByText('配置已在别处变更')).toBeVisible()

  // 核心断言：两处 Save 都必须不可点
  await expect(toolbarSave).toBeDisabled()
  await expect(page.locator('.detail').getByRole('button', { name: 'Save' })).toBeDisabled()

  // 磁盘上仍是带外那一版，没有被前端覆盖
  expect(readFileSync(configPath, 'utf8')).toContain('8.8.8.8')
  expect(readFileSync(configPath, 'utf8')).not.toContain('loser-edit')

  // 唯一出路：重新加载，草稿丢弃、冲突消失
  await page.getByRole('button', { name: '重新加载（丢弃本地改动）' }).click()
  await expect(page.getByText('配置已在别处变更')).toHaveCount(0)
  await expect(page.locator('.r-item').first()).not.toContainText('loser-edit')
})

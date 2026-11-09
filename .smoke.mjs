import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from './index.js'

const root = await mkdtemp(join(tmpdir(), 'dmp-smoke-'))
await mkdir(join(root, 'identity'), { recursive: true })
await mkdir(join(root, 'user'), { recursive: true })
await mkdir(join(root, 'projects', 'active'), { recursive: true })
await mkdir(join(root, 'raw'), { recursive: true })
await writeFile(join(root, 'SOUL.md'), '# Soul\n\nI am a test.\n', 'utf8')
await writeFile(join(root, 'user', 'profile.md'), '---\ntitle: 用户档案\ntype: user\nsalience: 1\nsummary: 晨，男性，搭档。\n---\n\n# 晨\n', 'utf8')
await writeFile(join(root, 'user', 'preferences.md'), '---\ntitle: 偏好\ntype: user\nsalience: 2\nsummary: 省 token，说话简短。\n---\n\n# 偏好\n', 'utf8')
await writeFile(join(root, 'projects', 'active', 'demo.md'), '---\ntitle: Demo 项目\ntype: project\nsalience: 1\nsummary: 正在验证核心事实注入。\n---\n\n# Demo\n', 'utf8')
await writeFile(join(root, 'identity', 'x.md'), '---\ntitle: X page\ntype: identity\nsalience: 1\nsummary: first summary\n---\n\n# X\n\nHello **world**.\n\n- [soul](../SOUL.md)\n- [missing](../missing.md)\n- [web](https://example.com)\n', 'utf8')
await writeFile(join(root, 'raw', 'secret.md'), '# raw\n', 'utf8')
await mkdir(join(root, 'RAW'), { recursive: true })
await writeFile(join(root, 'RAW', 'Leak.md'), '# leak\n', 'utf8')

const routes = new Map()
let boot = null
const ctx = {
  logger: { info() {} },
  effect(fn) { const dispose = fn(); return dispose },
  inject(_deps, fn) {
    fn({
      ...ctx,
      webServer: { register(route) { routes.set(route.path, route.handler); return () => {} } },
      systemPrompt: {
        context(options) { boot = options; return () => {} },
      },
    })
  },
}
apply(ctx, { memoryDir: root })
assert.ok(boot && typeof boot.text === 'function', 'boot context registered')
const bootText = boot.text()
assert.match(bootText, /长期记忆/)
assert.match(bootText, /### SOUL\.md/)
assert.match(bootText, /I am a test\./)
assert.match(bootText, /### 记忆地图/)
assert.match(bootText, /### 核心事实/)
assert.match(bootText, /晨，男性，搭档。/)
assert.match(bootText, /省 token，说话简短。/)
assert.match(bootText, /Demo 项目/)
assert.match(bootText, /自我/)

async function call(path, { method = 'GET', url = path, body } = {}) {
  const handler = routes.get(path)
  assert.ok(handler, `route ${path} registered`)
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body), 'utf8')]
  const req = {
    method,
    url,
    async *[Symbol.asyncIterator]() { for (const chunk of chunks) yield chunk },
  }
  let status = 0
  let payload = ''
  const res = {
    writeHead(code) { status = code },
    end(text) { payload = String(text) },
  }
  await handler(req, res)
  return { status, json: payload ? JSON.parse(payload) : null }
}

const tree = await call('/api/dsh-memory-panel/tree')
assert.equal(tree.status, 200)
assert.equal(tree.json.exists, true)
assert.equal(tree.json.pages.length, 5)
assert.ok(tree.json.pages.some((p) => p.path === 'identity/x.md' && p.salience === 1 && p.summary === 'first summary'))
assert.ok(!tree.json.pages.some((p) => p.path.startsWith('raw/')))
assert.ok(!tree.json.pages.some((p) => p.path.startsWith('RAW/')))
assert.ok(tree.json.counts.links >= 1, 'counts links')
assert.ok(tree.json.links.some((l) => l.source === 'identity/x.md' && l.target === 'SOUL.md'))
assert.ok(!tree.json.links.some((l) => l.target === 'missing.md' || l.target === 'https://example.com'))
assert.ok(Array.isArray(tree.json.clusters) && tree.json.clusters.length >= 1, 'auto clusters')
assert.ok(tree.json.pages.every((p) => typeof p.cluster === 'string' && p.cluster.length > 0), 'every page classified')
assert.ok(tree.json.clusters.some((c) => c.kind === 'identity'), 'identity facet')

const page = await call('/api/dsh-memory-panel/page', { url: '/api/dsh-memory-panel/page?path=identity%2Fx.md' })
assert.equal(page.status, 200)
assert.match(page.json.content, /Hello \*\*world\*\*/)
assert.equal(page.json.meta.title, 'X page')

const activity = await call('/api/dsh-memory-panel/activity')
assert.equal(activity.status, 200)
assert.ok(activity.json.events.some((event) => event.path === 'identity/x.md' && event.kind === 'read'), 'page read is recorded')

const outside = await call('/api/dsh-memory-panel/page', { url: '/api/dsh-memory-panel/page?path=..%2Fpackage.json' })
assert.equal(outside.status, 404)
assert.match(outside.json.error, /超出记忆库目录/)

const found = await call('/api/dsh-memory-panel/search', { url: '/api/dsh-memory-panel/search?q=hello' })
assert.equal(found.status, 200)
assert.ok(found.json.results.some((hit) => hit.path === 'identity/x.md'))
assert.match(found.json.results[0].snippet, /Hello/)
assert.equal((await call('/api/dsh-memory-panel/search', { url: '/api/dsh-memory-panel/search?q=' })).json.total, 0)

const saved = await call('/api/dsh-memory-panel/page', {
  method: 'POST',
  body: { path: 'identity/x.md', content: '---\ntitle: X page\n---\nupdated\n' },
})
assert.equal(saved.status, 200)
assert.equal(await readFile(join(root, 'identity', 'x.md'), 'utf8'), '---\ntitle: X page\n---\nupdated\n')

const blocked = await call('/api/dsh-memory-panel/page', {
  method: 'POST',
  body: { path: 'raw/secret.md', content: 'nope' },
})
assert.equal(blocked.status, 400)
assert.match(blocked.json.error, /raw/)

const blockedUpper = await call('/api/dsh-memory-panel/page', {
  method: 'POST',
  body: { path: 'RAW/Leak.md', content: 'nope' },
})
assert.equal(blockedUpper.status, 400)
assert.match(blockedUpper.json.error, /raw/)

console.log('smoke: tree/page/save/traversal/raw-guard all ok')
await rm(root, { recursive: true, force: true })

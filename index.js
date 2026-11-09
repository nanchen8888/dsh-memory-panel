/**
 * dsh-memory-panel — host half.
 *
 * Serves a small read/write HTTP API over the user's markdown memory bank
 * (the same layout dsh-plugin-memory maintains: SOUL.md / MEMORY.md /
 * index.md / log.md plus identity/ user/ skills/ decisions/ projects/
 * concepts/ pages). The browser half renders it as a left-sidebar panel.
 *
 * Routes (all under /api/dsh-memory-panel):
 *   GET  /tree                    → { dir, exists, pages, counts }
 *   GET  /page?path=identity/x.md → { path, content, meta, mtime }
 *   POST /page { path, content }  → { ok, path, mtime }
 *   POST /reveal { path? }        → { ok }
 *
 * Writes are confined to the memory directory, markdown files only, and
 * never into raw/ (the read-only evidence layer described by MEMORY.md).
 *
 * @module @local/dsh-memory-panel
 */

import { appendFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { spawn } from 'node:child_process'

export const name = 'memory-panel'

const ROUTE_PREFIX = '/api/dsh-memory-panel'

/** Directory listing for the panel's page tree. */
export const TREE_ROUTE_PATH = `${ROUTE_PREFIX}/tree`
/** Read / write one markdown page. */
export const PAGE_ROUTE_PATH = `${ROUTE_PREFIX}/page`
/** Reveal the memory directory (or one page) in the OS file manager. */
export const REVEAL_ROUTE_PATH = `${ROUTE_PREFIX}/reveal`
/** Full-text search across every memory page. */
export const SEARCH_ROUTE_PATH = `${ROUTE_PREFIX}/search`
/** Recently pulled pages, for the star-map call effects. */
export const ACTIVITY_ROUTE_PATH = `${ROUTE_PREFIX}/activity`
/** Archive old log entries so the injected tail stays small. */
export const COMPACT_ROUTE_PATH = `${ROUTE_PREFIX}/compact`

/** Directories that never show up as memory pages. */
const SKIPPED_DIRS = new Set(['raw', 'node_modules', '.git', '.obsidian', '.trash'])
/** Depth cap for nested page groups (projects/active/foo.md is depth 3). */
const MAX_DEPTH = 3
/** Hard cap so a runaway directory cannot hang the panel. */
const MAX_PAGES = 500
/** Files above this size get no derived summary (still listed). */
const SUMMARY_READ_LIMIT = 512 * 1024
/** Reject oversized edits instead of writing a broken memory page. */
const MAX_WRITE_BYTES = 2 * 1024 * 1024
/** Request bodies are tiny JSON documents. */
const MAX_BODY_BYTES = 3 * 1024 * 1024
/** Files injected into every session, with per-file character caps. */
const BOOT_FILES = [
  { name: 'SOUL.md', cap: 1900 },
  { name: 'MEMORY.md', cap: 3200 },
]
/** Total character budget for the boot block. */
const BOOT_TOTAL = 7200
/** How many recent log headlines ride along with the boot block. */
const RECENT_LOG_COUNT = 3
/** A digest reminder appears once the store has been unwritten this long. */
const DIGEST_AFTER_MS = 120 * 60 * 1000
/** last_access is stamped at most this often per process. */
const TOUCH_INTERVAL_MS = 6 * 60 * 60 * 1000

/**
 * Expand `~`, `%VAR%` and `$VAR` in a user-supplied path.
 *
 * @param {unknown} value
 * @returns {string}
 */
function expandPath(value) {
  if (typeof value !== 'string') return ''
  let text = value.trim()
  if (text.length === 0) return ''
  text = text.replace(/%([A-Za-z0-9_]+)%/g, (match, key) => (
    typeof process.env[key] === 'string' ? process.env[key] : match
  ))
  text = text.replace(/\$\{([A-Za-z0-9_]+)\}|\$([A-Za-z0-9_]+)/g, (match, braced, plain) => {
    const key = braced ?? plain
    return typeof process.env[key] === 'string' ? process.env[key] : match
  })
  if (text === '~') return homedir()
  if (text.startsWith('~/') || text.startsWith('~\\')) return join(homedir(), text.slice(2))
  return text
}

/**
 * Locate the memory bank. The plugin's own config wins; otherwise read
 * `<dshHome>/memory-panel.json`, then fall back to the documented default
 * `~/.memory`. This deliberately does not consult any other memory plugin's
 * settings, so the panel keeps working after they are uninstalled.
 *
 * @param {{ memoryDir?: string } | undefined} config
 * @returns {string}
 */
export function resolveMemoryDir(config) {
  if (config && typeof config.memoryDir === 'string' && config.memoryDir.trim()) {
    return resolve(expandPath(config.memoryDir))
  }
  const candidates = []
  if (typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME) candidates.push(process.env.DSH_HOME)
  candidates.push(join(homedir(), '.dsh'))
  for (const home of candidates) {
    const file = join(home, 'memory-panel.json')
    if (!existsSync(file)) continue
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8'))
      if (parsed && typeof parsed.memoryDir === 'string' && parsed.memoryDir.trim()) {
        return resolve(expandPath(parsed.memoryDir))
      }
    } catch {
      // A malformed config is not fatal: fall through to the default.
    }
  }
  return resolve(join(homedir(), '.memory'))
}

/**
 * Minimal YAML frontmatter reader: `key: value`, quoted scalars and
 * `[a, b]` arrays. Memory pages only use that subset (see MEMORY.md).
 *
 * @param {string} text
 * @returns {{ data: Record<string, unknown>, body: string }}
 */
export function parseFrontmatter(text) {
  const source = String(text).replace(/\r\n?/g, '\n')
  if (!source.startsWith('---\n')) return { data: {}, body: source }
  const end = source.indexOf('\n---', 4)
  if (end === -1) return { data: {}, body: source }
  const head = source.slice(4, end)
  const body = source.slice(end + 4).replace(/^\n/, '')
  /** @type {Record<string, unknown>} */
  const data = {}
  for (const line of head.split('\n')) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (!match) continue
    const key = match[1]
    const raw = match[2].trim()
    if (raw.startsWith('[') && raw.endsWith(']')) {
      data[key] = raw
        .slice(1, -1)
        .split(',')
        .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
      continue
    }
    data[key] = raw.replace(/^['"]|['"]$/g, '')
  }
  return { data, body }
}

/**
 * First readable paragraph, used when a page has no `summary:`.
 *
 * @param {string} body
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export function deriveSummary(body, data) {
  if (typeof data.summary === 'string' && data.summary.trim()) {
    return data.summary.trim().slice(0, 110)
  }
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('<!--') || trimmed.startsWith('#')) continue
    if (trimmed.startsWith('-') || trimmed.startsWith('>')) continue
    if (trimmed.startsWith('|') || trimmed.startsWith('`') || trimmed.startsWith('![')) continue
    const text = trimmed
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim()
    if (text) return text.slice(0, 110)
  }
  return ''
}

/**
 * @param {string} text
 * @returns {string}
 */
function firstHeading(text) {
  for (const line of text.split('\n')) {
    const match = /^#\s+(.+)$/.exec(line.trim())
    if (match) return match[1].trim()
  }
  return ''
}

/**
 * @param {string} root
 * @param {string} rel
 * @returns {string}
 */
function safeResolve(root, rel) {
  if (typeof rel !== 'string' || rel.trim().length === 0) throw new Error('缺少 path')
  if (rel.includes('\0')) throw new Error('非法 path')
  const abs = resolve(root, rel)
  const back = relative(root, abs)
  if (back.length === 0 || back.startsWith('..') || isAbsolute(back)) {
    throw new Error('path 超出记忆库目录')
  }
  if (!abs.toLowerCase().endsWith('.md')) throw new Error('只能读写 .md 文件')
  return abs
}

/**
 * @param {string} rel
 * @returns {string}
 */
function normalizeRel(rel) {
  return String(rel).replace(/\\/g, '/').replace(/^\.\//, '')
}

/** Markdown inline links; only the target is captured. */
const LINK_RE = /\[[^\]\n]*\]\(\s*<?([^)\s>]+)>?\s*\)/g

/**
 * Resolve a markdown link target from one page to another page path.
 * External URLs, anchors and non-markdown files are ignored.
 *
 * @param {string} fromRel
 * @param {string} href
 * @returns {string | null}
 */
function resolveMarkdownLink(fromRel, href) {
  let clean = String(href).trim().replace(/^<|>$/g, '')
  clean = clean.split('#')[0].split('?')[0]
  if (!clean || !/\.md$/i.test(clean)) return null
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith('//')) return null
  const base = clean.startsWith('/') ? [] : String(fromRel).split('/').slice(0, -1)
  for (const part of clean.replace(/^\/+/, '').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      if (base.length === 0) return null
      base.pop()
    } else {
      base.push(part)
    }
  }
  return base.join('/')
}

/**
 * @param {string} rel
 * @returns {boolean}
 */
function isWriteProtected(rel) {
  return normalizeRel(rel).split('/')[0].toLowerCase() === 'raw'
}

/**
 * Recursively collect markdown pages with just enough metadata for the tree.
 *
 * @param {string} dir
 * @param {string} root
 * @param {number} depth
 * @param {Array<Record<string, unknown>>} out
 */
async function walkPages(dir, root, depth, out) {
  if (out.length >= MAX_PAGES) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (out.length >= MAX_PAGES) return
    if (entry.name.startsWith('.')) continue
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name.toLowerCase()) || depth >= MAX_DEPTH) continue
      await walkPages(absolute, root, depth + 1, out)
      continue
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue
    const info = await stat(absolute)
    const rel = normalizeRel(relative(root, absolute))
    let text = ''
    if (info.size <= SUMMARY_READ_LIMIT) {
      text = await readFile(absolute, 'utf8')
    }
    const { data, body } = parseFrontmatter(text)
    const linkRefs = []
    if (body) {
      LINK_RE.lastIndex = 0
      let match
      while ((match = LINK_RE.exec(body)) !== null) {
        const target = resolveMarkdownLink(rel, match[1])
        if (target && target !== rel) linkRefs.push(target)
      }
    }
    const salience = Number(data.salience)
    const title = typeof data.title === 'string' && data.title.trim()
      ? data.title.trim()
      : (firstHeading(body) || entry.name.replace(/\.md$/i, ''))
    out.push({
      path: rel,
      title,
      summary: deriveSummary(body, data),
      type: typeof data.type === 'string' ? data.type : '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      salience: Number.isFinite(salience) && salience >= 1 && salience <= 3 ? salience : 0,
      date: typeof data.date === 'string' ? data.date : '',
      lastAccess: typeof data.last_access === 'string' ? data.last_access : '',
      size: info.size,
      mtime: info.mtime.toISOString(),
      text: body,
      linkRefs,
    })
  }
}

/* -------------------------------------------------------------------------- */
/* Automatic classification                                                    */
/* -------------------------------------------------------------------------- */

/** Pages that describe the memory system itself, not a topic. */
const META_PAGE_PATHS = new Set(['SOUL.md', 'MEMORY.md', 'BOOTSTRAP.md', 'index.md', 'log.md'])
const CJK_RUN_RE = /[\u3400-\u9fff]+/g
const WORD_RUN_RE = /[a-z][a-z0-9_-]{2,}/g
const STOP_WORDS = new Set((
  '的 了 是 在 我 你 他 她 它 们 这 那 和 与 及 或 而 但 就 都 也 又 很 更 最 会 能 要 不 没 有 一个 我们 你们 他们 ' +
  '可以 需要 每次 之间 因为 所以 但是 如果 没有 自己 这个 那个 什么 怎么 已经 还是 就是 只是 不是 以及 然后 ' +
  'the a an is are was were be been to of and or for in on with this that it as at by from not but if then than ' +
  'into over under about after before when where which who how what why can could should would may might will ' +
  '文件 页面 内容 记录 使用 进行 通过 相关 当前 已经 时候 东西 地方 方式 情况'
).split(/\s+/).filter(Boolean))

/** Cluster labels by dominant frontmatter type. */
const TYPE_CLUSTER = {
  identity: { kind: 'identity', label: '自我' },
  user: { kind: 'user', label: '关于你' },
  skill: { kind: 'skill', label: '技能' },
  project: { kind: 'project', label: '项目' },
  decision: { kind: 'decision', label: '决策' },
  concept: { kind: 'concept', label: '概念' },
  fact: { kind: 'fact', label: '事实' },
  meta: { kind: 'meta', label: '元记忆' },
  topic: { kind: 'topic', label: '主题' },
}

/**
 * @param {string} text
 * @param {number} weight
 * @param {Map<string, number>} out
 */
function addTokens(text, weight, out) {
  const source = String(text || '').toLowerCase()
  for (const run of source.match(CJK_RUN_RE) || []) {
    for (let index = 0; index < run.length - 1; index += 1) {
      const token = run.slice(index, index + 2)
      if (STOP_WORDS.has(token)) continue
      out.set(token, (out.get(token) || 0) + weight)
    }
  }
  for (const word of source.match(WORD_RUN_RE) || []) {
    if (STOP_WORDS.has(word)) continue
    out.set(word, (out.get(word) || 0) + weight)
  }
}

/**
 * L2-normalised TF vector for one page. Tags dominate, then title, summary and
 * finally the body; memory pages rarely have tags today, so the body still
 * carries most of the signal.
 *
 * @param {Record<string, any>} page
 * @returns {Map<string, number>}
 */
function pageVector(page) {
  const raw = new Map()
  addTokens(page.title, 4, raw)
  addTokens(page.summary, 3, raw)
  addTokens(Array.isArray(page.tags) ? page.tags.join(' ') : '', 6, raw)
  addTokens(String(page.text || '').slice(0, 9000), 1.4, raw)
  let norm = 0
  for (const value of raw.values()) norm += value * value
  norm = Math.sqrt(norm) || 1
  const vector = new Map()
  for (const [token, value] of raw) vector.set(token, value / norm)
  return vector
}

/**
 * @param {Map<string, number>} a
 * @param {Map<string, number>} b
 * @returns {number}
 */
function cosine(a, b) {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  let dot = 0
  for (const [token, value] of small) {
    const other = large.get(token)
    if (other) dot += value * other
  }
  return dot
}

/**
 * Synchronous page scanner used by the boot block (the async walker feeds the
 * HTTP tree). Keeps the body so classification can read it, unlike /tree.
 *
 * @param {string} dir
 * @param {string} root
 * @param {number} depth
 * @param {Array<Record<string, any>>} out
 */
export function collectPagesSync(dir, root, depth, out) {
  if (out.length >= MAX_PAGES) return
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (out.length >= MAX_PAGES) return
    if (entry.name.startsWith('.')) continue
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name.toLowerCase()) || depth >= MAX_DEPTH) continue
      collectPagesSync(absolute, root, depth + 1, out)
      continue
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue
    let info
    let text = ''
    try {
      info = statSync(absolute)
      if (info.size <= SUMMARY_READ_LIMIT) text = readFileSync(absolute, 'utf8')
    } catch {
      continue
    }
    const rel = normalizeRel(relative(root, absolute))
    const { data, body } = parseFrontmatter(text)
    const linkRefs = []
    if (body) {
      LINK_RE.lastIndex = 0
      let match
      while ((match = LINK_RE.exec(body)) !== null) {
        const target = resolveMarkdownLink(rel, match[1])
        if (target && target !== rel) linkRefs.push(target)
      }
    }
    const salience = Number(data.salience)
    out.push({
      path: rel,
      title: typeof data.title === 'string' && data.title.trim()
        ? data.title.trim()
        : (firstHeading(body) || entry.name.replace(/\.md$/i, '')),
      summary: deriveSummary(body, data),
      type: typeof data.type === 'string' ? data.type : '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      salience: Number.isFinite(salience) && salience >= 1 && salience <= 3 ? salience : 0,
      date: typeof data.date === 'string' ? data.date : '',
      lastAccess: typeof data.last_access === 'string' ? data.last_access : '',
      size: info.size,
      mtime: info.mtime.toISOString(),
      text: body,
      linkRefs,
    })
  }
}

/**
 * Derive a compact set of content clusters. This is deliberately local and
 * deterministic (no model call): token vectors + average-link agglomeration,
 * with page links and shared frontmatter types as small bonuses. Meta pages
 * always form their own cluster.
 *
 * @param {Array<Record<string, any>>} pages
 * @param {Array<{ source: string, target: string }>} links
 * @returns {Array<Record<string, any>>}
 */
export function buildClusters(pages, links) {
  const metaPages = pages.filter((page) => META_PAGE_PATHS.has(String(page.path)))
  const contentPages = pages.filter((page) => !META_PAGE_PATHS.has(String(page.path)))
  const linkKeys = new Set()
  for (const link of links) {
    const pair = [String(link.source), String(link.target)].sort()
    linkKeys.add(`${pair[0]}\u0000${pair[1]}`)
  }

  const nodes = contentPages.map((page) => ({
    page,
    vector: pageVector(page),
    type: String(page.type || ''),
  }))

  /** @type {Array<Array<typeof nodes[number]>>} */
  let clusters = []
  const typedNodes = nodes.filter((node) => node.type)
  if (nodes.length > 0 && typedNodes.length >= Math.ceil(nodes.length * 0.6)) {
    // Most pages carry a frontmatter type: treat the type as the facet, then
    // let untyped pages join whichever facet they resemble most. This is
    // stable across refreshes and avoids splitting "技能" into arbitrary halves.
    const buckets = new Map()
    for (const node of typedNodes) {
      const key = TYPE_CLUSTER[node.type] ? node.type : 'topic'
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(node)
    }
    const centroid = (members) => {
      const sum = new Map()
      for (const node of members) {
        for (const [token, value] of node.vector) sum.set(token, (sum.get(token) || 0) + value)
      }
      let norm = 0
      for (const value of sum.values()) norm += value * value
      norm = Math.sqrt(norm) || 1
      for (const [token, value] of sum) sum.set(token, value / norm)
      return sum
    }
    const centroids = new Map(Array.from(buckets, ([key, members]) => [key, centroid(members)]))
    for (const node of nodes) {
      if (node.type) continue
      let bestKey = 'topic'
      let bestScore = 0.08
      for (const [key, vector] of centroids) {
        const score = cosine(node.vector, vector)
        if (score > bestScore) {
          bestScore = score
          bestKey = key
        }
      }
      if (!buckets.has(bestKey)) buckets.set(bestKey, [])
      buckets.get(bestKey).push(node)
    }
    clusters = Array.from(buckets.values())
  } else if (nodes.length <= 90) {
    clusters = nodes.map((node) => [node])
    const pairKey = (a, b) => {
      const pair = [String(a.page.path), String(b.page.path)].sort()
      return `${pair[0]}\u0000${pair[1]}`
    }
    const similarity = (a, b) => {
      let score = cosine(a.vector, b.vector)
      if (linkKeys.has(pairKey(a, b))) score += 0.24
      if (a.type && a.type === b.type) score += 0.05
      return score
    }
    const average = (left, right) => {
      let total = 0
      for (const a of left) for (const b of right) total += similarity(a, b)
      return total / Math.max(1, left.length * right.length)
    }
    while (clusters.length > 3) {
      let best = null
      for (let i = 0; i < clusters.length; i += 1) {
        for (let j = i + 1; j < clusters.length; j += 1) {
          const score = average(clusters[i], clusters[j])
          if (!best || score > best.score) best = { i, j, score }
        }
      }
      if (!best || best.score < 0.12) break
      const merged = clusters[best.i].concat(clusters[best.j])
      clusters = clusters.filter((_, index) => index !== best.i && index !== best.j)
      clusters.push(merged)
    }
    while (clusters.length > 6) {
      let smallest = 0
      for (let i = 1; i < clusters.length; i += 1) {
        if (clusters[i].length < clusters[smallest].length) smallest = i
      }
      let target = -1
      let bestScore = -1
      for (let i = 0; i < clusters.length; i += 1) {
        if (i === smallest) continue
        const score = average(clusters[i], clusters[smallest])
        if (score > bestScore) {
          bestScore = score
          target = i
        }
      }
      if (target < 0) break
      const merged = clusters[target].concat(clusters[smallest])
      clusters = clusters.filter((_, index) => index !== smallest && index !== target)
      clusters.push(merged)
    }
  } else {
    // Very large banks: fall back to type/folder facets instead of O(n^3).
    const buckets = new Map()
    for (const node of nodes) {
      const key = node.type || String(node.page.path).split('/')[0] || 'fact'
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(node)
    }
    clusters = Array.from(buckets.values())
  }

  const folderLabel = (path) => {
    const top = String(path).includes('/') ? String(path).split('/')[0] : ''
    return { skills: '技能', projects: '项目', identity: '自我', user: '关于你', decisions: '决策', concepts: '概念' }[top] || ''
  }
  const describe = (members) => {
    const typeCount = new Map()
    const tagCount = new Map()
    const folderCount = new Map()
    for (const { page } of members) {
      const type = String(page.type || '').toLowerCase()
      if (type) typeCount.set(type, (typeCount.get(type) || 0) + 1)
      for (const tag of Array.isArray(page.tags) ? page.tags : []) {
        const clean = String(tag).trim()
        if (clean) tagCount.set(clean, (tagCount.get(clean) || 0) + 1)
      }
      const folder = folderLabel(page.path)
      if (folder) folderCount.set(folder, (folderCount.get(folder) || 0) + 1)
    }
    const top = (map) => Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]
    const type = top(typeCount)
    if (type && TYPE_CLUSTER[type[0]] && type[1] >= Math.ceil(members.length * 0.6)) {
      return TYPE_CLUSTER[type[0]]
    }
    const tag = top(tagCount)
    if (tag) return { kind: 'topic', label: tag[0] }
    const folder = top(folderCount)
    if (folder) {
      const mapped = { 技能: 'skill', 项目: 'project', 自我: 'identity', 关于你: 'user', 决策: 'decision', 概念: 'concept' }[folder[0]]
      if (mapped) return { kind: mapped, label: folder[0] }
      return { kind: 'topic', label: folder[0] }
    }
    return { kind: 'topic', label: '综合' }
  }

  const result = []
  if (metaPages.length > 0) {
    for (const page of metaPages) {
      page.cluster = 'cluster-meta'
      page.clusterKind = 'meta'
      page.clusterLabel = '元记忆'
    }
    result.push({
      key: 'cluster-meta',
      kind: 'meta',
      label: '元记忆',
      pages: metaPages.map((page) => page.path),
    })
  }
  const ordered = clusters
    .map((members) => ({ members, ...describe(members) }))
    .sort((a, b) => b.members.length - a.members.length || a.label.localeCompare(b.label))
  for (const cluster of ordered) {
    const key = `cluster-${result.length}`
    for (const { page } of cluster.members) {
      page.cluster = key
      page.clusterKind = cluster.kind
      page.clusterLabel = cluster.label
    }
    result.push({
      key,
      kind: cluster.kind,
      label: cluster.label,
      pages: cluster.members.map(({ page }) => String(page.path)),
    })
  }

  // Heat drives "what should the agent read first": salience, link degree and
  // recency, with a small boost for the meta pages that frame everything else.
  const degree = new Map()
  for (const link of links) {
    degree.set(link.source, (degree.get(link.source) || 0) + 1)
    degree.set(link.target, (degree.get(link.target) || 0) + 1)
  }
  const now = Date.now()
  for (const page of pages) {
    const age = Math.max(0, now - Date.parse(page.mtime || '')) / 86400000
    const fresh = age <= 3 ? 10 : age <= 14 ? 6 : age <= 60 ? 3 : 0
    page.heat = (Number(page.salience) || 0) * 14
      + Math.min(8, degree.get(page.path) || 0) * 4
      + fresh
      + (META_PAGE_PATHS.has(String(page.path)) ? 8 : 0)
  }
  for (const cluster of result) {
    cluster.heat = cluster.pages.reduce((sum, path) => {
      const page = pages.find((item) => item.path === path)
      return sum + (Number(page?.heat) || 0)
    }, 0)
  }
  return result
}

/**
 * Build the page → cluster attachments and cluster list in one call.
 *
 * @param {Array<Record<string, any>>} pages
 * @param {Array<{ source: string, target: string }>} links
 * @returns {Array<Record<string, any>>}
 */
function classifyPages(pages, links) {
  return buildClusters(pages, links)
}

/**
 * Render a compact, auto-generated reading map for the boot block. Replaces the
 * hand-maintained index.md injection: every page appears exactly once, grouped
 * by content rather than folder, with the hottest pages summarised first.
 *
 * @param {string} dir
 * @returns {string}
 */
function renderMemoryMap(dir) {
  const pages = []
  collectPagesSync(dir, dir, 0, pages)
  if (pages.length === 0) return ''
  const known = new Set(pages.map((page) => String(page.path)))
  const links = []
  const seen = new Set()
  for (const page of pages) {
    for (const target of page.linkRefs || []) {
      if (!known.has(target) || target === page.path) continue
      const pair = [String(page.path), String(target)].sort()
      const key = `${pair[0]}\u0000${pair[1]}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push({ source: String(page.path), target: String(target) })
    }
  }
  const clusters = classifyPages(pages, links)
  const byPath = new Map(pages.map((page) => [String(page.path), page]))
  const lines = []
  for (const cluster of clusters) {
    const titles = cluster.pages
      .map((path) => byPath.get(path)?.title || path)
      .slice(0, 9)
      .join('、')
    lines.push(`- **${cluster.label}**（${cluster.pages.length}）：${titles}`)
  }
  const hot = pages
    .filter((page) => !META_PAGE_PATHS.has(String(page.path)))
    .sort((a, b) => (b.heat || 0) - (a.heat || 0))
    .slice(0, 4)
    .map((page) => `- ${page.title}（${page.path}）${page.summary ? `：${String(page.summary).slice(0, 64)}` : ''}`)
  return [
    '### 记忆地图（按内容自动分类，不按目录）',
    '',
    ...lines,
    '',
    '### 先读这些（按热度）',
    '',
    ...hot,
  ].join('\n')
}

/**
 * The two or three facts that shape almost every reply: who the user is,
 * how they like to be worked with, and what is currently being built.
 * Kept short on purpose — details stay in their pages.
 *
 * @param {string} dir
 * @returns {string}
 */
function renderCoreFacts(dir) {
  const lines = []
  const summaryOf = (rel) => {
    try {
      const text = normalizeNewlines(readFileSync(join(dir, rel), 'utf8'))
      const { data, body } = parseFrontmatter(text)
      return deriveSummary(body, data)
    } catch {
      return ''
    }
  }
  const profile = summaryOf('user/profile.md')
  if (profile) lines.push(`- **晨**：${profile}`)
  const preferences = summaryOf('user/preferences.md')
  if (preferences) lines.push(`- **协作偏好**：${preferences}`)
  try {
    const activeDir = join(dir, 'projects', 'active')
    const newest = readdirSync(activeDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => ({ name: entry.name, mtime: statSync(join(activeDir, entry.name)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)[0]
    if (newest) {
      const text = normalizeNewlines(readFileSync(join(activeDir, newest.name), 'utf8'))
      const { data, body } = parseFrontmatter(text)
      const title = String(data.title || newest.name.replace(/\.md$/, ''))
      const summary = deriveSummary(body, data)
      lines.push(`- **当前项目**：${title}${summary ? ` — ${summary}` : ''}`)
    }
  } catch {
    /* no active project yet */
  }
  return lines.length > 0 ? `### 核心事实\n\n${lines.join('\n')}` : ''
}

/**
 * @param {string} text
 * @returns {string}
 */
function normalizeNewlines(text) {
  return String(text).replace(/\r\n?/g, '\n')
}

/**
 * Read a file and cap it at `maxChars`, noting truncation when applied.
 *
 * @param {string} path
 * @param {number} maxChars
 * @returns {string | undefined}
 */
function readCapped(path, maxChars) {
  if (!existsSync(path)) return undefined
  let text
  try {
    text = normalizeNewlines(readFileSync(path, 'utf8'))
  } catch {
    return undefined
  }
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars)}\n\n…（文件过长，已截断：${text.length} 字符，仅注入前 ${maxChars} 字符。需要完整内容时读取 ${path}）\n`
}

/**
 * Read the **last** `maxChars` characters — log.md is append-only, so the
 * head is ancient history.
 *
 * @param {string} path
 * @param {number} maxChars
 * @returns {string | undefined}
 */
function readTailCapped(path, maxChars) {
  if (!existsSync(path)) return undefined
  try {
    const text = normalizeNewlines(readFileSync(path, 'utf8'))
    return text.length <= maxChars ? text : text.slice(text.length - maxChars)
  } catch {
    return undefined
  }
}

/**
 * @param {string} logText
 * @param {number} count
 * @returns {string[]}
 */
function parseLogEntries(logText, count) {
  const entries = []
  for (const line of String(logText || '').split('\n')) {
    if (line.startsWith('## [')) entries.push(line.slice(3).trim())
  }
  return entries.slice(-count)
}

/** Split log.md into its preamble and one block per `## [` entry. */
function splitLogBlocks(logText) {
  const preamble = []
  const blocks = []
  let current = null
  for (const line of normalizeNewlines(logText).split('\n')) {
    if (line.startsWith('## [')) {
      if (current) blocks.push(current)
      current = { header: line, body: [] }
    } else if (current) {
      current.body.push(line)
    } else {
      preamble.push(line)
    }
  }
  if (current) blocks.push(current)
  return { preamble, blocks }
}

/**
 * Move entries older than `retainDays` out of log.md and into
 * archive/log-YYYY.md. This is the cheap, reviewable half of "compress the
 * memory bank": the file stays markdown, nothing is deleted, and the injected
 * log tail stops growing forever. Returns what happened so the panel can show it.
 *
 * @param {string} dir
 * @param {number} retainDays
 */
export async function compactLog(dir, retainDays = 45) {
  const logPath = join(dir, 'log.md')
  if (!existsSync(logPath)) return { changed: false, reason: 'no log.md' }
  const before = normalizeNewlines(readFileSync(logPath, 'utf8'))
  const { preamble, blocks } = splitLogBlocks(before)
  const cutoff = new Date(Date.now() - retainDays * 86400000).toISOString().slice(0, 10)
  const old = []
  const keep = []
  for (const block of blocks) {
    const match = /^## \[(\d{4}-\d{2}-\d{2})\]/.exec(block.header)
    const date = match ? match[1] : ''
    if (date && date < cutoff) old.push({ ...block, date })
    else keep.push(block)
  }
  if (old.length === 0) {
    return {
      changed: false,
      archivedEntries: 0,
      retainedEntries: keep.length,
      bytesBefore: Buffer.byteLength(before, 'utf8'),
      bytesAfter: Buffer.byteLength(before, 'utf8'),
    }
  }
  const archiveDir = join(dir, 'archive')
  await mkdir(archiveDir, { recursive: true })
  const byYear = new Map()
  for (const block of old) {
    const year = block.date.slice(0, 4)
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year).push(block)
  }
  const archiveNames = []
  for (const [year, list] of byYear) {
    const file = join(archiveDir, `log-${year}.md`)
    const chunk = list.map((block) => `${block.header}\n${block.body.join('\n').trimEnd()}`).join('\n\n')
    const head = existsSync(file) ? '\n\n' : `# 归档日志 ${year}\n\n> 由记忆面板按保留期归档，原文未修改。\n\n`
    await appendFile(file, `${head}${chunk}\n`, 'utf8')
    archiveNames.push(`archive/log-${year}.md`)
  }
  const today = new Date().toISOString().slice(0, 10)
  const pointer = `> 更早的 ${old.length} 条记录已归档到 ${archiveNames.join('、')}（压缩于 ${today}，保留最近 ${retainDays} 天）。`
  const keptText = keep
    .map((block) => `${block.header}\n${block.body.join('\n').trimEnd()}`)
    .join('\n\n')
  const prefix = preamble.join('\n').trimEnd()
  const next = `${prefix}\n\n${pointer}\n\n${keptText}\n`
  await writeFile(logPath, next, 'utf8')
  return {
    changed: true,
    archivedEntries: old.length,
    retainedEntries: keep.length,
    archivedFiles: archiveNames,
    bytesBefore: Buffer.byteLength(before, 'utf8'),
    bytesAfter: Buffer.byteLength(next, 'utf8'),
    cutoff,
  }
}

/**
 * Latest mtime of the append-only digest marker. `log.md` is the one file every
 * digest must touch, and it is not rewritten by `stampBootAccess`, so it is a
 * faithful "last real store write" signal (index.md gets a last_access stamp).
 *
 * @param {string} dir
 * @returns {number} epoch ms, 0 when neither exists
 */
function lastStoreWriteMs(dir) {
  let latest = 0
  for (const name of ['log.md']) {
    const path = join(dir, name)
    if (!existsSync(path)) continue
    try {
      latest = Math.max(latest, statSync(path).mtimeMs)
    } catch {
      // unreadable marker: treat as missing
    }
  }
  return latest
}

/**
 * Rewrite (or insert) `last_access` in a page's frontmatter. Returns null
 * when the page has no frontmatter or is already up to date.
 *
 * @param {string} text
 * @param {string} today
 * @returns {string | null}
 */
function withLastAccess(text, today) {
  const source = normalizeNewlines(text)
  if (!source.startsWith('---\n')) return null
  const end = source.indexOf('\n---', 4)
  if (end === -1) return null
  const head = source.slice(4, end)
  const current = /^last_access:\s*(.*)$/m.exec(head)
  if (current && current[1].trim() === today) return null
  const nextHead = current
    ? head.replace(/^last_access:.*$/m, `last_access: ${today}`)
    : `${head}\nlast_access: ${today}`
  return `${source.slice(0, 4)}${nextHead}${source.slice(end)}`
}

/** Throttled "these pages were actually read at boot" marker. */
let lastTouchAt = 0

/** In-process record of the pages the memory system actually pulled in. */
const ACTIVITY_LIMIT = 80
const activityLog = []

/**
 * Record a memory access for the star-map call effects.
 *
 * @param {string[]} paths
 * @param {'boot' | 'read'} kind
 */
export function noteActivity(paths, kind) {
  const at = Date.now()
  for (const path of paths) {
    if (typeof path !== 'string' || path.length === 0) continue
    activityLog.push({ path, at, kind })
  }
  if (activityLog.length > ACTIVITY_LIMIT) {
    activityLog.splice(0, activityLog.length - ACTIVITY_LIMIT)
  }
}

function recentActivity(since) {
  const floor = Number.isFinite(since) ? since : 0
  return activityLog.filter((event) => event.at > floor)
}

/**
 * Stamp `last_access` on the pages the boot block actually injected.
 *
 * @param {string} dir
 * @returns {Promise<void>}
 */
async function stampBootAccess(dir) {
  const now = Date.now()
  if (now - lastTouchAt < TOUCH_INTERVAL_MS) return
  lastTouchAt = now
  const today = new Date().toISOString().slice(0, 10)
  for (const file of BOOT_FILES) {
    const path = join(dir, file.name)
    if (!existsSync(path)) continue
    try {
      const text = await readFile(path, 'utf8')
      const next = withLastAccess(text, today)
      if (next !== null) await writeFile(path, next, 'utf8')
    } catch {
      // Stamping is bookkeeping; never break prompt construction over it.
    }
  }
  noteActivity(BOOT_FILES.map((file) => file.name), 'boot')
}

/**
 * Render the memory snapshot injected into every session. Mirrors the
 * protocol dsh-plugin-memory established (SOUL + schema + routing table +
 * recent log), but stays self-contained so this plugin can replace it.
 *
 * @param {string} dir
 * @returns {string}
 */
function renderBootBlock(dir) {
  const sections = []
  for (const file of BOOT_FILES) {
    const text = readCapped(join(dir, file.name), file.cap)
    if (text === undefined || text.trim().length === 0) continue
    sections.push(`### ${file.name}\n\n${text}`)
  }
  if (sections.length === 0) return ''

  const core = renderCoreFacts(dir)
  if (core) sections.push(core)

  const map = renderMemoryMap(dir)
  if (map) sections.push(map)

  const logEntries = parseLogEntries(readTailCapped(join(dir, 'log.md'), 4096) || '', RECENT_LOG_COUNT)
  if (logEntries.length > 0) {
    sections.push(`### 最近动态（log.md 末尾 ${logEntries.length} 条）\n\n${logEntries.map((entry) => `- ${entry}`).join('\n')}`)
  }

  const stale = Date.now() - lastStoreWriteMs(dir)
  const reminder = stale > DIGEST_AFTER_MS
    ? `### 记忆待沉淀\n\n距上次写库约 ${Math.max(1, Math.round(stale / 60000))} 分钟。若本会话已有值得留存的内容，现在写回；若确实没有，在 log.md 记一条「无新增」并说明原因。`
    : ''

  const header = `长期记忆（dsh-memory-panel）。记忆库位于 ${dir}。这是你跨会话的持久人格与记忆：以它为准，先读完再回复用户。若与当前对话冲突，优先相信用户的最新表述，并把差异写回记忆。**每次会话收尾前必须执行 memory digest：把本会话关键沉淀写回（更新页面 + index.md + 追加 log.md）。** 面板在左侧栏「记忆」，可看星图与全文检索。`

  let result = `${header}\n\n${sections.join('\n\n---\n\n')}`
  if (reminder) result += `\n\n---\n\n${reminder}`
  if (result.length > BOOT_TOTAL) {
    result = `${result.slice(0, BOOT_TOTAL)}\n\n…（boot 块超出预算，已截断）`
  }
  return result
}

/**
 * Strip the most common markdown noise so a search snippet reads as prose.
 *
 * @param {string} text
 * @returns {string}
 */
function cleanSnippet(text) {
  return String(text)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * @param {string} body
 * @param {number} index
 * @param {number} radius
 * @returns {string}
 */
function makeSnippet(body, index, radius = 90) {
  const start = Math.max(0, index - radius)
  const end = Math.min(body.length, index + radius + 90)
  const slice = body.slice(start, end)
  const cleaned = cleanSnippet(slice)
  return `${start > 0 ? '…' : ''}${cleaned}${end < body.length ? '…' : ''}`
}

/**
 * Recursively collect markdown files for search.
 *
 * @param {string} dir
 * @param {string} root
 * @param {number} depth
 * @param {Array<{ rel: string, abs: string, size: number }>} out
 */
async function collectPages(dir, root, depth, out) {
  if (out.length >= MAX_PAGES) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (out.length >= MAX_PAGES) return
    if (entry.name.startsWith('.')) continue
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name.toLowerCase()) || depth >= MAX_DEPTH) continue
      await collectPages(absolute, root, depth + 1, out)
      continue
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue
    const info = await stat(absolute)
    out.push({ rel: normalizeRel(relative(root, absolute)), abs: absolute, size: info.size })
  }
}

/**
 * Full-text search over titles, summaries and bodies. Every term must
 * appear somewhere in the page; ranking favours title hits.
 *
 * @param {string} root
 * @param {string} rawQuery
 * @param {number} limit
 * @returns {Promise<{ query: string, total: number, results: Array<Record<string, unknown>> }>}
 */
async function searchPages(root, rawQuery, limit) {
  const query = String(rawQuery || '').trim()
  const terms = Array.from(new Set(query.toLowerCase().split(/\s+/).filter(Boolean))).slice(0, 6)
  if (terms.length === 0) return { query, total: 0, results: [] }

  const files = []
  await collectPages(root, root, 0, files)
  const results = []
  for (const file of files) {
    if (file.size > SUMMARY_READ_LIMIT) continue
    let text
    try {
      text = await readFile(file.abs, 'utf8')
    } catch {
      continue
    }
    const { data, body } = parseFrontmatter(text)
    const title = typeof data.title === 'string' && data.title.trim()
      ? data.title.trim()
      : (firstHeading(body) || file.rel.split('/').pop().replace(/\.md$/i, ''))
    const summary = deriveSummary(body, data)
    const haystack = `${title}\n${summary}\n${file.rel}\n${body}`.toLowerCase()
    if (!terms.every((term) => haystack.includes(term))) continue

    const titleLower = title.toLowerCase()
    const summaryLower = summary.toLowerCase()
    const bodyLower = body.toLowerCase()
    let score = 0
    for (const term of terms) {
      if (titleLower.includes(term)) score += 30
      if (titleLower === term) score += 20
      if (summaryLower.includes(term)) score += 12
      if (file.rel.toLowerCase().includes(term)) score += 6
      const occurrences = bodyLower.split(term).length - 1
      score += Math.min(12, occurrences * 3)
    }
    let at = bodyLower.indexOf(terms[0])
    if (at < 0) at = 0
    const line = body.slice(0, at).split('\n').length
    const salience = Number(data.salience)
    results.push({
      path: file.rel,
      title,
      summary,
      salience: Number.isFinite(salience) && salience >= 1 && salience <= 3 ? salience : 0,
      snippet: makeSnippet(body, at),
      line,
      score,
    })
  }
  results.sort((a, b) => (b.score - a.score) || String(a.title).localeCompare(String(b.title)))
  return { query, total: results.length, results: results.slice(0, Math.max(1, Math.min(100, limit))) }
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} payload
 */
function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<Record<string, unknown>>}
 */
async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('请求体过大')
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text.trim()) return {}
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('请求体必须是 JSON 对象')
  return parsed
}

/**
 * @param {string} target
 * @param {boolean} isFile
 */
function revealInFileManager(target, isFile) {
  const os = platform()
  let command
  let args
  if (os === 'win32') {
    command = 'explorer.exe'
    args = isFile ? [`/select,${target}`] : [target]
  } else if (os === 'darwin') {
    command = 'open'
    args = isFile ? ['-R', target] : [target]
  } else {
    command = 'xdg-open'
    args = [isFile ? dirname(target) : target]
  }
  try {
    const child = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true })
    child.on('error', () => {})
    child.unref()
  } catch {
    // Revealing is a convenience; never fail the request over it.
  }
}

/**
 * Cordis plugin entry.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{ memoryDir?: string } | undefined} config
 */
export function apply(ctx, config) {
  const memoryDir = resolveMemoryDir(config)
  ctx.logger?.info(`memory-panel: serving ${memoryDir}`)

  // Boot injection: the persona, the schema and the routing table must reach
  // the model even after other memory plugins are uninstalled. The host dedupes
  // unchanged projections, so a still store costs nothing after the first turn.
  ctx.inject(['systemPrompt'], (promptCtx) => {
    const dispose = promptCtx.systemPrompt.context({
      name: 'memory-panel-boot',
      order: -200,
      text: () => {
        try {
          const block = renderBootBlock(memoryDir)
          if (block) void stampBootAccess(memoryDir).catch(() => {})
          return block
        } catch (error) {
          ctx.logger?.warn?.(`memory-panel: boot block failed: ${messageOf(error)}`)
          return ''
        }
      },
    })
    promptCtx.effect(() => dispose, 'memory-panel: boot')
  })

  // Headless deployments have no webServer; the panel is a web feature.
  ctx.inject(['webServer'], (webCtx) => {
    const register = (path, handler) => {
      const dispose = webCtx.webServer.register({ kind: 'exact', path, handler })
      webCtx.effect(() => dispose, `memory-panel: ${path}`)
    }

    register(TREE_ROUTE_PATH, async (req, res) => {
      if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method not allowed' })
        return
      }
      try {
        const exists = existsSync(memoryDir)
        /** @type {Array<Record<string, unknown>>} */
        const pages = []
        if (exists) await walkPages(memoryDir, memoryDir, 0, pages)
        pages.sort((a, b) => String(a.path).localeCompare(String(b.path)))
        const known = new Set(pages.map((page) => String(page.path)))
        const seen = new Set()
        /** @type {Array<{ source: string, target: string }>} */
        const links = []
        for (const page of pages) {
          const refs = Array.isArray(page.linkRefs) ? page.linkRefs : []
          for (const target of refs) {
            if (!known.has(target) || target === page.path) continue
            const pair = [String(page.path), String(target)].sort()
            const key = `${pair[0]}\u0000${pair[1]}`
            if (seen.has(key)) continue
            seen.add(key)
            links.push({ source: String(page.path), target: String(target) })
          }
        }
        const clusters = classifyPages(pages, links)
        for (const page of pages) {
          delete page.linkRefs
          delete page.text
        }
        const counts = {
          pages: pages.length,
          hot: pages.filter((page) => page.salience === 1).length,
          links: links.length,
          clusters: clusters.length,
          updated: pages.reduce((latest, page) => (
            String(page.mtime) > latest ? String(page.mtime) : latest
          ), ''),
        }
        sendJson(res, 200, { dir: memoryDir, exists, pages, links, clusters, counts })
      } catch (error) {
        sendJson(res, 500, { error: messageOf(error) })
      }
    })

    register(PAGE_ROUTE_PATH, async (req, res) => {
      if (req.method === 'GET') {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost')
          const rel = normalizeRel(url.searchParams.get('path') ?? '')
          const absolute = safeResolve(memoryDir, rel)
          const info = await stat(absolute)
          if (!info.isFile()) throw new Error('不是文件')
          const content = await readFile(absolute, 'utf8')
          const { data } = parseFrontmatter(content)
          noteActivity([rel], 'read')
          sendJson(res, 200, { path: rel, content, meta: data, mtime: info.mtime.toISOString() })
        } catch (error) {
          sendJson(res, 404, { error: messageOf(error) })
        }
        return
      }
      if (req.method === 'POST') {
        try {
          const body = await readJsonBody(req)
          const rel = normalizeRel(typeof body.path === 'string' ? body.path : '')
          if (typeof body.content !== 'string') throw new Error('content 必须是字符串')
          if (Buffer.byteLength(body.content, 'utf8') > MAX_WRITE_BYTES) throw new Error('文件过大')
          if (isWriteProtected(rel)) throw new Error('raw/ 是只读证据层，不能从面板写入')
          const absolute = safeResolve(memoryDir, rel)
          const info = await stat(absolute)
          if (!info.isFile()) throw new Error('不是文件')
          await writeFile(absolute, body.content, 'utf8')
          const after = await stat(absolute)
          sendJson(res, 200, { ok: true, path: rel, mtime: after.mtime.toISOString() })
        } catch (error) {
          sendJson(res, 400, { error: messageOf(error) })
        }
        return
      }
      sendJson(res, 405, { error: 'method not allowed' })
    })

    register(SEARCH_ROUTE_PATH, async (req, res) => {
      if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method not allowed' })
        return
      }
      try {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const query = url.searchParams.get('q') ?? ''
        const limit = Number(url.searchParams.get('limit') ?? 40)
        sendJson(res, 200, await searchPages(memoryDir, query, Number.isFinite(limit) ? limit : 40))
      } catch (error) {
        sendJson(res, 500, { error: messageOf(error) })
      }
    })

    register(ACTIVITY_ROUTE_PATH, async (req, res) => {
      if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method not allowed' })
        return
      }
      try {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const since = Number(url.searchParams.get('since') ?? 0)
        sendJson(res, 200, {
          now: Date.now(),
          events: recentActivity(Number.isFinite(since) ? since : 0),
        })
      } catch (error) {
        sendJson(res, 500, { error: messageOf(error) })
      }
    })

    register(COMPACT_ROUTE_PATH, async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method not allowed' })
        return
      }
      try {
        const body = await readJsonBody(req)
        const days = Number(body.retainDays ?? 45)
        const retainDays = Number.isFinite(days) ? Math.min(3650, Math.max(7, Math.round(days))) : 45
        sendJson(res, 200, await compactLog(memoryDir, retainDays))
      } catch (error) {
        sendJson(res, 500, { error: messageOf(error) })
      }
    })

    register(REVEAL_ROUTE_PATH, async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'method not allowed' })
        return
      }
      try {
        const body = await readJsonBody(req)
        if (typeof body.path === 'string' && body.path.trim()) {
          const absolute = safeResolve(memoryDir, normalizeRel(body.path))
          const info = await stat(absolute)
          revealInFileManager(absolute, info.isFile())
        } else {
          revealInFileManager(memoryDir, false)
        }
        sendJson(res, 200, { ok: true })
      } catch (error) {
        sendJson(res, 400, { error: messageOf(error) })
      }
    })
  })
}

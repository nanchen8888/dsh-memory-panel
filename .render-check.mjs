import fs from 'node:fs'

globalThis.requestAnimationFrame = () => 1
globalThis.cancelAnimationFrame = () => {}

function makeReact() {
  const store = []
  let index = 0
  let pending = []
  const api = {
    begin() { index = 0; pending = [] },
    reset() { store.length = 0; index = 0; pending = [] },
    flush() {
      const queued = pending
      pending = []
      for (const fn of queued) fn()
    },
    createElement(type, props, ...children) {
      return { type, props: props || {}, children: children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false) }
    },
    useState(initial) {
      const slot = index++
      if (!(slot in store)) store[slot] = typeof initial === 'function' ? initial() : initial
      return [store[slot], (next) => { store[slot] = typeof next === 'function' ? next(store[slot]) : next }]
    },
    useMemo(fn) { index += 1; return fn() },
    useEffect(fn) { index += 1; pending.push(fn) },
    useRef(value) {
      const slot = index++
      if (!(slot in store)) store[slot] = { current: value }
      return store[slot]
    },
    useCallback(fn) { index += 1; return fn },
  }
  return api
}

let plugin = null
const fakeWindow = {
  __ModuleLoader__: {
    load(spec) { plugin = spec },
  },
}
let src = fs.readFileSync('client.js', 'utf8')
src = src.replace(
  "return { inject: ['slots', 'locale'], apply }",
  "return { inject: ['slots', 'locale'], apply, __test: { GraphView, MemoryPanel } }"
)
if (!src.includes('__test')) throw new Error('test hook injection failed')
new Function('window', 'require', src)(fakeWindow, (name) => {
  if (name === 'react') return makeReact()
  throw new Error(`unexpected require ${name}`)
})
const React = makeReact()
const mod = plugin.factory((name) => {
  if (name === 'react') return React
  throw new Error(`unexpected require ${name}`)
})
const { GraphView, MemoryPanel } = mod.__test
const t = (key) => key

const pages = [
  { path: 'SOUL.md', title: 'SOUL', summary: 'persona', salience: 1, mtime: '2026-11-09' },
  { path: 'identity/lan.md', title: 'Lan', summary: 'self', salience: 1, mtime: '2026-11-08' },
  { path: 'skills/voice.md', title: 'voice', summary: 'tts', salience: 2, mtime: '2026-11-07' },
]
const links = [
  { source: 'identity/lan.md', target: 'SOUL.md' },
  { source: 'SOUL.md', target: 'skills/voice.md' },
]

React.reset()
GraphView({ pages, links, selected: 'SOUL.md', onSelect() {}, filter: '', matchPaths: null, t })
React.flush()
React.begin()
const graph = GraphView({ pages, links, selected: 'SOUL.md', onSelect() {}, filter: '', matchPaths: null, t })
const flat = JSON.stringify(graph)
if (!flat.includes('SOUL')) throw new Error('graph labels missing')
if (!flat.includes('dmp-milky')) throw new Error('milky-way band missing')
if (!flat.includes('dmp-star-')) throw new Error('system star gradients missing')
if (!flat.includes('dmp-star')) throw new Error('star field missing')

const groups = [
  { key: 'cluster-self', kind: 'identity', label: '自我', color: '#5fe3b0', pages: [pages[1]] },
  { key: 'cluster-skill', kind: 'skill', label: '技能', color: '#7fb8ff', pages: [pages[2]] },
]
React.reset()
GraphView({ pages, links, selected: 'SOUL.md', onSelect() {}, filter: '', matchPaths: null, groups, t })
React.flush()
React.begin()
const grouped = JSON.stringify(GraphView({ pages, links, selected: 'SOUL.md', onSelect() {}, filter: '', matchPaths: null, groups, t }))
if (!grouped.includes('dmp-star-cluster-self')) throw new Error('first cluster anchor missing')
if (!grouped.includes('dmp-star-cluster-skill')) throw new Error('second cluster anchor missing')

React.reset()
const panel = MemoryPanel({ t })
if (!panel || !panel.props) throw new Error('panel did not render')

console.log('render-check: GraphView + MemoryPanel render without throwing')

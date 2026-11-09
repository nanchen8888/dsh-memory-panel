/**
 * dsh-memory-panel — browser half.
 *
 * Registers two surfaces under the same id:
 *   sidebar.panellist  → the left-sidebar icon
 *   main (key)         → the memory browser panel
 *
 * No Harness client packages are imported; only the `react` seed. All colors
 * come from --dsw-alias-* tokens so light/dark themes work untouched.
 */

window.__ModuleLoader__.load({
  id: '@local/dsh-memory-panel',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'memory-panel'
    const PANEL_ID = 'memory-panel'
    const API = '/api/dsh-memory-panel'
    const TREE_URL = `${API}/tree`
    const PAGE_URL = `${API}/page`
    const REVEAL_URL = `${API}/reveal`
    const SEARCH_URL = `${API}/search`
    const ACTIVITY_URL = `${API}/activity`
    const COMPACT_URL = `${API}/compact`

    const DICTS = {
      zh: {
        title: '记忆',
        search: '搜索记忆…',
        refresh: '刷新',
        openFolder: '打开目录',
        tidy: '整理',
        tidying: '整理中…',
        tidyConfirm: '把 45 天前的日志归档到 archive/？原文不会删，只搬走。',
        tidyDone: '已归档 {count} 条，省 {kb} KB',
        tidyNothing: '没有可归档的旧日志',
        tidyFailed: '整理失败：{message}',
        loading: '正在读取记忆…',
        error: '读取失败：{message}',
        retry: '重试',
        emptyDir: '找不到记忆库目录',
        emptyDirHint: '应在：{dir}',
        groupCore: '核心',
        groupMeta: '元记忆',
        groupIdentity: '自我',
        groupUser: '关于你',
        groupSkills: '技能',
        groupDecisions: '决策',
        groupProjects: '项目',
        groupConcepts: '概念',
        groupOther: '其他',
        noSelection: '从左侧选一页。',
        noMatch: '没有匹配的页面。',
        noPages: '记忆库还是空的，先写一页吧。',
        viewGraph: '星图',
        viewList: '索引',
        graphHint: '拖动空白平移 · 拖光点摆位 · 滚轮缩放 · 点星展开 · 亮度 = 权重 · 光环 = 调用',
        recalling: '调用',
        graphNoLinks: '页面之间还没有链接，补几条「相关页面」就会连起来。',
        linksCount: '{count} 条连线',
        clustersCount: '{count} 个自动簇',
        resetView: '复位',
        autoOn: '自动',
        autoOff: '暂停',
        pagesCount: '{count} 页',
        hotCount: '{count} 热',
        recent: '最近更新',
        hotPages: '常读',
        recentCalls: '最近调用',
        backlinks: '被引用',
        noBacklinks: '还没有别的页面引用它。',
        outline: '大纲',
        chars: '{count} 字',
        searchResults: '命中 {count} 页',
        searching: '检索中…',
        searchEmpty: '没有搜到。试试更短的关键词。',
        searchHint: '回车打开第一条',
        typeIdentity: '自我',
        typeUser: '关于你',
        typeFact: '事实',
        typeDecision: '决策',
        typeSkill: '技能',
        typeConcept: '概念',
        typeProject: '项目',
        typeUnknown: '未分类',
        salienceHot: '热',
        salienceWarm: '温',
        salienceCold: '冷',
        updated: '更新于 {time}',
        edit: '编辑',
        save: '保存',
        saving: '保存中…',
        cancel: '取消',
        saved: '已保存',
        saveFailed: '保存失败：{message}',
        revealPage: '在文件夹中显示',
        editingHint: '正在编辑 Markdown 源文件',
      },
      en: {
        title: 'Memory',
        search: 'Search memory…',
        refresh: 'Refresh',
        openFolder: 'Open folder',
        tidy: 'Tidy',
        tidying: 'Tidying…',
        tidyConfirm: 'Archive log entries older than 45 days into archive/? Nothing is deleted, only moved.',
        tidyDone: 'Archived {count} entries, saved {kb} KB',
        tidyNothing: 'No old log entries to archive',
        tidyFailed: 'Tidy failed: {message}',
        loading: 'Reading memory…',
        error: 'Failed to read: {message}',
        retry: 'Retry',
        emptyDir: 'Memory folder not found',
        emptyDirHint: 'Expected at: {dir}',
        groupCore: 'Core',
        groupMeta: 'Meta',
        groupIdentity: 'Identity',
        groupUser: 'About you',
        groupSkills: 'Skills',
        groupDecisions: 'Decisions',
        groupProjects: 'Projects',
        groupConcepts: 'Concepts',
        groupOther: 'Other',
        noSelection: 'Pick a page on the left.',
        noMatch: 'No pages match your search.',
        noPages: 'The memory bank is still empty.',
        viewGraph: 'Graph',
        viewList: 'Index',
        graphHint: 'Drag background · drag a light to move it · scroll · click a star · brightness = weight · ring = recalled',
        recalling: 'Recalling',
        graphNoLinks: 'No links between pages yet — add a few “Related pages” links.',
        linksCount: '{count} links',
        clustersCount: '{count} auto clusters',
        resetView: 'Reset',
        autoOn: 'Auto',
        autoOff: 'Pause',
        pagesCount: '{count} pages',
        hotCount: '{count} hot',
        recent: 'Recently updated',
        hotPages: 'Always read',
        recentCalls: 'Recently recalled',
        backlinks: 'Referenced by',
        noBacklinks: 'No other page links here yet.',
        outline: 'Outline',
        chars: '{count} chars',
        searchResults: '{count} matches',
        searching: 'Searching…',
        searchEmpty: 'No matches. Try a shorter query.',
        searchHint: 'Enter opens the first match',
        typeIdentity: 'identity',
        typeUser: 'about you',
        typeFact: 'fact',
        typeDecision: 'decision',
        typeSkill: 'skill',
        typeConcept: 'concept',
        typeProject: 'project',
        typeUnknown: 'untagged',
        salienceHot: 'hot',
        salienceWarm: 'warm',
        salienceCold: 'cold',
        updated: 'updated {time}',
        edit: 'Edit',
        save: 'Save',
        saving: 'Saving…',
        cancel: 'Cancel',
        saved: 'Saved',
        saveFailed: 'Save failed: {message}',
        revealPage: 'Show in folder',
        editingHint: 'Editing raw markdown',
      },
    }

    const TYPE_KEYS = {
      identity: 'typeIdentity',
      user: 'typeUser',
      fact: 'typeFact',
      decision: 'typeDecision',
      skill: 'typeSkill',
      concept: 'typeConcept',
      project: 'typeProject',
    }

    const CORE_ORDER = ['SOUL.md', 'MEMORY.md', 'BOOTSTRAP.md', 'index.md', 'log.md']

    const S = {
      btn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        padding: '0 11px',
        borderRadius: 8,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'transparent',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: 12.5,
        fontFamily: 'inherit',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      },
      input: {
        width: 180,
        height: 30,
        padding: '0 10px',
        borderRadius: 8,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: 12.5,
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
      },
      chip: {
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 8px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-secondary)',
        fontSize: 10.5,
        whiteSpace: 'nowrap',
      },
      muted: {
        padding: '14px 12px',
        fontSize: 12,
        lineHeight: 1.6,
        color: 'var(--dsw-alias-label-secondary)',
      },
      centerMuted: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
        fontSize: 12.5,
        color: 'var(--dsw-alias-label-secondary)',
      },
      errorText: {
        fontSize: 12.5,
        lineHeight: 1.65,
        color: 'var(--dsw-alias-state-error-primary)',
        wordBreak: 'break-word',
      },
    }

    /* ------------------------------------------------------------------ */
    /* Locale                                                              */
    /* ------------------------------------------------------------------ */

    function fill(template, params) {
      let out = String(template)
      for (const [key, value] of Object.entries(params || {})) {
        out = out.split(`{${key}}`).join(String(value))
      }
      return out
    }

    const localeStore = {
      active: 'zh',
      listeners: new Set(),
      set(active) {
        this.active = active === 'en' ? 'en' : 'zh'
        for (const listener of this.listeners) {
          try { listener(this.active) } catch { /* ignore */ }
        }
      },
      subscribe(listener) {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
      },
    }

    function translate(language, key, params) {
      const dict = DICTS[language] || DICTS.zh
      const template = dict[key] !== undefined ? dict[key] : (DICTS.zh[key] !== undefined ? DICTS.zh[key] : key)
      return params === undefined ? template : fill(template, params)
    }

    function useT(props) {
      const [active, setActive] = React.useState(localeStore.active)
      React.useEffect(() => localeStore.subscribe(setActive), [])
      const injected = props && typeof props.t === 'function' ? props.t : null
      return React.useMemo(() => {
        if (injected) return injected
        return (key, params) => translate(active, key, params)
      }, [injected, active])
    }

    /* ------------------------------------------------------------------ */
    /* Icons                                                               */
    /* ------------------------------------------------------------------ */

    function MemoryIcon(props) {
      const size = typeof (props && props.size) === 'number' && props.size > 0 ? props.size : 16
      const active = Boolean(props && props.active)
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.3,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        style: { display: 'block', opacity: active ? 1 : 0.82 },
      },
        h('path', { d: 'M5 2.8H3.6v10.4H5' }),
        h('path', { d: 'M5 2.8h7.4c.55 0 1 .45 1 1v8.4c0 .55-.45 1-1 1H5z' }),
        h('path', { d: 'M7.3 5.6h3.5M7.3 8h3.5M7.3 10.4h2.1' })
      )
    }

    /* ------------------------------------------------------------------ */
    /* Markdown (small, dependency-free renderer)                           */
    /* ------------------------------------------------------------------ */

    const INLINE_RE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\))/g

    function isMarkdownHref(href) {
      const clean = String(href).split('#')[0]
      if (!/\.md$/i.test(clean)) return false
      return !/^[a-z][a-z0-9+.-]*:/i.test(clean)
    }

    function renderInline(text, keyPrefix, onNavigate) {
      const nodes = []
      const source = String(text)
      let last = 0
      let index = 0
      let match
      INLINE_RE.lastIndex = 0
      while ((match = INLINE_RE.exec(source)) !== null) {
        if (match.index > last) nodes.push(source.slice(last, match.index))
        const token = match[0]
        const key = `${keyPrefix}-i${index++}`
        if (token.startsWith('`')) {
          nodes.push(h('code', {
            key,
            style: {
              padding: '1px 5px',
              borderRadius: 4,
              background: 'var(--dsw-alias-bg-layer-2)',
              fontSize: '0.92em',
              fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
            },
          }, token.slice(1, -1)))
        } else if (token.startsWith('**')) {
          nodes.push(h('strong', { key }, token.slice(2, -2)))
        } else if (token.startsWith('[')) {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
          if (link) {
            const label = link[1]
            const href = link[2]
            const local = isMarkdownHref(href)
            nodes.push(h('a', {
              key,
              href: local ? '#' : href,
              target: local ? undefined : '_blank',
              rel: local ? undefined : 'noreferrer',
              className: 'dmp-link',
              onClick: local
                ? (event) => { event.preventDefault(); onNavigate(href) }
                : undefined,
              style: { color: 'var(--dsw-alias-brand-primary)', textDecoration: 'none', cursor: 'pointer' },
            }, label))
          } else {
            nodes.push(token)
          }
        } else {
          nodes.push(h('em', { key }, token.slice(1, -1)))
        }
        last = match.index + token.length
      }
      if (last < source.length) nodes.push(source.slice(last))
      return nodes
    }

    function renderMarkdown(source, onNavigate) {
      // Memory pages carry HTML comment markers (e.g. soul:start/end); they are
      // bookkeeping for the memory plugin, not content worth showing.
      const lines = String(source)
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\r\n?/g, '\n')
        .split('\n')
      const blocks = []
      let cursor = 0
      let key = 0
      const nextKey = () => `b${key++}`

      while (cursor < lines.length) {
        const line = lines[cursor]
        const trimmed = line.trim()

        if (!trimmed) { cursor += 1; continue }

        const fence = /^```([\w-]*)\s*$/.exec(trimmed)
        if (fence) {
          const code = []
          cursor += 1
          while (cursor < lines.length && !/^```/.test(lines[cursor].trim())) {
            code.push(lines[cursor])
            cursor += 1
          }
          cursor += 1
          blocks.push(h('pre', {
            key: nextKey(),
            style: {
              margin: '12px 0',
              padding: '12px 14px',
              borderRadius: 9,
              border: '1px solid var(--dsw-alias-border-l1)',
              background: 'var(--dsw-alias-bg-layer-1)',
              overflowX: 'auto',
              fontSize: 12,
              lineHeight: 1.6,
            },
          }, h('code', null, code.join('\n'))))
          continue
        }

        const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed)
        if (heading) {
          const level = heading[1].length
          const sizes = [21, 17.5, 15.5, 14, 13.5, 13.5]
          blocks.push(h('div', {
            key: nextKey(),
            role: 'heading',
            'aria-level': level,
            style: {
              margin: level === 1 ? '2px 0 14px' : '22px 0 8px',
              fontSize: sizes[level - 1],
              fontWeight: level <= 2 ? 650 : 600,
              lineHeight: 1.4,
              color: 'var(--dsw-alias-label-primary)',
            },
          }, renderInline(heading[2], nextKey(), onNavigate)))
          cursor += 1
          continue
        }

        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
          blocks.push(h('hr', {
            key: nextKey(),
            style: { border: 'none', borderTop: '1px solid var(--dsw-alias-border-l1)', margin: '20px 0' },
          }))
          cursor += 1
          continue
        }

        if (/^>\s?/.test(trimmed)) {
          const quote = []
          while (cursor < lines.length && /^>\s?/.test(lines[cursor].trim())) {
            quote.push(lines[cursor].trim().replace(/^>\s?/, ''))
            cursor += 1
          }
          blocks.push(h('blockquote', {
            key: nextKey(),
            style: {
              margin: '12px 0',
              padding: '2px 0 2px 12px',
              borderLeft: '3px solid var(--dsw-alias-border-l2)',
              color: 'var(--dsw-alias-label-secondary)',
            },
          }, renderInline(quote.join(' '), nextKey(), onNavigate)))
          continue
        }

        if (/^([-*+]|\d+\.)\s+/.test(trimmed)) {
          const ordered = /^\d+\./.test(trimmed)
          const items = []
          while (cursor < lines.length) {
            const current = lines[cursor]
            const currentTrimmed = current.trim()
            if (!currentTrimmed) {
              cursor += 1
              if (cursor < lines.length && /^([-*+]|\d+\.)\s+/.test(lines[cursor].trim())) continue
              break
            }
            const item = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(current)
            if (!item) break
            const depth = Math.min(3, Math.floor(item[1].replace(/\t/g, '  ').length / 2))
            items.push(h('li', {
              key: `li${items.length}`,
              style: { marginLeft: depth * 14, marginBottom: 4 },
            }, renderInline(item[3], nextKey(), onNavigate)))
            cursor += 1
          }
          blocks.push(h(ordered ? 'ol' : 'ul', {
            key: nextKey(),
            style: { margin: '8px 0', paddingLeft: 22 },
          }, items))
          continue
        }

        const paragraph = []
        while (cursor < lines.length) {
          const current = lines[cursor]
          const currentTrimmed = current.trim()
          if (!currentTrimmed) break
          if (/^```/.test(currentTrimmed)) break
          if (/^#{1,6}\s/.test(currentTrimmed)) break
          if (/^>\s?/.test(currentTrimmed)) break
          if (/^([-*+]|\d+\.)\s+/.test(currentTrimmed)) break
          if (/^(-{3,}|\*{3,}|_{3,})$/.test(currentTrimmed)) break
          paragraph.push(currentTrimmed)
          cursor += 1
        }
        if (paragraph.length === 0) { cursor += 1; continue }
        blocks.push(h('p', {
          key: nextKey(),
          style: { margin: '10px 0' },
        }, renderInline(paragraph.join(' '), nextKey(), onNavigate)))
      }

      return blocks
    }

    function stripFrontmatter(text) {
      const source = String(text).replace(/\r\n?/g, '\n')
      if (!source.startsWith('---\n')) return source
      const end = source.indexOf('\n---', 4)
      if (end === -1) return source
      return source.slice(end + 4).replace(/^\n/, '')
    }

    function resolveHref(current, href) {
      const clean = String(href).split('#')[0].split('?')[0]
      if (!clean) return current
      const base = clean.startsWith('/') ? [] : String(current || '').split('/').slice(0, -1)
      for (const part of clean.replace(/^\/+/, '').split('/')) {
        if (!part || part === '.') continue
        if (part === '..') base.pop()
        else base.push(part)
      }
      return base.join('/')
    }

    function formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      try {
        return date.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
      } catch {
        return date.toISOString().slice(0, 10)
      }
    }

    function dotColor(salience) {
      if (salience === 1) return 'var(--dsw-alias-brand-primary)'
      if (salience === 2) return 'var(--dsw-alias-state-idle-primary)'
      return 'var(--dsw-alias-border-l2)'
    }

    /* ------------------------------------------------------------------ */
    /* Constellation view                                                  */
    /* ------------------------------------------------------------------ */

    const GROUP_DEFS = [
      { key: 'core', label: 'groupCore', color: '#8f9dff' },
      { key: 'identity', label: 'groupIdentity', color: '#5fe3b0' },
      { key: 'user', label: 'groupUser', color: '#ffc46b' },
      { key: 'skills', label: 'groupSkills', color: '#7fb8ff' },
      { key: 'decisions', label: 'groupDecisions', color: '#ff7a9c' },
      { key: 'projects', label: 'groupProjects', color: '#b49bff' },
      { key: 'concepts', label: 'groupConcepts', color: '#45c8b8' },
    ]
    const GROUP_BY_KEY = new Map(GROUP_DEFS.map((entry) => [entry.key, entry]))
    const GROUP_EXTRA = { key: 'extra', label: 'groupOther', color: '#9aa6c9' }
    const GROUP_ORDER = new Map([...GROUP_DEFS.map((entry, index) => [entry.key, index]), ['extra', 99]])
    /** Auto-cluster colours follow the semantic kind, not the sort position. */
    const CLUSTER_COLORS = {
      meta: '#8f9dff',
      identity: '#5fe3b0',
      user: '#ffc46b',
      skill: '#7fb8ff',
      project: '#b49bff',
      decision: '#ff7a9c',
      concept: '#45c8b8',
      fact: '#9aa6c9',
      topic: '#9aa6c9',
    }
    const ORB_ACCENTS = ['#ffd9a0', '#a9e8ff', '#c9b8ff', '#ffb7d5', '#b6ffdd', '#ffe7c2']
    const CLUSTER_LABEL_KEYS = {
      meta: 'groupMeta',
      identity: 'groupIdentity',
      user: 'groupUser',
      skill: 'groupSkills',
      project: 'groupProjects',
      decision: 'groupDecisions',
      concept: 'groupConcepts',
    }
    function clusterLabel(cluster, t) {
      const key = CLUSTER_LABEL_KEYS[cluster.kind]
      return key ? t(key) : (cluster.label || t('groupOther'))
    }
    const GRAPH_WIDTH = 1000
    const GRAPH_HEIGHT = 760
    /** Star systems sit on a shallow ellipse, as if seen from just above the disc. */
    const GRAPH_RING_X = GRAPH_WIDTH * 0.36
    const GRAPH_RING_Y = GRAPH_HEIGHT * 0.25
    /** 透视焦距：z 越靠前，光点越大越亮；这是星图“立体”的来源。 */
    const GRAPH_FOCAL = 560

    function groupOf(path) {
      const top = String(path).includes('/') ? String(path).split('/')[0] : 'core'
      return GROUP_BY_KEY.has(top) ? top : 'extra'
    }

    function groupMeta(key) {
      return GROUP_BY_KEY.get(key) || GROUP_EXTRA
    }

    function starWeight(page, maxHeat) {
      const heat = Number(page.heat)
      if (Number.isFinite(heat) && heat > 0 && maxHeat > 0) {
        return Math.min(1, Math.max(0.12, heat / maxHeat))
      }
      const salience = Number(page.salience) || 3
      return salience === 1 ? 0.92 : salience === 2 ? 0.55 : 0.3
    }

    function clipLabel(text, max) {
      const value = String(text || '')
      return value.length > max ? `${value.slice(0, max - 1)}…` : value
    }

    function GraphView(props) {
      const { pages, links, selected, onSelect, filter, matchPaths, activity, t } = props
      const propGroups = Array.isArray(props.groups) ? props.groups : []
      const groupLookup = React.useMemo(() => {
        const lookup = new Map()
        for (const group of propGroups) {
          for (const entry of group.pages || []) {
            const path = entry && typeof entry === 'object' ? entry.path : entry
            if (path) lookup.set(String(path), group.key)
          }
        }
        return lookup
      }, [propGroups])
      const groupDefByKey = React.useMemo(
        () => new Map(propGroups.map((group) => [group.key, group])),
        [propGroups]
      )
      const groupOrder = React.useMemo(
        () => new Map(propGroups.map((group, index) => [group.key, index])),
        [propGroups]
      )
      const groupKeyOf = (path) => groupLookup.get(String(path))
        || (propGroups.length > 0 ? propGroups[0].key : groupOf(path))
      const groupMetaFor = (key) => groupDefByKey.get(key) || groupMeta(key)
      const wrapRef = React.useRef(null)
      const svgRef = React.useRef(null)
      const [positions, setPositions] = React.useState([])
      const [hover, setHover] = React.useState(null)
      const [view, setView] = React.useState({ k: 1, x: 0, y: 0 })
      const [resetTick, setResetTick] = React.useState(0)
      const [auto, setAuto] = React.useState(true)
      const autoRef = React.useRef(true)
      const [offsets, setOffsets] = React.useState(() => new Map())
      const [nodeDrag, setNodeDrag] = React.useState(null)
      const nodeDragRef = React.useRef(null)
      const dragRef = React.useRef(null)
      const rafRef = React.useRef(0)
      // 相位跨数据刷新保留：否则每次轮询刷新，星图都会"啪"地跳回原点重新转
      const phaseRef = React.useRef(0)
      // 拖动用弹簧追目标点（不是硬跟手），松手带一点惯性，才不显得死板
      const offsetsRef = React.useRef(new Map())
      const offsetTargetsRef = React.useRef(new Map())
      const offsetMomentumRef = React.useRef(new Map())
      const [nowTick, setNowTick] = React.useState(Date.now())

      const callEvents = Array.isArray(activity) ? activity : []

      React.useEffect(() => {
        if (callEvents.length === 0) return undefined
        const timer = setInterval(() => setNowTick(Date.now()), 900)
        return () => clearInterval(timer)
      }, [callEvents.length])

      // Keep only the newest call per page, and let it fade after 9s.
      const calls = React.useMemo(() => {
        const latest = new Map()
        for (const event of callEvents) {
          if (!event || typeof event.path !== 'string') continue
          const at = Number(event.at) || 0
          if (nowTick - at > 9000) continue
          const previous = latest.get(event.path)
          if (!previous || at > previous.at) latest.set(event.path, { at, kind: event.kind })
        }
        return latest
      }, [callEvents, nowTick])

      const latestCall = React.useMemo(() => {
        let best = null
        for (const [path, call] of calls) {
          if (!best || call.at > best.call.at) best = { path, call }
        }
        if (!best) return null
        const page = (pages || []).find((item) => item.path === best.path)
        return { ...best, title: page ? page.title : best.path }
      }, [calls, pages])

      React.useEffect(() => {
        autoRef.current = auto
      }, [auto])

      React.useEffect(() => () => {
        document.body.style.userSelect = ''
      }, [])

      React.useEffect(() => {
        if (!pages || pages.length === 0) {
          setPositions([])
          return undefined
        }
        const width = GRAPH_WIDTH
        const height = GRAPH_HEIGHT
        const groups = Array.from(new Set(pages.map((page) => groupKeyOf(page.path))))
          .sort((a, b) => (groupOrder.get(a) ?? 98) - (groupOrder.get(b) ?? 98))
        const cx = width / 2
        const cy = height / 2
        const anchors = new Map()
        groups.forEach((key, index) => {
          const angle = -Math.PI / 2 + (index / Math.max(1, groups.length)) * Math.PI * 2
          anchors.set(key, {
            x: cx + Math.cos(angle) * GRAPH_RING_X,
            y: cy + Math.sin(angle) * GRAPH_RING_Y,
            tilt: 0.92 + (index % 5) * 0.05,
            roll: ((index % 5) - 2) * 0.14,
          })
        })
        const byGroup = new Map()
        for (const page of pages) {
          const key = groupKeyOf(page.path)
          if (!byGroup.has(key)) byGroup.set(key, [])
          byGroup.get(key).push(page)
        }
        const nodes = pages.map((page) => {
          const key = groupKeyOf(page.path)
          const anchor = anchors.get(key) || { x: cx, y: cy }
          const peers = byGroup.get(key) || []
          const index = Math.max(0, peers.indexOf(page))
          const count = Math.max(1, peers.length)
          return {
            path: page.path,
            anchor,
            orbit: 92 + Math.floor(index / 6) * 40,
            base: (index / count) * Math.PI * 2 + (groups.indexOf(key) || 0) * 0.55,
            // 速度差 ±20%：星图整体在动，但每颗星各走各的节奏，才像活的
            speed: 0.8 + ((index * 7 + groups.indexOf(key) * 3) % 11) * 0.04,
          }
        })
        // Deterministic orrery: pages circle their group's star on shallow ellipses,
        // which reads as a star map instead of a force bubble. A whole phase shift
        // slowly carries every system; clicking freezes it exactly where it is.
        // 相位存在 phaseRef 里，数据轮询刷新时接着转，不会跳回原点。
        const place = () => nodes.map((node) => {
          const angle = node.base + phaseRef.current * node.speed
          const ca = Math.cos(angle)
          const sa = Math.sin(angle)
          // 真正的三维轨道：先绕 x 轴倾斜，再绕 z 轴滚转，最后做透视除法。
          // 近处的光点更大更亮、远处的更小更暗，转动才有纵深。
          const px = ca * node.orbit
          const py = sa * node.orbit * Math.cos(node.anchor.tilt)
          const pz = sa * node.orbit * Math.sin(node.anchor.tilt)
          const roll = node.anchor.roll || 0
          const rx = px * Math.cos(roll) - py * Math.sin(roll)
          const ry = px * Math.sin(roll) + py * Math.cos(roll)
          const persp = GRAPH_FOCAL / (GRAPH_FOCAL - pz)
          return {
            path: node.path,
            x: node.anchor.x + rx * persp,
            y: node.anchor.y + ry * persp,
            z: pz,
            zn: pz / Math.max(1, node.orbit),
            persp,
            depth: sa,
          }
        })
        setPositions(place())

        const frame = () => {
          // 拖动时把整片星图钉住：手里的星不动，别人也不许转
          if (autoRef.current && !nodeDragRef.current) {
            phaseRef.current += 0.0011
            setPositions(place())
          }
          // 弹簧追手 + 松手惯性
          let changed = false
          const current = offsetsRef.current
          for (const [path, target] of offsetTargetsRef.current) {
            const now = current.get(path) || { x: 0, y: 0 }
            const nextX = now.x + (target.x - now.x) * 0.34
            const nextY = now.y + (target.y - now.y) * 0.34
            const settled = Math.abs(target.x - nextX) < 0.4 && Math.abs(target.y - nextY) < 0.4
            const value = settled ? { x: target.x, y: target.y } : { x: nextX, y: nextY }
            if (value.x !== now.x || value.y !== now.y) {
              current.set(path, value)
              changed = true
            }
          }
          for (const [path, velocity] of offsetMomentumRef.current) {
            const target = offsetTargetsRef.current.get(path)
            if (!target || (Math.abs(velocity.x) < 0.15 && Math.abs(velocity.y) < 0.15)) {
              offsetMomentumRef.current.delete(path)
              continue
            }
            offsetTargetsRef.current.set(path, { x: target.x + velocity.x, y: target.y + velocity.y })
            offsetMomentumRef.current.set(path, { x: velocity.x * 0.82, y: velocity.y * 0.82 })
          }
          if (changed) setOffsets(new Map(current))
          rafRef.current = requestAnimationFrame(frame)
        }
        rafRef.current = requestAnimationFrame(frame)

        return () => {
          cancelAnimationFrame(rafRef.current)
        }
      }, [pages, links, resetTick, groupLookup, groupOrder])

      React.useEffect(() => {
        const element = svgRef.current
        if (!element) return undefined
        const onWheel = (event) => {
          event.preventDefault()
          const rect = element.getBoundingClientRect()
          const scale = Math.max(0.01, Math.min(rect.width / GRAPH_WIDTH, rect.height / GRAPH_HEIGHT))
          const offsetX = (rect.width - GRAPH_WIDTH * scale) / 2
          const offsetY = (rect.height - GRAPH_HEIGHT * scale) / 2
          const px = (event.clientX - rect.left - offsetX) / scale
          const py = (event.clientY - rect.top - offsetY) / scale
          setView((prev) => {
            const next = Math.max(0.4, Math.min(2.8, prev.k * (event.deltaY < 0 ? 1.12 : 0.89)))
            const ratio = next / prev.k
            return { k: next, x: px - (px - prev.x) * ratio, y: py - (py - prev.y) * ratio }
          })
        }
        element.addEventListener('wheel', onWheel, { passive: false })
        return () => element.removeEventListener('wheel', onWheel)
      }, [])

      const positionOf = React.useMemo(() => {
        const map = new Map()
        for (const item of positions) {
          const offset = offsets.get(item.path)
          map.set(item.path, offset
            ? { ...item, x: item.x + offset.x, y: item.y + offset.y }
            : item)
        }
        return map
      }, [positions, offsets])

      // 远处的先画、近处的后画，节点互相遮挡时才有前后关系。
      const orderedPages = React.useMemo(() => {
        const copy = pages.slice()
        copy.sort((a, b) => {
          const za = positionOf.get(a.path)?.z ?? 0
          const zb = positionOf.get(b.path)?.z ?? 0
          return za - zb
        })
        return copy
      }, [pages, positionOf])

      React.useEffect(() => {
        if (!nodeDrag) return undefined
        const move = (event) => {
          const drag = nodeDragRef.current
          if (!drag) return
          const rawX = event.clientX - drag.startX
          const rawY = event.clientY - drag.startY
          drag.moved = Math.max(drag.moved || 0, Math.hypot(rawX, rawY))
          const dx = rawX / (drag.k || 1)
          const dy = rawY / (drag.k || 1)
          const nextX = drag.base.x + dx
          const nextY = drag.base.y + dy
          const previous = offsetTargetsRef.current.get(drag.path) || drag.base
          // 记一点速度，松手时顺着甩出去一小段
          drag.velocity = {
            x: (drag.velocity?.x ?? 0) * 0.6 + (nextX - previous.x) * 0.4,
            y: (drag.velocity?.y ?? 0) * 0.6 + (nextY - previous.y) * 0.4,
          }
          offsetMomentumRef.current.delete(drag.path)
          offsetTargetsRef.current.set(drag.path, { x: nextX, y: nextY })
        }
        const up = () => {
          const drag = nodeDragRef.current
          nodeDragRef.current = null
          setNodeDrag(null)
          if (!drag) return
          if ((drag.moved || 0) < 4) {
            onSelect(drag.path)
            return
          }
          const velocity = drag.velocity
          if (velocity && (Math.abs(velocity.x) > 0.6 || Math.abs(velocity.y) > 0.6)) {
            offsetMomentumRef.current.set(drag.path, { x: velocity.x * 0.55, y: velocity.y * 0.55 })
          }
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
        window.addEventListener('pointercancel', up)
        return () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
          window.removeEventListener('pointercancel', up)
        }
      }, [nodeDrag])

      const degreeOf = React.useMemo(() => {
        const map = new Map()
        for (const link of links || []) {
          map.set(link.source, (map.get(link.source) || 0) + 1)
          map.set(link.target, (map.get(link.target) || 0) + 1)
        }
        return map
      }, [links])

      const focus = hover || selected
      const maxHeat = React.useMemo(
        () => Math.max(1, ...pages.map((page) => Number(page.heat) || 0)),
        [pages]
      )
      const weightOf = React.useMemo(() => {
        const map = new Map()
        for (const page of pages) map.set(page.path, starWeight(page, maxHeat))
        return map
      }, [pages, maxHeat])
      const related = React.useMemo(() => {
        const set = new Set()
        if (!focus) return set
        set.add(focus)
        for (const link of links || []) {
          if (link.source === focus) set.add(link.target)
          if (link.target === focus) set.add(link.source)
        }
        return set
      }, [focus, links])

      const needle = filter.trim().toLowerCase()
      const matches = React.useMemo(() => {
        if (matchPaths) return matchPaths
        if (!needle) return null
        const set = new Set()
        for (const page of pages) {
          if (`${page.title || ''} ${page.summary || ''} ${page.path || ''}`.toLowerCase().includes(needle)) set.add(page.path)
        }
        return set
      }, [pages, needle, matchPaths])

      const groupAnchors = React.useMemo(() => {
        const keys = Array.from(new Set(pages.map((page) => groupKeyOf(page.path))))
          .sort((a, b) => (groupOrder.get(a) ?? 98) - (groupOrder.get(b) ?? 98))
        const cx = GRAPH_WIDTH / 2
        const cy = GRAPH_HEIGHT / 2
        return keys.map((key, index) => {
          const angle = -Math.PI / 2 + (index / Math.max(1, keys.length)) * Math.PI * 2
          return {
            key,
            x: cx + Math.cos(angle) * GRAPH_RING_X,
            y: cy + Math.sin(angle) * GRAPH_RING_Y,
            // 每个星系给一点不同的轨道倾角和滚转，几套轨道才不会叠成一张平面图
            tilt: 0.92 + (index % 5) * 0.05,
            roll: ((index % 5) - 2) * 0.14,
            meta: groupMetaFor(key),
          }
        })
      }, [pages, groupLookup, groupOrder, groupDefByKey])

      const groupLabel = (key) => {
        const meta = groupMetaFor(key)
        return /^group[A-Z]/.test(String(meta.label)) ? t(meta.label) : meta.label
      }

      const stars = React.useMemo(() => {
        let seed = 20261109
        const random = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0
          return seed / 4294967296
        }
        const palette = ['#ffffff', '#e6edff', '#cfdcff', '#fff2df', '#ffe0bd', '#bcd0ff']
        return Array.from({ length: 720 }, () => ({
          x: random() * GRAPH_WIDTH,
          y: random() * GRAPH_HEIGHT,
          r: Math.pow(random(), 2.3) * 1.45 + 0.18,
          o: 0.16 + random() * 0.66,
          color: palette[Math.floor(random() * palette.length)],
          dur: 4 + random() * 7,
          delay: random() * 8,
        }))
      }, [])

      const dust = React.useMemo(() => {
        let seed = 990731
        const random = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0
          return seed / 4294967296
        }
        const band = Math.tan((-17 * Math.PI) / 180)
        return Array.from({ length: 150 }, () => {
          const u = random() * 2 - 1
          const gauss = (random() + random() + random() - 1.5) * 26
          return {
            x: GRAPH_WIDTH / 2 + u * GRAPH_WIDTH * 0.38,
            y: GRAPH_HEIGHT * 0.52 + u * GRAPH_WIDTH * 0.38 * band + gauss,
            r: Math.pow(random(), 2.6) * 1.1 + 0.15,
            o: 0.1 + random() * 0.38,
            dur: 5 + random() * 9,
            delay: random() * 10,
          }
        })
      }, [])

      const groupsPresent = propGroups.length > 0
        ? propGroups
        : GROUP_DEFS
          .filter((definition) => pages.some((page) => groupOf(page.path) === definition.key))
          .concat(pages.some((page) => groupOf(page.path) === 'extra') ? [GROUP_EXTRA] : [])

      const onPointerDown = (event) => {
        if (event.button !== 0) return
        event.preventDefault()
        if (autoRef.current) setAuto(false)
        dragRef.current = {
          startX: event.clientX,
          startY: event.clientY,
          baseX: view.x,
          baseY: view.y,
          moved: 0,
        }
        try { window.getSelection()?.removeAllRanges() } catch { /* ignore */ }
        document.body.style.userSelect = 'none'
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* ignore */ }
      }

      const onPointerMove = (event) => {
        const drag = dragRef.current
        if (!drag) return
        const dx = event.clientX - drag.startX
        const dy = event.clientY - drag.startY
        drag.moved = Math.max(drag.moved, Math.hypot(dx, dy))
        if (drag.moved > 2) {
          setView((prev) => ({ ...prev, x: drag.baseX + dx, y: drag.baseY + dy }))
        }
      }

      const onPointerUp = (event) => {
        document.body.style.userSelect = ''
        const drag = dragRef.current
        if (!drag) return
        const blank = event.target === svgRef.current
          || (event.target && typeof event.target.getAttribute === 'function'
            && event.target.getAttribute('data-graph-bg') !== null)
        if (drag.moved < 4 && blank) onSelect(null)
        dragRef.current = null
      }

      const reset = () => {
        setView({ k: 1, x: 0, y: 0 })
        setAuto(true)
        setOffsets(new Map())
        offsetsRef.current = new Map()
        offsetTargetsRef.current.clear()
        offsetMomentumRef.current.clear()
        phaseRef.current = 0
        nodeDragRef.current = null
        setNodeDrag(null)
        setResetTick((value) => value + 1)
      }

      const toggleAuto = () => setAuto((value) => !value)

      const labelLayout = React.useMemo(() => {
        const occupied = []
        const overlaps = (box) => occupied.some((other) => (
          box.x1 < other.x2 && box.x2 > other.x1 && box.y1 < other.y2 && box.y2 > other.y1
        ))
        for (const anchor of groupAnchors) {
          const width = String(groupLabel(anchor.key)).length * 9 + 10
          occupied.push({ x1: anchor.x - width / 2, x2: anchor.x + width / 2, y1: anchor.y - 18, y2: anchor.y + 4 })
        }
        const candidates = []
        for (const page of pages) {
          const position = positionOf.get(page.path)
          if (!position) continue
          const weight = weightOf.get(page.path) || 0.3
          const radius = 1.6 + Math.pow(weight, 0.85) * 6.2
            + Math.min(1.4, (degreeOf.get(page.path) || 0) * 0.24)
          const title = clipLabel(page.title, 20)
          const width = Math.min(168, Math.max(36, title.length * 7.4))
          const priorities = page.path === selected || page.path === hover
            ? 0
            : weight > 0.66 ? 1 : 2
          candidates.push({ page, position, radius, title, width, priorities })
        }
        candidates.sort((a, b) => a.priorities - b.priorities)
        const placed = new Map()
        for (const item of candidates) {
          const { position, radius, width } = item
          const options = [
            { x: position.x, y: position.y + radius + 17, anchor: 'middle' },
            { x: position.x, y: position.y - radius - 9, anchor: 'middle' },
            { x: position.x, y: position.y + radius + 32, anchor: 'middle' },
            { x: position.x, y: position.y - radius - 24, anchor: 'middle' },
          ]
          const forced = item.priorities === 0
          let choice = null
          for (const option of options) {
            const box = {
              x1: option.x - width / 2,
              x2: option.x + width / 2,
              y1: option.y - 11,
              y2: option.y + 5,
            }
            if (!overlaps(box)) {
              choice = { option, box }
              break
            }
          }
          if (choice) occupied.push(choice.box)
          else if (forced) choice = { option: options[0], box: { x1: 0, x2: 0, y1: 0, y2: 0 } }
          if (choice) placed.set(item.page.path, choice.option)
        }
        return placed
      }, [pages, positionOf, degreeOf, weightOf, groupAnchors, selected, hover, t])

      const labels = h('g', { style: { pointerEvents: 'none' } },
        groupAnchors.map((anchor) => h('text', {
          key: `group-label-${anchor.key}`,
          x: anchor.x,
          y: anchor.y - 26,
          textAnchor: 'middle',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.8,
          fontFamily: 'inherit',
          fill: anchor.meta.color,
          opacity: focus ? 0.3 : 0.88,
        }, String(groupLabel(anchor.key)))),
        pages.map((page) => {
          const position = labelLayout.get(page.path)
          if (!position) return null
          const isRelated = related.has(page.path)
          const dim = (matches && !matches.has(page.path)) || (focus && !isRelated)
          const weight = weightOf.get(page.path) || 0.3
          return h('text', {
            key: `label-${page.path}`,
            x: position.x,
            y: position.y,
            textAnchor: position.anchor,
            fontSize: 10.5 + weight * 2,
            letterSpacing: 0.2,
            fontFamily: 'inherit',
            fill: isRelated && focus
              ? '#ffffff'
              : weight > 0.66
                ? 'rgba(248, 251, 255, 1)'
                : 'rgba(214, 227, 255, 0.88)',
            opacity: dim ? 0.12 : (view.k < 0.62 && !isRelated ? 0.3 : 0.86),
            style: {
              paintOrder: 'stroke',
              stroke: '#03050c',
              strokeWidth: 3,
              strokeLinejoin: 'round',
            },
          }, clipLabel(page.title, 20))
        })
      )

      return h('div', {
        ref: wrapRef,
        className: auto ? 'dmp-graph' : 'dmp-graph dmp-paused',
        onDragStart: (event) => event.preventDefault(),
        style: {
          position: 'relative',
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          margin: 0,
          borderRadius: 0,
          border: 'none',
          background: [
            'radial-gradient(ellipse 120% 90% at 50% 38%, #070b18 0%, #04060f 52%, #010207 100%)',
          ].join(', '),
          boxShadow: 'inset 0 0 120px 30px rgba(0, 0, 0, 0.5)',
        },
      },
        h('svg', {
          ref: svgRef,
          width: '100%',
          height: '100%',
          viewBox: `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`,
          preserveAspectRatio: 'xMidYMid meet',
          style: { display: 'block', touchAction: 'none', cursor: 'grab' },
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        },
          h('defs', null,
            h('linearGradient', { id: 'dmp-milky', x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
              h('stop', { offset: '0%', stopColor: '#ffffff', stopOpacity: 0 }),
              h('stop', { offset: '38%', stopColor: '#dfe8ff', stopOpacity: 0.07 }),
              h('stop', { offset: '52%', stopColor: '#ffffff', stopOpacity: 0.1 }),
              h('stop', { offset: '68%', stopColor: '#e6edff', stopOpacity: 0.05 }),
              h('stop', { offset: '100%', stopColor: '#ffffff', stopOpacity: 0 })
            ),
            h('linearGradient', { id: 'dmp-meteor', x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
              h('stop', { offset: '0%', stopColor: '#ffffff', stopOpacity: 0 }),
              h('stop', { offset: '55%', stopColor: '#e8f0ff', stopOpacity: 0.7 }),
              h('stop', { offset: '100%', stopColor: '#ffffff', stopOpacity: 0 })
            ),
            h('filter', { id: 'dmp-soft-glow', x: '-80%', y: '-80%', width: '260%', height: '260%' },
              h('feGaussianBlur', { stdDeviation: 2.2, result: 'blur' }),
              h('feMerge', null,
                h('feMergeNode', { in: 'blur' }),
                h('feMergeNode', { in: 'SourceGraphic' })
              )
            ),
            groupAnchors.map((anchor) => h('radialGradient', {
              key: `star-grad-${anchor.key}`,
              id: `dmp-star-${anchor.key}`,
            },
              h('stop', { offset: '0%', stopColor: '#ffffff', stopOpacity: 0.72 }),
              h('stop', { offset: '16%', stopColor: anchor.meta.color, stopOpacity: 0.34 }),
              h('stop', { offset: '46%', stopColor: anchor.meta.color, stopOpacity: 0.09 }),
              h('stop', { offset: '100%', stopColor: anchor.meta.color, stopOpacity: 0 })
            )),
            pages.map((page, index) => {
              const color = groupMetaFor(groupKeyOf(page.path)).color
              return h('radialGradient', {
                key: `orb-grad-${page.path}`,
                id: `dmp-orb-${index}`,
              },
                h('stop', { offset: '0%', stopColor: '#ffffff', stopOpacity: 0.95 }),
                h('stop', { offset: '24%', stopColor: color, stopOpacity: 0.78 }),
                h('stop', { offset: '62%', stopColor: color, stopOpacity: 0.22 }),
                h('stop', { offset: '100%', stopColor: color, stopOpacity: 0 })
              )
            })
          ),
          h('rect', {
            x: 0, y: 0, width: GRAPH_WIDTH, height: GRAPH_HEIGHT,
            fill: 'transparent',
            'data-graph-bg': '',
          }),
          h('g', { style: { pointerEvents: 'none' } },
            h('g', {
              className: 'dmp-galaxy',
              style: { transformOrigin: `${GRAPH_WIDTH / 2}px ${GRAPH_HEIGHT * 0.52}px` },
            },
              h('ellipse', {
                cx: GRAPH_WIDTH / 2,
                cy: GRAPH_HEIGHT * 0.52,
                rx: GRAPH_WIDTH * 0.74,
                ry: GRAPH_HEIGHT * 0.24,
                transform: `rotate(-17 ${GRAPH_WIDTH / 2} ${GRAPH_HEIGHT * 0.52})`,
                fill: 'url(#dmp-milky)',
                opacity: 0.9,
              }),
              h('ellipse', {
                cx: GRAPH_WIDTH / 2,
                cy: GRAPH_HEIGHT * 0.52,
                rx: GRAPH_WIDTH * 0.36,
                ry: GRAPH_HEIGHT * 0.085,
                transform: `rotate(-17 ${GRAPH_WIDTH / 2} ${GRAPH_HEIGHT * 0.52})`,
                fill: 'url(#dmp-milky)',
                opacity: 0.7,
              }),
              dust.map((star, index) => h('circle', {
                key: `dust-${index}`,
                cx: star.x,
                cy: star.y,
                r: star.r,
                fill: '#dce6ff',
                opacity: star.o,
                className: 'dmp-river-star',
                style: {
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.dur}s`,
                  '--dmp-min': String(star.o * 0.3),
                },
              }))
            ),
            h('ellipse', {
              cx: GRAPH_WIDTH * 0.34,
              cy: GRAPH_HEIGHT * 0.34,
              rx: 210,
              ry: 96,
              fill: '#4f7fd8',
              opacity: 0.055,
              style: { filter: 'url(#dmp-soft-glow)' },
            }),
            h('ellipse', {
              cx: GRAPH_WIDTH * 0.68,
              cy: GRAPH_HEIGHT * 0.64,
              rx: 180,
              ry: 78,
              fill: '#2f9fb5',
              opacity: 0.04,
              style: { filter: 'url(#dmp-soft-glow)' },
            }),
            groupAnchors.map((anchor) => h('g', { key: `orbits-${anchor.key}` },
              h('circle', {
                cx: anchor.x,
                cy: anchor.y,
                r: 128,
                fill: anchor.meta.color,
                opacity: 0.045,
                style: { filter: 'url(#dmp-soft-glow)' },
              }),
              h('ellipse', {
                cx: anchor.x, cy: anchor.y, rx: 92, ry: 92 * Math.cos(anchor.tilt),
                transform: `rotate(${(anchor.roll * 180 / Math.PI).toFixed(2)} ${anchor.x} ${anchor.y})`,
                fill: 'none', stroke: 'rgba(165, 182, 230, 0.16)', strokeWidth: 0.55,
              }),
              h('ellipse', {
                cx: anchor.x, cy: anchor.y, rx: 132, ry: 132 * Math.cos(anchor.tilt),
                transform: `rotate(${(anchor.roll * 180 / Math.PI).toFixed(2)} ${anchor.x} ${anchor.y})`,
                fill: 'none', stroke: 'rgba(165, 182, 230, 0.08)', strokeWidth: 0.55,
              })
            )),
            groupAnchors.map((anchor) => h('g', { key: `sun-${anchor.key}` },
              h('circle', { cx: anchor.x, cy: anchor.y, r: 30, fill: `url(#dmp-star-${anchor.key})` }),
              h('circle', { cx: anchor.x, cy: anchor.y, r: 1.9, fill: '#f6f8ff', className: 'dmp-sun-core' }),
              h('path', {
                d: `M ${anchor.x - 11} ${anchor.y} H ${anchor.x + 11} M ${anchor.x} ${anchor.y - 9} V ${anchor.y + 9}`,
                stroke: 'rgba(236, 242, 255, 0.30)',
                strokeWidth: 0.5,
              })
            )),
            h('g', { className: 'dmp-meteors' },
              [0, 1, 2].map((index) => h('line', {
                key: `meteor-${index}`,
                x1: 150 + index * 250,
                y1: 90 + index * 120,
                x2: 238 + index * 250,
                y2: 126 + index * 120,
                stroke: 'url(#dmp-meteor)',
                strokeWidth: 0.9,
                className: 'dmp-meteor',
                style: { animationDelay: `${index * 5.7 + 1.5}s` },
              }))
            )
          ),
          h('g', { style: { pointerEvents: 'none' } },
            stars.map((star, index) => h('circle', {
              key: `star-${index}`,
              cx: star.x,
              cy: star.y,
              r: star.r,
              fill: star.color,
              opacity: star.o,
              className: 'dmp-star',
              style: {
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.dur}s`,
                '--dmp-min': String(star.o * 0.35),
              },
            }))
          ),
          h('g', { transform: `translate(${view.x} ${view.y}) scale(${view.k})` },
            h('g', null,
              (links || []).map((link, index) => {
                const a = positionOf.get(link.source)
                const b = positionOf.get(link.target)
                if (!a || !b) return null
                const hot = focus && (link.source === focus || link.target === focus)
                const linkNear = (((a.zn || 0) + (b.zn || 0)) / 2 + 1) / 2
                const dx = b.x - a.x
                const dy = b.y - a.y
                const length = Math.max(1, Math.hypot(dx, dy))
                const bend = Math.min(14, length * 0.12) * (index % 2 === 0 ? 1 : -1)
                const mx = (a.x + b.x) / 2 - (dy / length) * bend
                const my = (a.y + b.y) / 2 + (dx / length) * bend
                return h('path', {
                  key: `edge-${index}`,
                  d: `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`,
                  fill: 'none',
                  stroke: hot ? 'rgba(214, 226, 255, 0.62)' : 'rgba(150, 170, 222, 0.20)',
                  strokeWidth: (hot ? 1.1 : 0.55) * (0.65 + linkNear * 0.55),
                  opacity: (hot ? 0.9 : 0.72) * (0.4 + linkNear * 0.6),
                  style: { pointerEvents: 'none' },
                })
              })
            ),
            h('g', null,
              orderedPages.map((page) => {
                const index = pages.indexOf(page)
                const position = positionOf.get(page.path)
                if (!position) return null
                const nodeKey = groupKeyOf(page.path)
                const meta = groupMetaFor(nodeKey)
                const anchor = groupAnchors.find((item) => item.key === nodeKey)
                const weight = weightOf.get(page.path) || 0.3
                const radius = 1.6 + Math.pow(weight, 0.85) * 6.2
                  + Math.min(1.4, (degreeOf.get(page.path) || 0) * 0.24)
                const isRelated = related.has(page.path)
                const dim = (matches && !matches.has(page.path)) || (focus && !isRelated)
                const isFocus = focus === page.path
                const lit = isRelated || isFocus
                const coreColor = lit ? '#ffffff' : meta.color
                const depth = typeof position.depth === 'number' ? position.depth : 0
                const persp = typeof position.persp === 'number' ? position.persp : 1
                const near = Math.max(0, Math.min(1, ((position.zn || 0) + 1) / 2))
                const scale = Math.pow(persp, 1.5)
                const flare = radius * (2.1 + weight * 2.3)
                const call = calls.get(page.path)
                return h('g', {
                  key: `node-${page.path}`,
                  transform: `translate(${position.x} ${position.y}) scale(${nodeDrag === page.path ? scale * 1.16 : scale})`,
                  opacity: dim ? 0.2 : (0.55 + near * 0.45),
                  className: nodeDrag === page.path ? 'dmp-node dmp-node-grab' : 'dmp-node',
                  style: {
                    cursor: nodeDrag === page.path ? 'grabbing' : 'grab',
                    filter: near < 0.42 ? `blur(${((0.42 - near) * 1.8).toFixed(2)}px)` : 'none',
                    '--dmp-dur': `${(7.6 - weight * 3.4).toFixed(2)}s`,
                    '--dmp-delay': `${((index * 0.37) % 5).toFixed(2)}s`,
                    '--dmp-min': String(0.55 + weight * 0.3),
                  },
                  onPointerDown: (event) => {
                    event.stopPropagation()
                    event.preventDefault()
                    if (typeof event.button === 'number' && event.button !== 0) return
                    if (event.currentTarget && event.currentTarget.setPointerCapture) {
                      event.currentTarget.setPointerCapture(event.pointerId)
                    }
                    setAuto(false)
                    const base = offsetsRef.current.get(page.path)
                      || offsetTargetsRef.current.get(page.path)
                      || { x: 0, y: 0 }
                    offsetMomentumRef.current.delete(page.path)
                    offsetTargetsRef.current.set(page.path, { x: base.x, y: base.y })
                    nodeDragRef.current = {
                      path: page.path,
                      startX: event.clientX,
                      startY: event.clientY,
                      k: view.k || 1,
                      base,
                      velocity: { x: 0, y: 0 },
                    }
                    setNodeDrag(page.path)
                  },

                  onMouseEnter: () => setHover(page.path),
                  onMouseLeave: () => setHover((current) => (current === page.path ? null : current)),
                },
                  h('circle', {
                    r: 14,
                    fill: 'transparent',
                    style: { pointerEvents: 'all' },
                  }),
                  call && anchor
                    ? h('line', {
                      key: `call-beam-${page.path}-${call.at}`,
                      x1: 0,
                      y1: 0,
                      x2: anchor.x - position.x,
                      y2: anchor.y - position.y,
                      stroke: call.kind === 'boot' ? 'rgba(255, 228, 176, 0.55)' : 'rgba(176, 217, 255, 0.5)',
                      strokeWidth: 0.8,
                      className: 'dmp-call-beam',
                      style: { pointerEvents: 'none' },
                    })
                    : null,
                  call
                    ? h('g', {
                      key: `call-ring-${page.path}-${call.at}`,
                      className: 'dmp-call-ring',
                      style: { pointerEvents: 'none' },
                    },
                      h('circle', {
                        r: radius + 3,
                        fill: 'none',
                        stroke: call.kind === 'boot' ? '#ffe7b0' : '#b7dcff',
                        strokeWidth: 0.9,
                      })
                    )
                    : null,
                  h('circle', {
                    r: radius * (3.4 + weight * 2.8),
                    fill: `url(#dmp-orb-${index})`,
                    opacity: 0.18 + weight * 0.26,
                    style: { pointerEvents: 'none' },
                  }),
                  weight > 0.42
                    ? h('path', {
                      d: `M ${-flare} 0 H ${flare} M 0 ${-flare * 0.72} V ${flare * 0.72}`,
                      stroke: weight > 0.72 ? 'rgba(255, 242, 214, 0.85)' : 'rgba(222, 234, 255, 0.55)',
                      strokeWidth: weight > 0.72 ? 0.65 : 0.45,
                      opacity: 0.24 + weight * 0.46,
                      style: { pointerEvents: 'none' },
                    })
                    : null,
                  h('circle', {
                    r: radius + 3.5,
                    fill: 'none',
                    stroke: ORB_ACCENTS[index % ORB_ACCENTS.length],
                    strokeWidth: 0.5,
                    opacity: 0.32 + weight * 0.26,
                    style: { pointerEvents: 'none' },
                  }),
                  h('circle', {
                    r: radius * 1.15,
                    fill: `url(#dmp-orb-${index})`,
                    className: 'dmp-node-core',
                    style: { pointerEvents: 'none' },
                  }),
                  h('circle', {
                    r: Math.max(1.1, radius * 0.44),
                    fill: coreColor,
                    opacity: 0.92,
                    style: { pointerEvents: 'none' },
                  }),
                  h('circle', {
                    r: Math.max(0.9, radius * 0.36),
                    cx: -radius * 0.18,
                    cy: -radius * 0.2,
                    fill: '#ffffff',
                    opacity: lit ? 0.85 : 0.6,
                    style: { pointerEvents: 'none' },
                  }),
                  isFocus
                    ? h('circle', {
                      r: radius + 5,
                      fill: 'none',
                      stroke: '#ffffff',
                      strokeWidth: 0.9,
                      opacity: 0.9,
                      strokeDasharray: '3 4',
                      style: { pointerEvents: 'none' },
                    })
                    : null,
                  h('title', null, `${page.title}${page.summary ? ` — ${page.summary}` : ''}`)
                )
              })
            ),
            labels
          )
        ),
        groupsPresent.length > 1
          ? h('div', {
            style: {
              position: 'absolute',
              left: 16,
              bottom: 34,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              maxWidth: 'calc(100% - 120px)',
              pointerEvents: 'none',
            },
          }, groupsPresent.map((definition) => h('span', {
            key: definition.key,
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              letterSpacing: 0.8,
              color: 'rgba(190, 204, 240, 0.52)',
            },
          },
            h('span', {
              style: { width: 4, height: 4, borderRadius: '50%', background: definition.color, opacity: 0.85 },
            }),
            String(groupLabel(definition.key)).toUpperCase()
          )))
          : null,
        h('div', {
          style: {
            position: 'absolute',
            top: 12,
            right: 14,
            display: 'inline-flex',
            gap: 6,
          },
        },
          h('button', {
            type: 'button',
            className: 'dmp-btn',
            onClick: toggleAuto,
            title: auto ? t('autoOff') : t('autoOn'),
            style: {
              ...S.btn,
              width: 27,
              height: 27,
              padding: 0,
              fontSize: 10,
              lineHeight: '25px',
              background: 'rgba(4, 6, 14, 0.55)',
              color: 'rgba(220, 230, 255, 0.72)',
              border: '1px solid rgba(255, 255, 255, 0.13)',
              borderRadius: 3,
            },
          }, auto ? '❚❚' : '▶'),
          h('button', {
            type: 'button',
            className: 'dmp-btn',
            onClick: reset,
            title: t('resetView'),
            style: {
              ...S.btn,
              width: 27,
              height: 27,
              padding: 0,
              fontSize: 12,
              lineHeight: '25px',
              background: 'rgba(4, 6, 14, 0.55)',
              color: 'rgba(220, 230, 255, 0.72)',
              border: '1px solid rgba(255, 255, 255, 0.13)',
              borderRadius: 3,
            },
          }, '⟲')
        ),
        latestCall
          ? h('div', {
            key: `call-chip-${latestCall.path}-${latestCall.call.at}`,
            className: 'dmp-call-chip',
            style: {
              position: 'absolute',
              right: 14,
              bottom: 11,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '4px 9px',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(4, 6, 14, 0.6)',
              fontSize: 9,
              letterSpacing: 0.7,
              color: 'rgba(226, 236, 255, 0.78)',
              pointerEvents: 'none',
            },
          },
            h('span', {
              style: {
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: latestCall.call.kind === 'boot' ? '#ffe7b0' : '#b7dcff',
                boxShadow: '0 0 8px currentColor',
              },
            }),
            `${t('recalling')} · ${clipLabel(latestCall.title, 18)}`
          )
          : null,
        h('div', {
          style: {
            position: 'absolute',
            left: 16,
            bottom: 11,
            fontSize: 9,
            letterSpacing: 0.7,
            color: 'rgba(176, 192, 230, 0.42)',
            pointerEvents: 'none',
          },
        }, (links || []).length === 0 ? t('graphNoLinks') : t('graphHint'))
      )
    }

    /* ------------------------------------------------------------------ */
    /* Panel                                                               */
    /* ------------------------------------------------------------------ */

    function MemoryPanel(props) {
      const t = useT(props)

      const [tree, setTree] = React.useState({ status: 'loading' })
      const [treeTick, setTreeTick] = React.useState(0)
      const [pageTick, setPageTick] = React.useState(0)
      const [selected, setSelected] = React.useState(null)
      const [view, setView] = React.useState('graph')
      const [page, setPage] = React.useState({ status: 'idle' })
      const [filter, setFilter] = React.useState('')
      const [editing, setEditing] = React.useState(false)
      const [draft, setDraft] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [saveError, setSaveError] = React.useState('')
      const [saved, setSaved] = React.useState(false)
      const [revealError, setRevealError] = React.useState('')
      const [compacting, setCompacting] = React.useState(false)
      const [tidyNote, setTidyNote] = React.useState('')
      const [hits, setHits] = React.useState(null)
      const [hitsBusy, setHitsBusy] = React.useState(false)
      const [activity, setActivity] = React.useState([])
      const activitySince = React.useRef(0)
      const scrollRef = React.useRef(null)

      React.useEffect(() => {
        let alive = true
        let timer = 0
        const poll = async () => {
          try {
            const response = await fetch(`${ACTIVITY_URL}?since=${activitySince.current}`, {
              headers: { accept: 'application/json' },
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json().catch(() => ({}))
            const events = Array.isArray(data.events) ? data.events : []
            if (!alive) return
            if (events.length > 0) {
              let newest = activitySince.current
              for (const event of events) {
                const at = Number(event.at) || 0
                if (at > newest) newest = at
              }
              activitySince.current = newest
              setActivity((prev) => [...prev, ...events].slice(-60))
            }
          } catch {
            // Activity is decorative; the panel keeps working without it.
          }
          if (alive) timer = setTimeout(poll, 1800)
        }
        void poll()
        return () => {
          alive = false
          clearTimeout(timer)
        }
      }, [])

      React.useEffect(() => {
        let alive = true
        setTree((prev) => (prev.status === 'ready' ? { ...prev, loading: true } : { status: 'loading' }))
        fetch(TREE_URL, { headers: { accept: 'application/json' } })
          .then(async (response) => {
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
            return data
          })
          .then((data) => {
            if (!alive) return
            setTree({ status: 'ready', ...data })
            setSelected((prev) => {
              const pages = Array.isArray(data.pages) ? data.pages : []
              if (prev && pages.some((item) => item.path === prev)) return prev
              return null
            })
          })
          .catch((error) => {
            if (alive) setTree({ status: 'error', message: error.message })
          })
        return () => { alive = false }
      }, [treeTick])

      React.useEffect(() => {
        if (!selected) {
          setPage({ status: 'idle' })
          setEditing(false)
          return undefined
        }
        let alive = true
        setPage({ status: 'loading' })
        setEditing(false)
        setSaveError('')
        fetch(`${PAGE_URL}?path=${encodeURIComponent(selected)}`, { headers: { accept: 'application/json' } })
          .then(async (response) => {
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
            return data
          })
          .then((data) => {
            if (!alive) return
            setPage({ status: 'ready', data })
            setDraft(typeof data.content === 'string' ? data.content : '')
          })
          .catch((error) => {
            if (alive) setPage({ status: 'error', message: error.message })
          })
        return () => { alive = false }
      }, [selected, pageTick])

      React.useEffect(() => {
        if (!saved) return undefined
        const timer = setTimeout(() => setSaved(false), 2000)
        return () => clearTimeout(timer)
      }, [saved])

      React.useEffect(() => {
        const query = filter.trim()
        if (query.length < 2) {
          setHits(null)
          setHitsBusy(false)
          return undefined
        }
        let alive = true
        setHitsBusy(true)
        const timer = setTimeout(() => {
          fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=40`, { headers: { accept: 'application/json' } })
            .then(async (response) => {
              const data = await response.json().catch(() => ({}))
              if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
              return data
            })
            .then((data) => {
              if (!alive) return
              setHits(Array.isArray(data.results) ? data.results : [])
              setHitsBusy(false)
            })
            .catch(() => {
              if (!alive) return
              setHits([])
              setHitsBusy(false)
            })
        }, 220)
        return () => { alive = false; clearTimeout(timer) }
      }, [filter])

      React.useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0
      }, [selected])

      const refreshTree = () => setTreeTick((value) => value + 1)

      const tidy = async () => {
        if (compacting) return
        if (typeof window !== 'undefined' && typeof window.confirm === 'function' && !window.confirm(t('tidyConfirm'))) return
        setCompacting(true)
        setTidyNote('')
        try {
          const response = await fetch(COMPACT_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({ retainDays: 45 }),
          })
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
          if (!data.changed) {
            setTidyNote(t('tidyNothing'))
          } else {
            const kb = Math.max(0, Math.round(((data.bytesBefore || 0) - (data.bytesAfter || 0)) / 1024))
            setTidyNote(t('tidyDone').replace('{count}', String(data.archivedEntries || 0)).replace('{kb}', String(kb)))
          }
          refreshTree()
        } catch (error) {
          setTidyNote(t('tidyFailed').replace('{message}', error.message))
        } finally {
          setCompacting(false)
        }
      }

      const allPages = tree.status === 'ready' ? tree.pages || [] : []
      const pageMap = React.useMemo(() => {
        const map = new Map()
        for (const item of allPages) map.set(item.path, item)
        return map
      }, [tree])

      const matchPaths = React.useMemo(() => {
        if (filter.trim().length < 2 || !hits) return null
        return new Set(hits.map((hit) => hit.path))
      }, [filter, hits])

      const hotPages = React.useMemo(
        () => allPages
          .slice()
          .sort((a, b) => (Number(b.heat) || 0) - (Number(a.heat) || 0))
          .slice(0, 6),
        [tree]
      )
      const recentPages = React.useMemo(
        () => allPages.slice().sort((a, b) => String(b.mtime).localeCompare(String(a.mtime))).slice(0, 3),
        [tree]
      )
      const recentCalls = React.useMemo(() => {
        const seen = new Set()
        const items = []
        for (let index = activity.length - 1; index >= 0 && items.length < 5; index -= 1) {
          const event = activity[index]
          if (!event || typeof event.path !== 'string' || seen.has(event.path)) continue
          const page = pageMap.get(event.path)
          if (!page) continue
          seen.add(event.path)
          items.push(page)
        }
        return items
      }, [activity, pageMap])

      const changeView = (next) => {
        setView(next)
        if (next === 'list' && !selected && tree.status === 'ready') {
          const pages = tree.pages || []
          const preferred = pages.find((item) => item.path === 'SOUL.md') || pages[0]
          if (preferred) setSelected(preferred.path)
        }
      }

      const reveal = async (path) => {
        try {
          const response = await fetch(REVEAL_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(path ? { path } : {}),
          })
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setRevealError('')
        } catch (error) {
          setRevealError(error.message)
        }
      }

      const save = async () => {
        if (!selected || busy) return
        setBusy(true)
        setSaveError('')
        try {
          const response = await fetch(PAGE_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ path: selected, content: draft }),
          })
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setEditing(false)
          setSaved(true)
          setPageTick((value) => value + 1)
          setTreeTick((value) => value + 1)
        } catch (error) {
          setSaveError(error.message)
        } finally {
          setBusy(false)
        }
      }

      const navigate = (href) => {
        const target = resolveHref(selected, href)
        if (target) setSelected(target)
      }

      const clusterGroups = React.useMemo(() => {
        if (tree.status !== 'ready') return []
        const clusters = Array.isArray(tree.clusters) ? tree.clusters : []
        if (clusters.length === 0) return []
        const pages = tree.pages || []
        const byPath = new Map(pages.map((item) => [item.path, item]))
        return clusters
          .map((cluster) => ({
            key: cluster.key,
            kind: cluster.kind,
            label: clusterLabel(cluster, t),
            color: CLUSTER_COLORS[cluster.kind] || '#9aa6c9',
            pages: (cluster.pages || [])
              .map((path) => byPath.get(path))
              .filter(Boolean)
              .sort((a, b) => (Number(b.heat) || 0) - (Number(a.heat) || 0)),
          }))
          .filter((group) => group.pages.length > 0)
      }, [tree, t])

      const groups = React.useMemo(() => {
        if (tree.status !== 'ready') return []
        const needle = filter.trim().toLowerCase()
        const matches = (item) => !needle
          || `${item.title || ''} ${item.summary || ''} ${item.path || ''}`.toLowerCase().includes(needle)
        if (clusterGroups.length > 0) {
          return clusterGroups
            .map((group) => ({ ...group, pages: group.pages.filter(matches) }))
            .filter((group) => group.pages.length > 0)
        }
        const pages = (tree.pages || []).filter(matches)
        const definitions = [
          { key: 'core', label: 'groupCore', match: (item) => !item.path.includes('/') },
          { key: 'identity', label: 'groupIdentity', match: (item) => item.path.startsWith('identity/') },
          { key: 'user', label: 'groupUser', match: (item) => item.path.startsWith('user/') },
          { key: 'skills', label: 'groupSkills', match: (item) => item.path.startsWith('skills/') },
          { key: 'decisions', label: 'groupDecisions', match: (item) => item.path.startsWith('decisions/') },
          { key: 'projects', label: 'groupProjects', match: (item) => item.path.startsWith('projects/') },
          { key: 'concepts', label: 'groupConcepts', match: (item) => item.path.startsWith('concepts/') },
        ]
        const known = new Set(definitions.filter((def) => def.key !== 'core').map((def) => def.key))
        const sortCore = (a, b) => {
          const ai = CORE_ORDER.indexOf(a.path)
          const bi = CORE_ORDER.indexOf(b.path)
          if (ai !== bi) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
          return String(a.title).localeCompare(String(b.title))
        }
        const sortWarm = (a, b) => {
          const as = Number(a.heat) || a.salience || 9
          const bs = Number(b.heat) || b.salience || 9
          if (as !== bs) return bs - as
          return String(b.mtime).localeCompare(String(a.mtime))
        }
        const result = []
        for (const definition of definitions) {
          const items = pages.filter(definition.match)
          if (items.length === 0) continue
          items.sort(definition.key === 'core' ? sortCore : sortWarm)
          result.push({
            key: definition.key,
            label: t(definition.label),
            color: GROUP_BY_KEY.get(definition.key)?.color || '#9aa6c9',
            pages: items,
          })
        }
        const extras = new Map()
        for (const item of pages) {
          if (!item.path.includes('/')) continue
          const top = item.path.split('/')[0]
          if (known.has(top)) continue
          if (!extras.has(top)) extras.set(top, [])
          extras.get(top).push(item)
        }
        for (const [top, items] of extras) {
          result.push({ key: `extra-${top}`, label: top, color: '#9aa6c9', pages: items.sort(sortWarm) })
        }
        return result
      }, [tree, filter, clusterGroups, t])

      const counts = tree.status === 'ready' ? tree.counts : null
      const subtitle = tree.status === 'loading'
        ? t('loading')
        : tree.status === 'error'
          ? t('error', { message: tree.message })
          : [
            counts ? t('pagesCount', { count: counts.pages || 0 }) : '',
            counts && counts.hot ? t('hotCount', { count: counts.hot }) : '',
            counts && counts.links ? t('linksCount', { count: counts.links }) : '',
            counts && counts.clusters ? t('clustersCount', { count: counts.clusters }) : '',
            tidyNote,
          ].filter(Boolean).join(' · ')

      const renderItem = (item) => h('button', {
        key: item.path,
        type: 'button',
        className: 'dmp-item',
        'data-active': selected === item.path ? 'true' : 'false',
        title: item.path,
        onClick: () => setSelected(item.path),
        style: {
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '7px 10px',
          marginBottom: 1,
          border: 'none',
          borderRadius: 7,
          background: selected === item.path ? 'var(--dsw-alias-bg-layer-2)' : 'transparent',
          color: 'inherit',
          fontFamily: 'inherit',
          cursor: 'pointer',
        },
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 } },
          item.salience
            ? h('span', {
              style: {
                width: 5,
                height: 5,
                borderRadius: '50%',
                flex: 'none',
                background: dotColor(item.salience),
              },
            })
            : null,
          h('span', {
            style: {
              fontSize: 12.5,
              fontWeight: selected === item.path ? 600 : 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }, item.title)
        ),
        item.summary
          ? h('div', {
            style: {
              marginTop: 2,
              paddingLeft: item.salience ? 11 : 0,
              fontSize: 11,
              lineHeight: 1.4,
              color: 'var(--dsw-alias-label-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            },
          }, item.summary)
          : null
      )

      const listBlock = (key, label, items) => items.length > 0        ? h('div', { key, style: { marginBottom: 8 } },
          h('div', {
            style: {
              padding: '6px 10px 4px',
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'var(--dsw-alias-label-secondary)',
            },
          }, label),
          items.map(renderItem)
        )
        : null

      const renderHit = (hit, index) => h('button', {
        key: `hit-${hit.path}`,
        type: 'button',
        className: 'dmp-item',
        'data-active': selected === hit.path ? 'true' : 'false',
        onClick: () => setSelected(hit.path),
        style: {
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '7px 9px',
          border: 'none',
          borderRadius: 7,
          background: selected === hit.path ? 'var(--dsw-alias-bg-layer-2)' : 'transparent',
          color: 'inherit',
          fontFamily: 'inherit',
          cursor: 'pointer',
        },
      },
        h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 } },
          h('span', {
            style: { fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
          }, hit.title),
          h('span', {
            style: { marginLeft: 'auto', flex: 'none', fontSize: 10, color: 'var(--dsw-alias-label-secondary)' },
          }, `#${index + 1}`)
        ),
        h('div', {
          style: { marginTop: 1, fontSize: 10, color: 'var(--dsw-alias-label-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        }, hit.path),
        hit.snippet
          ? h('div', {
            style: { marginTop: 3, fontSize: 11, lineHeight: 1.45, color: 'var(--dsw-alias-label-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
          }, hit.snippet)
          : null
      )

      let detail = null
      if (tree.status === 'loading') {
        detail = h('div', { style: S.centerMuted }, t('loading'))
      } else if (tree.status === 'error') {
        detail = h('div', { style: { padding: '40px 0' } },
          h('div', { style: S.errorText }, t('error', { message: tree.message })),
          h('div', { style: { marginTop: 12 } },
            h('button', {
              type: 'button',
              className: 'dmp-btn',
              style: S.btn,
              onClick: refreshTree,
            }, t('retry'))
          )
        )
      } else if (tree.exists === false) {
        detail = h('div', { style: { padding: '40px 0' } },
          h('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, t('emptyDir')),
          h('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', wordBreak: 'break-all' } }, t('emptyDirHint', { dir: tree.dir }))
        )
      } else if (!selected) {
        detail = h('div', { style: S.centerMuted }, t('noSelection'))
      } else if (page.status === 'loading') {
        detail = h('div', { style: S.centerMuted }, t('loading'))
      } else if (page.status === 'error') {
        detail = h('div', { style: { padding: '40px 0' } },
          h('div', { style: S.errorText }, t('error', { message: page.message })),
          h('div', { style: { marginTop: 12 } },
            h('button', {
              type: 'button',
              className: 'dmp-btn',
              style: S.btn,
              onClick: () => setPageTick((value) => value + 1),
            }, t('retry'))
          )
        )
      } else if (page.status === 'ready') {
        const data = page.data
        const meta = data.meta || {}
        const compact = view === 'graph'
        const title = typeof meta.title === 'string' && meta.title.trim()
          ? meta.title.trim()
          : String(data.path).split('/').pop().replace(/\.md$/i, '')
        const salience = Number(meta.salience)
        const chips = []
        if (meta.type) chips.push(TYPE_KEYS[meta.type] ? t(TYPE_KEYS[meta.type]) : String(meta.type))
        if (Number.isFinite(salience) && salience >= 1 && salience <= 3) {
          const key = salience === 1 ? 'salienceHot' : salience === 2 ? 'salienceWarm' : 'salienceCold'
          chips.push(`${salience} · ${t(key)}`)
        }
        if (meta.date) chips.push(String(meta.date))
        if (data.mtime) chips.push(t('updated', { time: formatDate(data.mtime) }))
        const body = stripFrontmatter(data.content || '')
        chips.push(t('chars', { count: body.replace(/\s+/g, '').length }))
        const backlinkPages = Array.from(new Set((tree.links || [])
          .filter((link) => link.target === data.path)
          .map((link) => link.source)))
          .map((path) => pageMap.get(path))
          .filter(Boolean)
        const headings = body.split('\n')
          .map((line) => {
            const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line)
            return match ? { level: match[1].length, text: match[2].replace(/[*_`]/g, '').trim() } : null
          })
          .filter(Boolean)
          .slice(0, 14)

        detail = h('div', { style: { maxWidth: compact ? 'none' : 840, margin: '0 auto' } },
          h('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 } },
            h('div', { style: { flex: 1, minWidth: 150 } },
              h('h1', { style: { margin: 0, fontSize: compact ? 18.5 : 22, lineHeight: 1.35, fontWeight: 650, wordBreak: 'break-word' } }, title),
              chips.length > 0
                ? h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 } },
                  chips.map((chip, index) => h('span', { key: `chip${index}`, style: S.chip }, chip)))
                : null
            ),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, flex: 'none', alignItems: 'center', justifyContent: 'flex-end' } },
              saved ? h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-state-success-primary)' } }, t('saved')) : null,
              editing
                ? [
                  h('button', {
                    key: 'save',
                    type: 'button',
                    className: 'dmp-btn',
                    disabled: busy,
                    style: { ...S.btn, color: 'var(--dsw-alias-brand-primary)', borderColor: 'var(--dsw-alias-brand-primary)' },
                    onClick: save,
                  }, busy ? t('saving') : t('save')),
                  h('button', {
                    key: 'cancel',
                    type: 'button',
                    className: 'dmp-btn',
                    disabled: busy,
                    style: S.btn,
                    onClick: () => { setEditing(false); setSaveError('') },
                  }, t('cancel')),
                ]
                : h('button', {
                  key: 'edit',
                  type: 'button',
                  className: 'dmp-btn',
                  style: S.btn,
                  onClick: () => { setDraft(data.content); setEditing(true) },
                }, t('edit')),
              h('button', {
                type: 'button',
                className: 'dmp-btn',
                style: S.btn,
                title: t('revealPage'),
                onClick: () => reveal(data.path),
              }, t('revealPage'))
            )
          ),
          editing
            ? h('div', { style: { marginTop: 16 } },
              h('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', marginBottom: 6 } },
                `${t('editingHint')} — ${data.path}`),
              h('textarea', {
                value: draft,
                onChange: (event) => setDraft(event.target.value),
                spellCheck: false,
                style: {
                  width: '100%',
                  height: 'calc(100vh - 300px)',
                  minHeight: 320,
                  resize: 'vertical',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--dsw-alias-border-l1)',
                  background: 'var(--dsw-alias-bg-layer-1)',
                  color: 'var(--dsw-alias-label-primary)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  outline: 'none',
                  boxSizing: 'border-box',
                },
              }),
              saveError ? h('div', { style: { marginTop: 10, ...S.errorText } }, t('saveFailed', { message: saveError })) : null
            )
            : h('article', {
              style: { marginTop: 18, fontSize: 13.5, lineHeight: 1.8, color: 'var(--dsw-alias-label-primary)' },
            }, renderMarkdown(stripFrontmatter(data.content), navigate)),
          h('div', {
            style: {
              marginTop: 28,
              paddingTop: 16,
              borderTop: '1px solid var(--dsw-alias-border-l1)',
              display: 'grid',
              gap: 16,
            },
          },
            h('div', null,
              h('div', { style: { fontSize: 10.5, fontWeight: 650, letterSpacing: '0.06em', color: 'var(--dsw-alias-label-secondary)', marginBottom: 8 } },
                `${t('backlinks')} · ${backlinkPages.length}`),
              backlinkPages.length > 0
                ? h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
                  backlinkPages.map((item) => h('button', {
                    key: `back-${item.path}`,
                    type: 'button',
                    className: 'dmp-btn',
                    title: item.path,
                    style: { ...S.btn, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                    onClick: () => setSelected(item.path),
                  }, item.title)))
                : h('div', { style: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' } }, t('noBacklinks'))
            ),
            headings.length > 1
              ? h('div', null,
                h('div', { style: { fontSize: 10.5, fontWeight: 650, letterSpacing: '0.06em', color: 'var(--dsw-alias-label-secondary)', marginBottom: 8 } }, t('outline')),
                h('div', { style: { display: 'grid', gap: 3 } },
                  headings.map((heading, index) => h('div', {
                    key: `heading-${index}`,
                    style: {
                      paddingLeft: (heading.level - 1) * 12,
                      fontSize: heading.level === 1 ? 12.5 : 11.5,
                      lineHeight: 1.5,
                      color: heading.level === 1 ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }, heading.text)))
              )
              : null
          )
        )
      }

      return h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          background: 'var(--dsw-alias-bg-base)',
          color: 'var(--dsw-alias-label-primary)',
        },
      },
        h('header', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 20px',
            borderBottom: '1px solid var(--dsw-alias-border-l1)',
            flex: 'none',
          },
        },
          h('div', { style: { flex: 1, minWidth: 0 } },
            h('div', { style: { fontSize: 15, fontWeight: 650, lineHeight: 1.3 } }, t('title')),
            h('div', {
              title: tree.status === 'ready' ? tree.dir : '',
              style: {
                marginTop: 1,
                fontSize: 11,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: tree.status === 'error'
                  ? 'var(--dsw-alias-state-error-primary)'
                  : 'var(--dsw-alias-label-secondary)',
              },
            }, subtitle)
          ),
          h('div', {
            style: {
              display: 'inline-flex',
              flex: 'none',
              gap: 2,
              padding: 2,
              borderRadius: 8,
              border: '1px solid var(--dsw-alias-border-l1)',
              background: 'var(--dsw-alias-bg-layer-1)',
            },
          },
            ['graph', 'list'].map((key) => h('button', {
              key,
              type: 'button',
              onClick: () => changeView(key),
              style: {
                height: 24,
                padding: '0 11px',
                border: 'none',
                borderRadius: 6,
                fontFamily: 'inherit',
                fontSize: 11.5,
                cursor: 'pointer',
                background: view === key ? 'var(--dsw-alias-bg-layer-2)' : 'transparent',
                color: view === key ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
              },
            }, t(key === 'graph' ? 'viewGraph' : 'viewList')))
          ),
          h('input', {
            className: 'dmp-input',
            value: filter,
            onChange: (event) => setFilter(event.target.value),
            onKeyDown: (event) => {
              if (event.key !== 'Enter') return
              const first = hits && hits[0] ? hits[0].path : groups.length > 0 && groups[0].pages[0] ? groups[0].pages[0].path : null
              if (first) {
                event.preventDefault()
                setSelected(first)
              }
            },
            placeholder: t('search'),
            'aria-label': t('search'),
            style: S.input,
          }),
          h('button', {
            type: 'button',
            className: 'dmp-btn',
            style: S.btn,
            title: tidyNote || t('tidyConfirm'),
            onClick: tidy,
            disabled: compacting || tree.status === 'loading',
          }, compacting ? t('tidying') : t('tidy')),
          h('button', {
            type: 'button',
            className: 'dmp-btn',
            style: S.btn,
            onClick: refreshTree,
            disabled: tree.status === 'loading',
          }, t('refresh')),
          h('button', {
            type: 'button',
            className: 'dmp-btn',
            style: S.btn,
            onClick: () => reveal(),
          }, t('openFolder'))
        ),
        h('div', { style: { display: 'flex', flex: 1, minHeight: 0 } },
          view === 'graph'
            ? h('div', { style: { position: 'relative', flex: 1, minWidth: 0, minHeight: 0, display: 'flex' } },
              tree.status === 'ready' && tree.exists !== false && (tree.pages || []).length > 0
                ? h(GraphView, {
                  pages: tree.pages,
                  links: tree.links || [],
                  groups: clusterGroups,
                  selected,
                  onSelect: setSelected,
                  filter,
                  matchPaths,
                  activity,
                  t,
                })
                : h('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 } },
                  tree.status === 'ready' && tree.exists !== false && (tree.pages || []).length === 0
                    ? h('div', { style: S.centerMuted }, t('noPages'))
                    : detail),
              filter.trim().length >= 2
                ? h('div', {
                  className: 'dmp-scroll',
                  style: {
                    position: 'absolute',
                    left: 14,
                    top: 14,
                    width: 292,
                    maxHeight: '62%',
                    overflowY: 'auto',
                    padding: '10px 10px 8px',
                    borderRadius: 12,
                    border: '1px solid var(--dsw-alias-border-l1)',
                    background: 'var(--dsw-alias-bg-overlay)',
                    boxShadow: '0 12px 36px color-mix(in srgb, #000 34%, transparent)',
                    backdropFilter: 'blur(10px)',
                  },
                },
                  h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6, padding: '0 2px 6px' } },
                    h('span', { style: { fontSize: 10.5, fontWeight: 650, letterSpacing: '0.05em', color: 'var(--dsw-alias-label-secondary)' } },
                      hitsBusy ? t('searching') : t('searchResults', { count: hits ? hits.length : 0 })),
                    h('span', { style: { marginLeft: 'auto', fontSize: 9.5, color: 'var(--dsw-alias-label-secondary)' } }, t('searchHint'))
                  ),
                  hits && hits.length > 0
                    ? hits.map(renderHit)
                    : h('div', { style: { padding: '8px 4px 10px', fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' } },
                      hitsBusy ? t('searching') : t('searchEmpty'))
                )
                : null
            )
            : null,
          h('aside', {
            className: 'dmp-scroll',
            style: {
              width: 268,
              flex: 'none',
              borderRight: '1px solid var(--dsw-alias-border-l1)',
              overflowY: 'auto',
              padding: '8px 8px 28px',
              display: view === 'graph' ? 'none' : 'block',
            },
          },
            tree.status === 'ready' && tree.exists === false
              ? h('div', { style: S.muted },
                h('div', { style: { fontWeight: 600, color: 'var(--dsw-alias-label-primary)', marginBottom: 4 } }, t('emptyDir')),
                h('div', { style: { wordBreak: 'break-all' } }, tree.dir))
              : null,
            tree.status === 'ready' && tree.exists !== false && groups.length === 0
              ? h('div', { style: S.muted }, t('noMatch'))
              : null,
            !filter.trim() ? listBlock('recentCalls', t('recentCalls'), recentCalls) : null,
            !filter.trim() ? listBlock('hot', t('hotPages'), hotPages) : null,
            !filter.trim() ? listBlock('recent', t('recent'), recentPages) : null,
            groups.map((group) => listBlock(`group-${group.key}`, group.label, group.pages))
          ),
          h('section', {
            style: {
              flex: view === 'graph' ? 'none' : 1,
              width: view === 'graph' ? 400 : undefined,
              display: view === 'graph' && !selected ? 'none' : 'flex',
              minWidth: 0,
              flexDirection: 'column',
              borderLeft: view === 'graph' ? '1px solid var(--dsw-alias-border-l1)' : 'none',
              background: view === 'graph' ? 'var(--dsw-alias-bg-layer-1)' : 'transparent',
            },
          },
            revealError
              ? h('div', {
                style: {
                  flex: 'none',
                  padding: '8px 20px',
                  fontSize: 11.5,
                  color: 'var(--dsw-alias-state-error-primary)',
                  borderBottom: '1px solid var(--dsw-alias-border-l1)',
                },
              }, revealError)
              : null,
            h('div', {
              ref: scrollRef,
              className: 'dmp-scroll',
              style: {
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: view === 'graph' ? '18px 20px 64px' : '26px 40px 80px',
              },
            }, detail)
          )
        )
      )
    }

    /* ------------------------------------------------------------------ */
    /* Plugin                                                              */
    /* ------------------------------------------------------------------ */

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, DICTS), 'memory-panel: dictionaries')

      const activeOf = (value) => {
        const raw = typeof value === 'string' ? value : value && typeof value.active === 'string' ? value.active : ''
        return raw === 'en' ? 'en' : raw === 'zh' ? 'zh' : ''
      }
      ctx.effect(() => {
        try {
          const initial = activeOf(ctx.locale.getSnapshot())
          if (initial) localeStore.set(initial)
          return ctx.locale.subscribe((snapshot) => {
            const next = activeOf(snapshot)
            if (next) localeStore.set(next)
          })
        } catch {
          return undefined
        }
      }, 'memory-panel: locale sync')

      ctx.effect(() => {
        if (typeof document === 'undefined') return undefined
        const style = document.createElement('style')
        style.setAttribute('data-dsh-memory-panel', '')
        style.textContent = [
          '.dmp-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }',
          '.dmp-btn:disabled { opacity: .55; cursor: default; }',
          '.dmp-item:hover { background: var(--dsw-alias-bg-layer-1); }',
          '.dmp-item[data-active="true"] { background: var(--dsw-alias-bg-layer-2); }',
          '.dmp-link:hover { text-decoration: underline; }',
          '.dmp-input::placeholder { color: var(--dsw-alias-label-secondary); }',
          '.dmp-input:focus { border-color: var(--dsw-alias-brand-primary); }',
          '.dmp-scroll { scrollbar-width: thin; }',
          '@keyframes dmp-twinkle { 0%, 100% { opacity: var(--dmp-min, .28); } 50% { opacity: 1; } }',
          '@keyframes dmp-node-pulse { 0%, 100% { opacity: var(--dmp-min, .62); } 50% { opacity: 1; } }',
          '@keyframes dmp-galaxy-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
          '@keyframes dmp-galaxy-breathe { 0%, 100% { opacity: .82; } 50% { opacity: 1; } }',
          '@keyframes dmp-meteor { 0%, 86% { opacity: 0; transform: translate(0, 0); } 88% { opacity: .85; } 95% { opacity: .5; } 100% { opacity: 0; transform: translate(150px, 70px); } }',
          '@keyframes dmp-call { 0% { opacity: .95; transform: scale(.5); } 70% { opacity: .35; } 100% { opacity: 0; transform: scale(2.6); } }',
          '@keyframes dmp-call-beam { 0% { opacity: 0; } 12% { opacity: .75; } 100% { opacity: 0; } }',
          '@keyframes dmp-call-chip { 0% { opacity: 0; transform: translateY(4px); } 10% { opacity: 1; transform: none; } 82% { opacity: 1; } 100% { opacity: 0; } }',
          '.dmp-star { animation-name: dmp-twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }',
          '.dmp-river-star { animation-name: dmp-twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }',
          '.dmp-galaxy { animation: dmp-galaxy-spin 260s linear infinite, dmp-galaxy-breathe 19s ease-in-out infinite; }',
          '.dmp-node-core { animation: dmp-node-pulse var(--dmp-dur, 6s) ease-in-out infinite; animation-delay: var(--dmp-delay, 0s); }',
        '.dmp-node-grab { filter: drop-shadow(0 0 7px rgba(205, 228, 255, .9)); }',
          '.dmp-sun-core { animation: dmp-node-pulse 7.5s ease-in-out infinite; }',
          '.dmp-meteor { animation: dmp-meteor 13s linear infinite; opacity: 0; }',
          '.dmp-call-ring { transform-box: fill-box; transform-origin: center; animation: dmp-call 2.8s ease-out forwards; }',
          '.dmp-call-beam { animation: dmp-call-beam 2.2s ease-out forwards; }',
          '.dmp-call-chip { animation: dmp-call-chip 6s ease-out forwards; }',
          '.dmp-graph, .dmp-graph * { user-select: none; -webkit-user-select: none; }',
          '.dmp-graph ::selection { background: transparent; }',
        ].join('\n')
        document.head.appendChild(style)
        return () => style.remove()
      }, 'memory-panel: styles')

      const labelOf = () => {
        try {
          return ctx.locale.getSnapshot().active === 'en' ? 'Memory' : '记忆'
        } catch {
          return '记忆'
        }
      }

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        locale: NS,
        label: labelOf,
      }, MemoryIcon))

      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, MemoryPanel))
    }

    return { inject: ['slots', 'locale'], apply }
  },
})

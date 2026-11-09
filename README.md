# dsh-memory-panel

给 DeepSeek Harness 的记忆库加一个**左侧栏入口 + 中央星图面板**，并自己承担记忆注入，
可以替代 `dsh-plugin-memory` 独立使用。

它读取 `~/.memory`（或 `<dshHome>/memory-panel.json` 里配置的目录）中的 markdown 记忆库：
`SOUL.md`、`MEMORY.md`、`index.md`、`log.md`，以及
`identity/ user/ skills/ decisions/ projects/ concepts/` 下的页面。

## 功能

- 左侧栏「记忆」入口，点开即中央面板；会话启动时把 SOUL / MEMORY / **核心事实**
  （用户档案、协作偏好、当前项目各一句）/ **自动记忆地图** + 最近 3 条动态注入系统提示
  （约 7200 字符），提示 agent 收尾做 digest。
- **智能自动分类**：不依赖 tags（tags 常为空）。按 frontmatter `type` 占比决定策略：
  type 足够时按类型分面，缺失类型的页用词向量相似度归入最接近的簇；type 不足时按
  内容相似度 + 页间链接凝聚聚类。`SOUL/MEMORY/BOOTSTRAP/index/log` 固定为「元记忆」。
  每页带自动簇、簇标签与热度（salience + 连接数 + 新近度），星图分组、索引分组与
  启动块地图共用同一套分类结果。
- **星图**（默认）：近黑宇宙画布（720 颗背景星 + 150 颗银河带尘埃、缓慢自转的银河、
  偶发流星）；记忆页按**权重**变成不同亮度和大小的小行星——权重 = salience + 连接数 +
  新近度，越重越亮、光晕与十字芒越明显。每组是一颗小恒星，页面绕恒星缓慢公转，有前后
  景深。默认公转，点任意处暂停公转（背景星野与银河仍持续闪烁/流动），右上 ▶/❚❚ 恢复；
  拖拽平移、滚轮缩放、点星开右侧详情、点空白收起。**每个光点都能单独拖动摆位**，连线与
  标签实时跟随；拖动会先暂停公转，但**不会打开详情栏**——只有轻点（位移 < 4px）才展开。
  ⟲ 复位会把所有光点放回轨道。节点用簇色 + 白高光 +
  彩色细环 + 径向光晕，同一簇内也有不同色温的高光。
- **调用光环**：启动注入和面板打开过的页面会被 host 记一次调用；星图上对应恒星亮起一圈
  扩散光环、一束从簇心射向它的细光，右下角显示「调用 · 标题」，索引视图顶部也有
  「最近调用」。这是「哪些记忆真的被读了」的可见记录，而不是装饰。
- **索引**：自动簇分组，簇内按热度排序；常读与最近更新置顶，显示摘要与热度点。
- **全文检索**：输入 ≥2 字后走 `/search`，星图左上浮层列出命中页、路径与正文片段；
  回车打开第一条，星图同步只亮命中星。详情显示被引用页与标题大纲。
- 阅读页轻量 markdown 渲染；页内 `.md` 链接可跳转；详情带字符数、被引用页、标题大纲。
- 直接编辑 markdown 并保存（`raw/` 只读）；「打开目录 / 在文件夹中显示」调用文件管理器。
- **记忆整理（压缩）**：右上「整理」把 45 天前的 `log.md` 条目搬到
  `archive/log-YYYY.md`，`log.md` 只留最近记录和一行归档指针；原文不删除，随时可回溯。
  这样启动注入的「最近动态」不会随着日志无限变长。

## 安装

本机 `C:\Users\Administrator\.dsh` 是指向 `D:\dsh-home` 的 junction；直接安装 bundle 目录时
pnpm 生成的相对符号链接穿过 junction 会断掉（`dsh: cannot resolve profile bundle`）。
所以先打包、再装 tarball：

```powershell
cd D:\deepseek-harness\dsh-memory-panel
# 改动后先改 package.json 的 version，避免复用旧 tarball
npm pack --silent
```

```
plugin_manager action=install_bundle target="D:\\deepseek-harness\\dsh-memory-panel\\local-dsh-memory-panel-0.5.0.tgz"
```

安装后客户端半即时热挂载；Host 半的 Node 模块要等 DSH 客户端下次启动才换新代码。
装了本插件后可以卸载 `dsh-plugin-memory`，boot 注入与 digest 提醒由本插件接管。

本插件**不 import、不读取其它记忆插件的模块或配置**：记忆目录只认自己的
`memory-panel.json`，没有就用 `~/.memory`；boot 注入、`last_access` 回写、待沉淀提醒
都由自己的 host 完成。用只提供 `systemPrompt` / `webServer` 的假上下文跑 `.smoke.mjs`
即可验证这一点。卸载旧插件后会少掉它的 `memory` 技能说明与 `dsh-memory` 命令行，
但运行时的记忆注入与面板读写不受影响。

开发期自检：

```powershell
node --check index.js
node --check client.js
node .smoke.mjs   # tree/page/search/save/路径穿越/raw 只读/boot 块
```

## Host API

所有路由挂在 `/api/dsh-memory-panel`，仅本机同源页面使用：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/tree` | 页面树：`{ dir, exists, pages, links, clusters, counts }`；`clusters` 为自动分类结果，`links` 为页间 `.md` 引用 |
| GET | `/page?path=identity/lan.md` | 读取一页：`{ path, content, meta, mtime }` |
| GET | `/search?q=关键词&limit=40` | 全文检索：`{ query, total, results:[{path,title,summary,snippet,line,score}] }` |
| POST | `/page` | 保存 `{ path, content }`，只允许 `.md`、禁止 `raw/` |
| POST | `/compact` | 归档旧日志：`{ retainDays?:45 }`，返回归档条数、保留条数与字节变化 |
| POST | `/reveal` | 在文件管理器中显示目录或 `{ path }` 指定的页 |

## 边界

- 只读写记忆目录内的 `.md` 文件；路径穿越会被拒绝，`raw/` 大小写均只读。
- 不做自动改记忆：面板只保存你按下「保存」的那一页；boot 注入只更新 `last_access`。
- 星图用固定深空配色（不随主题走），保证星云与标签在浅色主题下也有足够对比；其余界面仍用主题 token。

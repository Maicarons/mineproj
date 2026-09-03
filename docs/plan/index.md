# mineproj · 产品技术方案

> 文档版本：**v1.1**（v1.0 评审后修订）
> 创建日期：2026-09-03
> 最后更新：2026-09-03
> 状态：待评审
> 关联文档：[《开发计划》](./development)（对应仓库根目录 `README.md`）、[文档站首页](/)
>
> **v1.1 变更摘要**
> 1. **默认主题为 `@mineproj/theme-classic`** —— 借鉴内容平台的**信息架构与浏览范式**（卡片网格、标签筛选、悬停预览、详情主列 + 侧边元信息栏、可玩面板），**视觉语言回归简洁大方的大众风格**：中性浅色为主 + 深色模式、Inter + JetBrains Mono、12px 圆角、1280px 内容宽、充足留白。深色沉浸式视觉降为可选官方主题 `@mineproj/theme-gallery`，二者走完全相同的主题契约。
> 2. **新增 Markdown 内容管线**（§12）：GFM + Shiki 构建期高亮（零运行时）+ 数学/图表 + 目录 + 摘录 + 安全净化。
> 3. **新增富媒体预览**（§11.4 / §11.5）：PDF 内嵌阅读器（pdf.js 按需懒加载 + 三级降级）、图片灯箱（缩放 / 平移 / 键盘 / 网格切换）。
> 4. **i18n 升级为一等能力**（§13）：路由前缀 + 字段级覆盖 + Markdown 分语言 + 回退链 + `hreflang` + 分语言搜索索引与 API。

---

## 0. 执行摘要

**mineproj** 是一款 **Apache-2.0 许可**的、**纯前端部署**的个人项目展示静态站点生成器。它把你的作品组织成一个 **项目库（Project Library）**：卡片网格、标签筛选、即时搜索、悬停预览、详情页内嵌可玩 Demo 与富媒体预览（PDF / 图片 / 视频）。

**展示范式学信息架构，视觉语言走大众审美。** 借鉴的是内容平台把"高密度陈列 + 多维筛选 + 一眼看成色"做到极致的**浏览范式**（卡片网格、标签筛选、悬停预览、详情主列 + 右侧元信息栏、可玩面板）；**不**照搬任何特定产品的皮肤——默认主题 `theme-classic` 走**中性、克制、国际化**的大众审美（浅色为主 / 深色模式可选、Inter + JetBrains Mono、12px 圆角、1280px 内容宽、充足留白）。偏好深色沉浸式陈列的用户可一键切到可选官方主题 `@mineproj/theme-gallery`。

全部内容由 **JSON + Markdown** 驱动，无需后端；构建产物是一份纯静态目录，同时输出一套**可直接 `fetch()` 的静态 API 端点**（`/api/v1/*.json`），让二次开发者既能"构建期内联数据"，也能"运行时请求数据"。

**主题与插件都是 npm 包**——默认主题 `@mineproj/theme-classic` 自身也是 npm 包，与第三方主题走完全相同的解析路径，以此保证契约不被腐化。插件系统采用"**mineproj 生命周期钩子 + 原生 Vite 插件透传**"双形态，直接复用整个 Vite/Rollup/unplugin 生态。

**i18n 是一等公民**：路由前缀（`/` + `/en/`）+ 字段级覆盖（`index.<locale>.json`）+ Markdown 分语言（`body.<locale>.md`）+ 回退链 + `hreflang`，UI 文案与内容文案分别治理。

SEO 与 AI 友好同样是一等公民：每项目一个静态 HTML 页、JSON-LD 结构化数据、`sitemap.xml` + `sitemap.md`、`robots.txt` 显式放行 AI 爬虫、`llms.txt` + `llms-full.txt`、**Markdown 镜像页**（`URL.md`）、`AGENTS.md`，并提供 `mineproj audit --seo --ai` 自检打分。

---

## 1. 调研结论

### 1.1 事实核查：「mineproj 是一款 Apache 开源的静态前端项目」

调研结论：**当前公开网络上不存在名为 `mineproj` 的 Apache 开源项目**。检索到的同名/近似仓库（`merrier/MineProject`、`ryhanhabdyny5-ui/mineproject` 等）均为个人练习性质的静态页面，与本项目定位无关。

因此本方案对这句话的解读与落地方式为：

| 解读 | 落地方式 |
|---|---|
| **A. 采用 Apache-2.0 许可证开源**（主解读） | 仓库根目录 `LICENSE`（Apache-2.0 全文）+ `NOTICE` + 源文件头注释；`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、DCO 签署 |
| **B. 遵循 ASF 的项目治理与工程规范** | 发版走 source release（`.tar.gz` + `.asc` 签名 + `SHA512` 校验和）、GitHub Discussions/Issue 驱动、PMC 式共识决策、release vote 流程（先按"预备"执行） |
| **C. 未来向 ASF 孵化器捐赠**（长期可选） | 预留合规位：默认主题提供可选 `asfBranding` 配置，自动注入 ASF 要求的导航链接（License / Sponsorship / Thanks / Security / Privacy）与商标归因脚注。注意：ASF 商标政策要求项目正式命名"Apache Xxx"并经品牌委员会批准，**未获批前不得使用 Apache 商标与羽毛标** |

> ⚠️ 合规提示：在成为正式 ASF 项目之前，对外表述应使用"**mineproj，一款以 Apache-2.0 许可证开源的静态项目展示生成器**"，而非"Apache mineproj"。

### 1.2 技术选型对比：为什么不直接用现成 SSG

2026 年 SSG 格局（多来源交叉验证）：**Astro** 是内容站新默认（零 JS + Islands + Content Collections + Zod schema）；**Hugo** 构建最快（Go 单二进制，1k 页约 5s）；**VitePress** 是文档站事实标准（Vue 绑定）；**11ty** 极简零框架；**Next.js** 是全栈混合体，纯静态场景偏重（即使静态页也带 React runtime）。

| 方案 | 优势 | 为什么不满足 mineproj |
|---|---|---|
| **Astro** | 零 JS 默认、Content Collections + Zod、框架无关 | 主题分发形态是 **starter 模板**（`npm create astro -- --template`），而非可组合的 **npm 主题包**；没有"项目库"这一固定数据模型；Astro 本身是框架，不是可嵌入的产品内核 |
| **VitePress** | 主题契约清晰、Vue 生态 | 绑定 Vue；主题对象仅 `{ Layout, NotFound, enhanceApp }` 三字段，无法表达"列表/详情/标签/合集/关于"多布局与组件级插槽；定位是文档站 |
| **11ty** | 极简、零 JS、多模板引擎 | 无内建数据模型与 schema；交互能力需自行装配；主题生态弱 |
| **Hugo** | 极速、单二进制 | Go 模板对 JS/TS 开发者门槛高；二次开发（React 组件、npm 插件）路径不畅 |
| **Next.js** | 生态最强、ISR | 静态输出仍带 ~80KB React runtime；不满足"极轻静态产物"目标；后端耦合倾向违背"纯前端"诉求 |

**结论：自建内核，但把重活外包给 Vite。**
mineproj 内核 = `Vite`（dev server / HMR / Rollup 管线 / SSR 模块加载）+ `React 19`（`renderToPipeableStream` 预渲染 + `hydrateRoot` 选择性水合）+ 自建的**配置解析 / 数据加载 / 路由生成 / 主题解析 / 插件钩子 / 产物发射**六件事。工作量可控，且天然继承 Vite 生态。

### 1.3 展示范式与视觉基线

#### 1.3.1 信息架构：内容平台的通行浏览范式

数字发行商店、素材市场、影视目录这类"海量条目"产品，在**如何被浏览**这件事上沉淀了一套与品牌无关的通行做法。mineproj 抽取其中可迁移的部分：

| 通行机制 | 本质 | mineproj 是否默认采纳 |
|---|---|---|
| 卡片网格，封面为第一信息 | 单屏高效陈列、视觉优先 | ✅ 采纳（放宽留白、圆角与间距） |
| 分面筛选（多维、实时生效、URL 同步） | faceted filtering | ✅ 采纳（分类 / 标签 / 状态 / 平台 / 年份 / 是否可玩） |
| 悬停展开更多信息（大图 + 摘要） | 不跳转即可判断成色 | ✅ 采纳（同时保证键盘与触屏可达） |
| 详情页 = 主列（媒体 / 正文）+ 右栏（元信息 / 入口） | 内容与事实分离 | ✅ 采纳 |
| 标签即入口 | 多维导航 | ✅ 采纳 |
| 横向导轨 + 悬停翻页 | 同类目横向浏览 | ⚠️ 弱化为首页可选模块（默认用网格，导轨留给"精选"） |
| 随机探索队列 | 缓解选择困难、提升长尾曝光 | ✅ 采纳为可选组件 |
| 深色高密陈列、0–2px 圆角、满幅无内边距卡片 | **皮肤层**，与具体品牌强绑定 | ❌ **不作为默认**，封装进可选主题 `@mineproj/theme-gallery` |

> 上述机制属于行业通行模式。本文不引用任何特定商业产品的设计规范、商标或品牌资产。

#### 1.3.2 默认视觉基线
#### 1.3.2 默认视觉基线（ui-ux-pro-max 设计系统输出）

以 `developer portfolio open source project gallery showcase clean minimal professional` 为输入，设计系统给出的推荐与 mineproj 的决策：

| 项 | 系统推荐 | mineproj 决策 |
|---|---|---|
| **页面范式** | Portfolio Grid：Hero（姓名 / 身份）→ 项目网格 → 关于 → 联系；悬停覆盖信息、灯箱查看、按类目筛选、"视觉优先、加载要快" | ✅ 采纳为首页骨架（末段改为「关于 + 页脚链接组」） |
| **色彩策略** | 中性背景让作品自己说话；正文纯黑 / 纯白；强调色**极简克制** | ✅ 采纳 |
| **风格** | Motion-Driven（滚动动效、微交互、页面过渡、视差） | ⚠️ **降级为"克制的动效"**：只保留 150–250ms 的 hover / fade，禁止视差与入场动画轰炸；`prefers-reduced-motion` 下全量关闭 |
| **色板** | Primary `#18181B` / Secondary `#27272A` / CTA `#F8FAFC` / Background `#FAFAFA` / Text `#09090B` | ✅ 采纳为中性色阶与深色模式的锚点 |
| **排版** | Minimal Swiss（Inter 单字族）｜Developer Mono（IBM Plex Sans + JetBrains Mono） | ✅ **选定 Inter（UI / 正文）+ JetBrains Mono（代码 / 技术元信息）** |

**字体决策理由**：Inter 在 14–16px 屏幕正文下的 x-height 与字距表现最佳、字重阶梯完整（300–700）、开源且 variable font 子集化后仅 ≈25–40KB woff2；JetBrains Mono 对 `0/O`、`1/l/I` 的区分度与代码高亮语义天然匹配。中文不随拉丁字体分发，走系统回退链：

```css
--mp-font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI',
                'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC',
                'Microsoft YaHei', sans-serif;
--mp-font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular',
                'Cascadia Code', Consolas, monospace;
```

> 中文站点建议**只做字族回退 + `font-feature-settings` 标点控制**，避免引入 5–10MB 全量中文字体；需要统一字形时走「子集化」社区插件位，并在性能预算中单列。

#### 1.3.3 设计取舍对照表（默认 Classic ↔ 可选 Gallery）

| 维度 | **`@mineproj/theme-classic`（默认）** | `@mineproj/theme-gallery`（可选） |
|---|---|---|
| 画布 | `#FFFFFF` 卡片 / `#FAFAFA` 页面底（深色模式 `#0B0C0E` / `#151719`） | `#1b2838` 主画布 / `#0f1c25` band |
| 正文 | `#09090B`（深色模式 `#E7E9EA`，均满足 ≥ 4.5:1） | `#c7d5e0` |
| 次要文字 | `#52525B`（深色模式 `#A1A1AA`） | `#67707b` |
| 强调色 | `#2563EB`（可配置；深色模式 `#60A5FA`） | `#67c1f5` |
| 圆角 | 卡片 **12px** / 控件 **8px** / 标签 **999px** | 卡片 0 / 控件 2px |
| 内容宽 | **1280px**（可切 1200 / 1440 / full） | 940（classic）或 1200 |
| 栅格 | 12 列，gutter **24px**；卡片列数 1 / 2 / 3 / 4 | 6 列，gutter 16px；密集陈列 |
| 间距 | 基准 4px；section 纵向 **64–96px**；卡片间距 20–24px | band 之间 24–48px；卡片 gutter 8–16px |
| 阴影 | 极轻 `0 1px 2px rgb(0 0 0 / .06)`，hover 抬到 `0 8px 24px rgb(0 0 0 / .10)` | 无阴影，靠边框与色块 |
| 悬停反馈 | 边框高亮 + 阴影抬升 + **封面 `scale(1.03)` 容器内裁切放大（不产生布局位移）** | 覆盖层展开大图轮播 |
| 主题切换 | 浅色 / 深色 / 跟随系统 + localStorage 记忆 + **无闪烁内联脚本** | 固定深色 |
| 受众 | 通用：作品集、开源项目墙、求职、研究者主页 | 偏好深色沉浸式陈列的场景 |

#### 1.3.4 硬性 UI 规则（写入 `audit` 与 CI 门禁）

| 类别 | 规则 |
|---|---|
| 无障碍 | 正文对比度 ≥ **4.5:1**、大字 ≥ 3:1；可聚焦元素有可见 focus ring（`:focus-visible`）；图片必须有 `alt`；颜色不得作为唯一信息载体 |
| 触控 | 交互目标 ≥ **44×44px**；移动端不得依赖 hover-only 展示关键信息 |
| 动效 | 过渡 **150–300ms**；只动 `transform` / `opacity`；`prefers-reduced-motion: reduce` 时全量关闭 |
| 交互 | 所有可点击元素 `cursor: pointer`；hover 用**颜色 / 阴影 / 边框**变化，**禁止改变布局尺寸**（防抖动与 CLS） |
| 图标 | 统一 **Lucide**，24×24 viewBox，尺寸一致；**禁止用 emoji 当图标** |
| 图片 | WebP/AVIF + `srcset` 多档 + `loading="lazy"`（首屏除外）+ 显式 `width/height` 防 CLS |
| 明暗 | 浅色模式玻璃卡背景 ≥ `rgb(255 255 255 / .8)`；边框在两种模式下均可见（浅色 `#E4E4E7`） |
| 响应式 | 375 / 768 / 1024 / 1440 四档验证；**禁止横向滚动** |

### 1.4 SEO 与 AI 友好规范（Agent Readability）

综合 **Vercel Agent Readability Specification**、llms.txt 社区实践与结构化数据研究，确认的清单与效果依据：

**站点级**
- `llms.txt`（根目录，`text/plain`，非空，条目 10–30 条按优先级排序，每条附一句话"动词 + 结果"式描述）+ `llms-full.txt`（全量正文内联，减少 HTTP 往返）
- `robots.txt` **显式放行** AI 爬虫：`GPTBot`、`OAI-SearchBot`、`ChatGPT-User`、`ClaudeBot`、`Claude-SearchBot`、`PerplexityBot`、`Google-Extended`、`Applebot-Extended`、`CCBot`；并声明 `Sitemap:`
- `sitemap.xml`（含 `<lastmod>`）+ **Markdown 版 `sitemap.md`**（AI 更擅长解析标题层级 + 链接）
- `AGENTS.md`：告诉编码 Agent 如何消费本站点（数据端点清单、schema 摘要、示例 curl），这是 Copilot/Claude Code/Cursor 的关键入口

**页面级**
- HTTP 200、0–1 跳重定向；正确的 `Content-Type`；无限制性 `x-robots-tag`
- `<meta name="description">`（≥50 字符）、`og:title` / `og:description` / `og:image`、`html lang`
- **JSON-LD**：站点页 `Person` + `WebSite`；列表页 `CollectionPage` + `ItemList`；详情页 `SoftwareSourceCode` / `SoftwareApplication` / `CreativeWork` + `BreadcrumbList`；FAQ 区 `FAQPage`
- ≥3 个 `h1–h3` 小节标题；文本/HTML 比 > 15%；代码块标注语言
- **Markdown 镜像**：每个 HTML 页同时产出同名 `.md`，HTML 中用 `<link rel="alternate" type="text/markdown">` 指向；搜索引擎与 AI 可跳过导航/页脚噪声直接取正文（研究称部署 `llms.txt` + 清洁副本后 AI 搜索可见度最高提升约 40%；加 Schema 标记的页面 AI 解析成功率显著提升）

**mineproj 的加分设计**：`mineproj audit --seo --ai` 直接实现上述检查项并给出 0–100 评分报告，把"AI 友好"从口号变成可回归的质量门禁。

### 1.5 模拟 API 方案调研

| 方案 | 机制 | 适用性 |
|---|---|---|
| **构建期静态 JSON 端点** | 构建时把数据快照写成 `/api/v1/*.json`，作为普通静态文件部署 | ✅ **主选**。真 HTTP GET，任何客户端/curl/第三方可消费；静态托管自动带 ETag/缓存；零运行时依赖 |
| **Dev 中间件同源** | Vite `configureServer` 挂载同路径路由，dev 期支持完整查询参数 | ✅ **必选**。保证本地开发与线上路径、响应结构完全一致 |
| **MSW（Service Worker）** | 在浏览器网络层拦截请求并返回 mock | ✅ **可选插件**。适合未落盘的动态端点（POST 点赞、模拟 500 错误、模拟 800ms 延迟）；生产可开关 |
| 客户端 fetch 拦截（猴补丁） | 替换 `window.fetch` | ❌ 不采用。侵入应用代码，与"真实网络请求"行为偏离，调试困难 |

**三层一致性契约**：同一份 handler/生成器同时驱动 ① 构建期落盘、② dev 中间件、③（可选）MSW，确保 `fetch('/api/v1/projects?tag=web')` 在三处返回同一结构。

查询参数（`?q=&tag=&category=&sort=&page=&pageSize=&fields=`）：默认策略是**落盘全量 + 客户端过滤**（零配置、任意组合可用）；项目数超过阈值（默认 200）或显式开启时，切换为**构建期预生成常见组合变体**（分页/热门筛选），用磁盘空间换运行时带宽。

### 1.6 Live Demo 内嵌试用：安全沙箱结论

- `sandbox` 属性默认全锁，按需添加 token
- **关键红线：绝不把 `allow-scripts` 与 `allow-same-origin` 同时授予不可信内容**——二者组合会让 iframe 内的脚本移除自身的 `sandbox` 属性，隔离完全失效，等同于不设沙箱
- 推荐做法：**Demo 部署到独立 origin**（如 `demos.example.com` 或 GitHub Pages 独立站点），主站以 `sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"` 嵌入；同源 Demo 仅在显式声明 `trusted: true` 时才加 `allow-same-origin`
- 配套：`referrerpolicy="no-referrer"`、`loading="lazy"`（滚动到视口才挂载）、`title`（无障碍必备）、`postMessage` 白名单校验的高度自适应、`allow` 显式授权（fullscreen / gamepad / clipboard-write）

### 1.7 主题与插件的分发生态惯例

**VitePress 的 npm 主题契约**（业界最成熟，直接借鉴并增强）：
- 包入口**默认导出**主题对象；导出 `ThemeConfig` 类型；如需调整构建配置，从**子路径**（`my-theme/config`）导出
- 消费方式：`export default Theme`；扩展方式：`export default { extends: Theme, enhanceApp(ctx) {} }`

**mineproj 的增强点**：VitePress 契约只覆盖"文档站单布局"，mineproj 需要的是**多布局 + 组件注册表 + 插槽 + 配置 schema（Zod 校验） + 生命周期 setup**。同时吸取 Astro 的"组件可按名覆盖"与 Hexo 的 `xxx-theme-*` 命名简写惯例。

**插件**：不重造轮子。mineproj 插件 = `{ name, hooks, vite[], components, enforce }`——`vite` 字段**直接透传原生 Vite/Rollup 插件数组**，一次接入即获得 unplugin 全家桶（自动导入、组件按需、图标、PWA、压缩……）。

### 1.8 版本基线

| 项 | 基线 | 说明 |
|---|---|---|
| Node | **≥ 22.12**（推荐 24 LTS） | 与主流生态一致（Astro 6 已弃用 Node 18/20） |
| 包管理 | **pnpm 10.x** workspace | 硬链接节省磁盘，workspace 协议适合 monorepo |
| 构建 | **Vite 7.x** | 以 M0 首日 `pnpm dlx` 安装结果锁定到 lockfile |
| UI | **React 19.2.x** | `renderToPipeableStream` + `hydrateRoot` |
| 校验 | **Zod 4.x** | 注意 v4 变更：`z.email()` 已提升到顶层命名空间，`.default()` 需匹配输出类型 |
| 测试 | **Vitest 4.x** + Playwright | 单测/组件测 + 静态产物端到端冒烟 |
| 库构建 | **tsdown** | Rolldown 驱动，dts 生成快 |
| 语言 | **TypeScript 5.7+**，strict | `noUncheckedIndexedAccess` 开启 |
| Markdown | **Shiki 3.x**（构建期高亮）+ **markdown-it**（解析） | 见 §1.9；`@shikijs/markdown-it` 接入 |
| PDF 预览 | **pdf.js（`pdfjs-dist`）** 动态 `import()` + 独立 chunk | 见 §1.10；worker 用 `new URL(..., import.meta.url)` |
| 图片灯箱 | **自研 ≤ 6KB gzip**（不引三方） | 见 §1.10；体积与 a11y 可控 |
| 图标 | **Lucide**（按需 tree-shaking） | 统一 24×24 viewBox，禁 emoji 图标 |
| 搜索 | **MiniSearch** | 前缀 + 模糊；按语言分片 |

### 1.9 Markdown 渲染管线调研

| 方案 | 机制 | 结论 |
|---|---|---|
| **Shiki 3.x** | TextMate 语法 + VS Code 主题，**在构建期**把代码着色成 HTML，浏览器下载的是已着色标记，**零运行时 JS** | ✅ **主选**。VitePress / Astro / Nuxt Content 的默认高亮器 |
| Prism / highlight.js | 浏览器端运行时着色 | ❌ 需下发高亮器 + 语法包，首屏有"闪烁重排" |
| **markdown-it** | 成熟、同步、插件生态齐全（GFM/表格/任务列表/脚注/容器） | ✅ **主选解析器**，配 `@shikijs/markdown-it` |
| unified / remark + rehype | AST 生态最强，插件最多 | ⚠️ **备选**：v2 若需 MDX / 自定义 AST 变换再切换（抽象层隔离切换成本） |

**Shiki 3 的关键事实**（v1/v2 写法在 v3 已废弃，M0 就要用对）：

- `createHighlighter({ themes, langs })` —— v1 的 `getHighlighter()` 已废弃
- **明暗双主题**用 `{ themes: { light: 'github-light', dark: 'github-dark' } }`，输出 `--shiki-light` / `--shiki-dark` 两个 CSS 变量，**纯 CSS 切换，无需重新着色**
- 三种分发：`full`（6.9MB）/ `web`（4.2MB）/ `core`（106KB）。构建期推荐 `shiki/bundle/web` + `createHighlighterCore` 精细导入，缩短冷启动
- 两种正则引擎：Oniguruma WASM（准确，构建期推荐）／ JavaScript RegExp（更快更小）
- 兜底三件套：`langAlias`（自定义语言名映射）、`fallbackLanguage`、`onError`（不因单个语言失败中断构建）
- 快捷函数：`codeToHtml` / `codeToHast` / `codeToTokens`；transformers 支持行高亮 `[!code highlight]`、diff、聚焦

**安全策略**：默认 `html: false`（**禁止内联 HTML**）；确需内联时走 `rehype-sanitize` 白名单（标签 + 属性双白名单，禁 `on*` 事件、`javascript:` 协议、`style` 表达式）。

### 1.10 富媒体预览调研（PDF / 图片）

**PDF**：pdf.js 分为 core（解析）/ display（渲染）/ viewer（完整 UI 三件套）。**完整 `viewer.html` 很重，不整套搬**，mineproj 自绘轻量 viewer。

| 决策 | 结论 |
|---|---|
| 引入方式 | `await import('pdfjs-dist')` **动态加载**；`rollupOptions.manualChunks` 拆独立 `pdfjs` chunk |
| Worker | `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()` —— Vite 下**必须**用这个模式，worker 才会被正确产出 |
| 体积 | 核心解析 ≈ 300KB（未 gzip）+ worker；**不懒加载会直接击穿首页 30KB 预算** |
| 渲染 | 按页 canvas 渲染 + 虚拟滚动只渲染可见页（±1 页预取） |
| 大文件 | 服务端支持 `Accept-Ranges: bytes` 时 pdf.js 分片拉取，无需整本下载 |
| 文本层 | 可选开启 `TextLayer`：支持选中、复制、页内搜索、屏幕阅读器 |

**三级降级链（必须全实现）**：
1. **pdf.js 自绘 viewer** —— 交互最强（翻页 / 缩放 / 缩略图 / 页内搜索）
2. **`<iframe src="*.pdf#view=FitH">`** —— 浏览器原生阅读器，零 JS 成本（iOS Safari 尤其依赖这条）
3. **封面图 + 下载/新窗口按钮** —— 移动端、禁用 JS、不支持时的兜底

> 已知限制：XFA 动态表单、部分加密或嵌入特殊字体的 PDF 可能渲染异常 —— 这正是降级链必须存在的理由。

**构建期可选增强**：用 pdf.js 或 `pdftoppm` 抽取 PDF 首页生成封面 PNG，纳入统一图片管线（LQIP + 多档响应式），详情页卡片直接显示封面。

**图片**：灯箱**自研**（三方库普遍 30–80KB 且 a11y 参差），目标 ≤ 6KB gzip，能力清单：打开/关闭、上一张/下一张、缩放（滚轮 / 按钮 / 双击 1×↔2×）、拖拽平移、键盘（`←` `→` `Esc` `+` `-` `0`）、计数器、caption、缩略图条。

必做无障碍：`role="dialog"` + `aria-modal="true"`、**焦点陷阱**、Esc 关闭、**关闭后焦点返回触发元素**、`prefers-reduced-motion` 关闭过渡、`body` 滚动锁定（不引发布局跳动）。

图片管线：构建期生成 **480 / 960 / 1440 / 1920** 四档 `webp` + `avif`，LQIP base64 模糊占位（内联 < 1KB），显式 `width`/`height` 防 CLS；EXIF 方向自动纠正；HEIC/RAW 不处理并提示转换。

---

## 2. 产品定义

### 2.1 一句话定位

> **mineproj —— 把你的作品变成一个可浏览、可检索、可试玩的项目库。** Apache-2.0 许可、**JSON + Markdown 驱动**、纯静态部署、主题与插件皆可为 npm 包的个人项目展示生成器。
>
> **展示范式**借鉴成熟内容平台（卡片网格 / 分面筛选 / 悬停预览 / 详情主列 + 元信息侧栏 / 可玩面板），**视觉语言**走简洁大方的大众风格（浅色 + 深色双模式、Inter + JetBrains Mono、12px 圆角、1280px 内容宽）。内置 i18n、Markdown、PDF 与图片预览。

### 2.2 目标用户与场景

| 用户 | 场景 | 关键诉求 |
|---|---|---|
| **开发者 / 设计师**（主） | 个人主页、作品集、简历增强 | 5 分钟上线、好看、能内嵌可玩 Demo、SEO 让 HR 搜得到 |
| **独立开发者 / 开源作者** | 项目矩阵展示（多仓库、多原型） | 标签筛选、批量导入 GitHub 仓库、统计面板 |
| **前端教学 / 学生** | 课程作业、实验 Demo 集合 | 零后端、GitHub Pages 直传、同学可在线试玩 |
| **二次开发者** | 基于 mineproj 做垂直模板（摄影集、论文墙、Mod 站） | 换主题包、写插件、改数据 schema 而不动内核 |

### 2.3 核心设计原则

1. **静态优先（Static First）**：默认零后端、零数据库、产物即全部。任何需要服务器的能力都必须可降级为构建期产物。
2. **数据契约先行（Schema First）**：JSON 数据由 Zod schema 强校验，构建期报错精确到文件与字段，并导出 JSON Schema 供编辑器智能提示。
3. **契约即产品（Contracts are the Product）**：内核只做"定义契约 + 调度"，表现力全部交给主题与插件。默认主题必须 dogfooding 同一契约。
4. **不重造轮子（Ride the Vite Ecosystem）**：插件可直接透传 Vite 插件；主题是普通 React 组件包；能外包给生态的绝不自己写。
5. **渐进增强（Progressive Enhancement）**：无 JS 也可完整阅读全部内容（含搜索结果的 SSR 兜底页）；JS 只增强筛选、搜索、预览、动效。
6. **机器可读（Machine Readable by Default）**：人能看到的，AI 与搜索引擎一定能以更结构化的方式拿到。
7. **显式优于魔法（Explicit over Magic）**：插件与主题在配置文件中显式声明；自动扫描作为可选开关而非默认行为。

### 2.4 非目标（Out of Scope · v1）

- 后端服务、数据库、用户账号体系
- 富文本在线编辑 / CMS 后台（v1 只做本地 JSON；Web 编辑器列为 P3 议题）
- 站内全文检索的**服务端**实现（v1 为构建期索引 + 客户端检索）
- 多人协作 / 权限系统
- 电商、支付、下载计费

---

## 3. 需求映射表

| # | 需求 | 实现方式 | 相关章节 |
|---|---|---|---|
| 1 | 纯前端部署、无后端、JSON 管理数据 | SSG 产物为纯静态目录；`data/projects/**/index.json` 为唯一结构化内容源；Zod 校验 | §5、§15 |
| 2 | SEO 友好、AI 友好 | 静态 HTML 全量预渲染 + JSON-LD + sitemap(xml/md) + robots.txt 放行 AI 爬虫 + llms.txt/full + Markdown 镜像 + AGENTS.md + `audit` 自检 | §7 |
| 3 | 可以模拟 API 获取静态数据 | 构建期落盘 `/api/v1/*.json`（真 GET）+ dev 中间件同源 + 客户端 SDK（`useProjects` 等）+ 可选 MSW 插件 | §6 |
| 4 | 高度扩展性、二次开发友好 | 分层内核、虚拟模块、类型全量导出、契约测试、`theme:eject` 一键弹出主题源码、插件脚手架 | §4、§8、§9 |
| 5 | 自定义主题（可发 npm 包），默认主题也是 npm 包 | 主题契约（layouts/components/slots/configSchema/setup）；`theme: '包名'` 自动解析 + `mineproj-theme-*` 简写；默认主题 **`@mineproj/theme-classic`** 走同一路径，可选官方主题 **`@mineproj/theme-gallery`** | §8、§10 |
| 6 | 可添加各种自定义插件 | `{ hooks, vite[], components, enforce }` 双形态；自研轻量 tapable（序列/瀑布/并行）；直接透传 Vite 插件生态 | §9 |
| 7 | **参考内容平台那样展示**（学架构，不学皮肤） | **采纳信息架构**：卡片网格、分面筛选、悬停预览、详情「主列 + 右侧元信息栏」、可玩面板、探索队列；**视觉走大众风**：浅色/深色双模式、Inter + JetBrains Mono、12px 圆角、1280px 内容宽、克制动效；深色沉浸式皮肤降为可选主题 | §1.3、§10 |
| 8 | 展示内容含项目名/截图/介绍/创作时间/链接等；HTML 类项目可直接试用 | 完整数据模型（§5）；`playable` 字段 + `PlayableFrame` 组件 + `public/demos/<slug>/` 约定 + iframe 沙箱安全策略 | §5、§11.1–§11.3 |
| 9 | **i18n 国际化** | 路由前缀（`/` + `/en/`）+ 字段级覆盖（`index.<locale>.json`）+ Markdown 分语言（`body.<locale>.md`）+ 回退链 + `hreflang` + 分语言搜索索引与 API | §13 |
| 10 | **Markdown 支持** | markdown-it + GFM + **Shiki 构建期高亮（零运行时）**+ 明暗双主题 + 数学/图表 + 目录/摘录/阅读时长 + 安全净化 | §12 |
| 11 | **PDF 预览** | pdf.js 动态 `import()` 自绘轻量 viewer + 独立 chunk + worker 正确配置 + **三级降级链** + 构建期抽取封面 | §11.4 |
| 12 | **图片预览** | 自研灯箱 ≤ 6KB（缩放 / 平移 / 键盘 / 缩略图条 / 焦点陷阱）+ 四档响应式 webp+avif + LQIP 占位 | §11.5 |
| 13 | 补充更多细节 | OG 图自动生成、RSS/Atom/JSON Feed、GitHub 导入器、统计面板、URL 状态同步、增量构建、图片管线、安全策略、开源治理、性能预算 | §14–§21 |
| 14 | **可视化编辑器** | Schema 驱动表单 + 实时预览；三种运行形态（Dev 本地回写 / Static 导出补丁 / PR 提交 GitHub）；生产构建默认不打包；插件可注册自定义字段控件 | §21、§14.1 |

---

## 4. 总体架构

### 4.1 分层架构

```
┌──────────────────────────────────────────────────────────────┐
│  L4  生态层   @mineproj/theme-*   @mineproj/plugin-*   社区包    │
│                （均为 npm 包，与官方包同契约、同解析路径）        │
├──────────────────────────────────────────────────────────────┤
│  L3  主题层   布局分发 / 组件注册表 / 插槽 / 主题配置 schema      │
│               @mineproj/theme-classic（默认，dogfooding 契约）   │
├──────────────────────────────────────────────────────────────┤
│  L2  内核层   config │ data │ router │ api │ renderer │ hooks  │
│               @mineproj/core（构建期）                          │
├──────────────────────────────────────────────────────────────┤
│  L1  运行层   @mineproj/client（useProjects / 搜索 / 路由 / 缓存）│
├──────────────────────────────────────────────────────────────┤
│  L0  底座     Vite（dev/HMR/Rollup/SSR）· React 19 · Zod 4      │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 构建与渲染管线

```
mineproj build
  │
  ├─ 1. config:load      解析 mineproj.config.ts（Zod 校验 + 类型推导）
  ├─ 2. plugin:register   插件按 enforce(pre/normal/post) 注册 hooks 与 Vite 插件
  ├─ 3. theme:resolve     包名 → 文件系统路径 → 动态 import → 契约校验
  ├─ 4. data:load         扫描 data/**/*.json → 合并 → Zod 校验（报错带文件路径）
  │      └─ hook data:loaded / data:validated（插件可增删改、注入字段）
  ├─ 5. assets:pipeline   图片多尺寸 webp/avif + LQIP；demo 目录原样复制
  ├─ 6. routes:collect    生成路由表（home/list/detail/tag/collection/about/404）
  │      └─ hook routes:collect（插件可造页面：归档、统计、自定义页）
  ├─ 7. api:generate      ★ 生成 /api/v1/*.json（落盘静态端点）
  │      └─ hook api:endpoints（插件注册自己的端点）
  ├─ 8. vite:build        client bundle（含 islands 分块）+ SSR bundle
  ├─ 9. render:prerender  renderToPipeableStream(..., { onAllReady }) 逐路由出 HTML
  │      └─ hook render:before（注入 JSON-LD / 脚本 / 样式）
  ├─10. seo:emit          sitemap.xml · sitemap.md · robots.txt · llms.txt
  │                       llms-full.txt · AGENTS.md · *.md 镜像 · feed · og-image
  │      └─ hook emit（任意文件写入）
  └─11. build:done        体积报告 · 性能预算校验 · audit 摘要
```

**渲染与交互策略（Islands）**：整页由 React 服务端渲染为静态 HTML；只有标记为交互的组件（搜索框、筛选面板、轮播、可玩面板）打包为独立 chunk 并按需 `hydrateRoot`。目标：**首屏 JS ≤ 30KB gzip**，纯内容页 **0KB 交互 JS**。

**渲染模式**（每路由可单独配置）：
| 模式 | 说明 | 适用 |
|---|---|---|
| `ssg` | 完全预渲染 + 选择性水合 | 默认，全部内容页 |
| `spa-fallback` | 预渲染 + SPA 路由接管（404.html 回退） | 需要客户端无刷新切换的站点 |
| `raw` | 只输出 Markdown 镜像，不出 HTML | 纯 AI 消费端点（可选） |

### 4.3 Monorepo 包清单

```
mineproj/
├── packages/
│   ├── mineproj/                 # CLI + 内核装配（bin: mineproj）★ 用户唯一安装项
│   ├── core/                     # @mineproj/core        配置/数据/路由/API/hooks/虚拟模块
│   ├── client/                   # @mineproj/client      useProjects·搜索·筛选·缓存·路由
│   ├── schema/                   # @mineproj/schema      Zod schema + JSON Schema 导出
│   ├── editor/                   # @mineproj/editor      可视化编辑器（dev-only，不进生产产物）
│   ├── theme-classic/           # @mineproj/theme-classic 默认主题（大众风格）★ npm 包
│   ├── create-mineproj/          # create-mineproj       脚手架（npm create mineproj）
│   ├── create-theme/             # @mineproj/create-theme
│   ├── create-plugin/            # @mineproj/create-plugin
│   └── plugins/
│       ├── plugin-sitemap/       # sitemap.xml + sitemap.md
│       ├── plugin-seo/           # meta·canonical·OG·JSON-LD
│       ├── plugin-llms/          # llms.txt·llms-full.txt·AGENTS.md
│       ├── plugin-markdown-mirror/  # URL.md 镜像页
│       ├── plugin-og-image/      # satori + resvg 生成 OG 图
│       ├── plugin-search/        # MiniSearch 分片索引
│       ├── plugin-feed/          # RSS / Atom / JSON Feed
│       ├── plugin-i18n/          # 多语言路由 + hreflang
│       ├── plugin-github-import/ # 从 GitHub API 批量导入仓库生成 JSON
│       ├── plugin-playable/      # 可玩 Demo 面板与沙箱策略
│       ├── plugin-analytics/     # Umami / Plausible / GA
│       ├── plugin-msw/           # 可选：SW 层动态 mock
│       └── plugin-pwa/           # 离线缓存（透传 vite-plugin-pwa）
├── templates/                    # starter 模板（basic / blogish / minimal）
├── docs/                         # 文档站（自身用 mineproj 构建 → dogfooding）
├── examples/                     # 示例站点
└── .github/workflows/            # CI · release · pages
```

### 4.4 站点侧目录结构（用户项目）

```
my-projects/
├── mineproj.config.ts          # 配置（defineConfig，类型安全）
├── data/
│   ├── profile.json            # 作者信息
│   ├── tags.json               # 标签词典（可含颜色、描述、分组）
│   ├── collections.json        # 精选合集（类"愿望单/鉴赏家推荐"）
│   └── projects/
│       └── voxel-tool/
│           ├── index.json      # 项目元数据
│           ├── index.zh-CN.json# 语言覆盖（可选）
│           ├── cover.png       # 封面
│           ├── gallery/        # 截图组
│           └── body.md         # 正文（可选，替代 index.json 内联 description）
├── public/
│   ├── demos/<slug>/           # 可玩 Demo 静态产物（原样复制）
│   └── favicon.ico
└── dist/                       # 构建产物（纯静态，可直接托管）
    ├── index.html
    ├── projects/<slug>/index.html
    ├── projects/<slug>/index.md            # Markdown 镜像
    ├── api/v1/projects.json
    ├── sitemap.xml   sitemap.md   robots.txt
    ├── llms.txt   llms-full.txt   AGENTS.md
    └── assets/   demos/
```

---

## 5. 数据模型（JSON）

### 5.1 Project 完整字段

```ts
// 由 @mineproj/schema 用 Zod 定义并导出
const Project = z.object({
  // ── 身份 ──────────────────────────────
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),   // URL 片段，唯一
  name: z.string().min(1),                           // 项目名
  tagline: z.string().max(120),                      // 一句话标语（卡片副标题）
  summary: z.string().min(20).max(400),              // 摘要（列表页/SEO description 默认源）

  // ── 视觉 ──────────────────────────────
  cover: z.string().optional(),                      // 封面（相对 index.json 或绝对 URL）
  coverFit: z.enum(['cover', 'contain']).default('cover'),
  screenshots: z.array(z.object({
    src: z.string(),
    caption: z.string().optional(),
    alt: z.string().optional(),                      // 缺失时构建告警（无障碍门禁）
    width: z.number().optional(),
    height: z.number().optional(),
  })).default([]),
  video: z.object({ src: z.string(), poster: z.string().optional(), type: z.string() }).optional(),
  accentColor: z.string().optional(),                // 卡片强调色，缺省用主题色
  icon: z.string().optional(),

  // ── 内容（Markdown，见 §12）──────────────
  description: z.string().optional(),                // 短正文（Markdown 内联，卡片/SEO 用）
  bodyFile: z.string().default('body.md'),           // 外链正文：body.md / body.<locale>.md
  highlights: z.array(z.string()).default([]),       // 亮点要点（卡片 / 详情侧栏）

  // ── 文档与附件（PDF 预览，见 §11.4）───────
  docs: z.array(z.object({
    title: z.string(),
    file: z.string(),                                // docs/paper.pdf（相对项目目录）
    kind: z.enum(['pdf','slides','paper','manual','report','other']).default('pdf'),
    lang: z.string().optional(),                     // 文档语言（参与 i18n 过滤）
    pages: z.number().optional(),                    // 构建期自动探测填充
    size: z.number().optional(),                     // 字节，构建期自动填充
    cover: z.string().optional(),                    // 构建期抽取的首页封面（走图片管线）
    preview: z.enum(['viewer','iframe','cover']).default('viewer'), // 预览策略（三级降级）
    download: z.boolean().default(true),             // 是否显示下载按钮
  })).default([]),
  changelog: z.array(z.object({
    version: z.string(), date: z.string(), notes: z.array(z.string()),
  })).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),  // → FAQPage JSON-LD

  // ── 分类 ──────────────────────────────
  category: z.string().optional(),                   // 主分类（web / desktop / game / cli ...）
// 标签（多维分面筛选）
  platforms: z.array(z.enum(['windows','macos','linux','android','ios','harmonyos','web','wasm'])).default([]),
  techStack: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),        // 自然语言（zh-CN / en ... 区别于编程语言）

  // ── 时间 ──────────────────────────────
  createdAt: z.string(),                             // ISO 8601，创作时间 ★ 需求 8
  updatedAt: z.string().optional(),
  releasedAt: z.string().optional(),

  // ── 状态与排序 ────────────────────────
  status: z.enum(['idea','wip','alpha','beta','released','maintenance','archived']).default('released'),
  featured: z.boolean().default(false),              // 进首页 Featured 导轨
  weight: z.number().default(0),                     // 手动排序权重（越大越前）
  hidden: z.boolean().default(false),                // 不进列表但保留详情页（可分享的隐藏项）

  // ── 链接 ──────────────────────────────
  links: z.array(z.object({
    type: z.enum(['repo','demo','docs','download','video','article','package','other']),
    label: z.string().optional(),
    url: z.url(),
    primary: z.boolean().default(false),             // 详情右栏主按钮
  })).default([]),

  // ── 可玩 / 试用（需求 8）────────────────
  playable: z.object({
    type: z.enum(['iframe','link','embed-zip','none']).default('none'),
    entry: z.string().optional(),                    // /demos/<slug>/index.html 或外链
    sandbox: z.string().default('allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox'),
    allow: z.string().default('fullscreen; gamepad; clipboard-write'),
    trusted: z.boolean().default(false),             // true 才追加 allow-same-origin
    aspectRatio: z.string().default('16 / 9'),
    height: z.number().default(480),
    lazy: z.boolean().default(true),
    postMessageResize: z.boolean().default(true),
    requirements: z.object({
      minWidth: z.number().optional(),
      mobileFriendly: z.boolean().default(false),
      keyboard: z.boolean().default(false),
      notes: z.string().optional(),
    }).default({}),
  }).optional(),

  // ── 统计 ──────────────────────────────
  stats: z.object({
    stars: z.number().optional(),
    downloads: z.number().optional(),
    views: z.number().optional(),
    linesOfCode: z.number().optional(),
    custom: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }).default({}),

  // ── 归属与许可 ────────────────────────
  role: z.string().optional(),                       // 独立完成 / 主要负责人 / 参与者
  collaborators: z.array(z.object({ name: z.string(), url: z.string().optional(), role: z.string().optional() })).default([]),
  license: z.string().optional(),                    // SPDX 表达式，如 Apache-2.0

  // ── SEO / AI 覆盖 ─────────────────────
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    canonical: z.string().optional(),
    noindex: z.boolean().default(false),
  }).default({}),

  // ── 国际化（见 §13）────────────────────
  i18n: z.record(                                    // 键 = locale；值 = 字段级覆盖，深度合并
    z.string(),
    z.object({
      name: z.string().optional(),
      tagline: z.string().optional(),
      summary: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      bodyFile: z.string().optional(),               // body.<locale>.md
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      docs: z.array(z.object({                       // 文档也可按语言替换（同 title 覆盖文件）
        title: z.string(), file: z.string(),
      })).optional(),
      seo: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      }).optional(),
      ext: z.record(z.string(), z.unknown()).optional(),
    }),
  ).default({}),
  availableLocales: z.array(z.string()).optional(),  // 缺省 = 站点全部语言；用于"此项目仅有中文版"

  // ── 扩展位（插件自由消费）──────────────
  ext: z.record(z.string(), z.unknown()).default({}),
});
```

> **覆盖优先级**（§13 详述）：`index.<locale>.json` 文件 > `index.json` 内的 `i18n.<locale>` 对象 > `index.json` 根字段。同名键后者覆盖前者，数组**整体替换**、对象**深度合并**。

### 5.2 数据组织（三种形态，任选或混用）

| 形态 | 结构 | 适用 |
|---|---|---|
| **单文件** | `data/projects.json`（数组） | 项目 < 10，快速起步 |
| **一项目一文件** | `data/projects/<slug>.json` | 默认推荐，Git diff 友好 |
| **目录式** ★ | `data/projects/<slug>/index.json` + `cover.png` + `gallery/` + `body.md` | 资源就近，推荐主力形态 |

**目录式的完整形态（含 i18n 与 PDF 附件）**：

```
data/projects/<slug>/
├─ index.json                 # 默认语言（= i18n.defaultLocale）的完整数据
├─ index.en.json              # 英文：字段级覆盖（深度合并，只写差异字段）
├─ body.md                    # 默认语言正文（Markdown，见 §12）
├─ body.en.md                 # 英文正文；缺失则回退 body.md 并构建告警
├─ cover.png                  # 封面（建议 16:9、≥ 1280×720）
├─ gallery/                   # 截图（01.png / 02.png …，按文件名自然排序）
│  └─ 01.png
└─ docs/                      # PDF 等附件（自动探测页数/体积、抽取首页封面）
   ├─ design-doc.pdf
   └─ design-doc.en.pdf       # 同名不同语言：用 .<locale> 后缀
```

**文件命名约定**：`<basename>.<locale>.<ext>` 即该文件的对应语言版本。构建期用 `availableLocales ∩ site.locales` 求交，缺失只告警并回退，不阻断构建。

### 5.3 校验与开发体验

- `mineproj check`：Zod 校验全部数据，报错格式 `data/projects/foo/index.json:12 · tags.0: expected string, received number`
- 构建期自动生成 `.mineproj/schema.json`（JSON Schema），配合 `.vscode/settings.json` 的 `json.schemas` 映射 → **编辑 JSON 时字段自动补全 + 悬浮文档**
- 生成 `.mineproj/types.d.ts`，供主题/插件作者获得完整类型
- `mineproj migrate --to <version>`：schema 演进时自动迁移数据文件

**v1.1 新增的校验项**（均可单独关闭，CI 默认全开）：

| 检查 | 级别 | 说明 |
|---|---|---|
| `body.md` 存在性与可解析 | error | 声明了 `bodyFile` 却找不到文件 → 报错 |
| Markdown 内相对链接可达 | warn | 指向站内不存在的文件 / slug |
| 图片 `alt` 缺失 | warn | 无障碍门禁（§1.3.4） |
| PDF 附件存在且可解析 | error | 同时填充 `pages` / `size` / `cover` |
| 未声明语言的资源 | warn | `docs` / `body` 未标注 `lang` 且站点多语言时提示 |
| 翻译覆盖率 | info | `mineproj check --i18n` 输出每种语言缺失字段的项目清单 |

---

## 6. 模拟 API 设计（需求 3）

### 6.1 端点清单（构建期落盘为静态文件）

| 端点 | 内容 |
|---|---|
| `GET /api/v1/projects.json` | 全量列表（精简字段：`slug/name/tagline/cover/tags/category/status/createdAt/featured/weight/playable.type`） |
| `GET /api/v1/projects/index.json` | 带分页信封（见下） |
| `GET /api/v1/projects/<slug>.json` | 单项目完整字段（含 description 渲染后 HTML + Markdown 原文） |
| `GET /api/v1/tags.json` | 标签词典 + 每项计数 |
| `GET /api/v1/categories.json` | 分类聚合 + 计数 |
| `GET /api/v1/collections.json` | 精选合集 |
| `GET /api/v1/profile.json` | 作者信息 |
| `GET /api/v1/search.json` | 搜索索引（MiniSearch 分片：按语言 / 按首字母分桶） |
| `GET /api/v1/stats.json` | 统计（总数、标签分布、语言分布、时间线） |
| `GET /api/v1/feed.json` | JSON Feed（最新 N 条） |
| `GET /api/v1/manifest.json` | 数据版本、生成时间、schema 版本、端点清单（供 AI Agent 自描述） |

**统一响应信封**：
```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-09-03T08:00:00.000Z",
  "schemaVersion": "1.0.0",
  "total": 42,
  "page": 1,
  "pageSize": 24,
  "data": [ /* ... */ ],
  "facets": { "tags": { "web": 12, "game": 7 }, "status": { "released": 30 } }
}
```

**错误信封**（静态托管的 404 返回 JSON 需平台配合，故提供 `error.json` 约定与客户端兜底）：
```json
{ "apiVersion": "v1", "error": { "code": "NOT_FOUND", "message": "..." } }
```

### 6.2 三层一致性

```
                    ┌──────────────────────────┐
                    │  同一份 endpoint 定义器    │
                    │  defineEndpoint({path,   │
                    │    generate(ctx),        │
                    │    query(ctx, params)})  │
                    └───────────┬──────────────┘
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
   ① 构建期落盘           ② Dev 中间件         ③ 可选 MSW 插件
   dist/api/v1/*.json    Vite configureServer  Service Worker
   （静态文件，真 GET）    （同路径，支持完整      （支持 POST/延迟/
                          查询参数与延迟注入）      错误模拟）
```

### 6.3 客户端 SDK

```ts
import { useProjects, useProject, useTags, createApiClient } from '@mineproj/client';

// React Hook（内部走 fetch('/api/v1/...')）
const { data, facets, loading, error, reload } = useProjects({
  tag: ['web', 'game'],      // 多维 AND / OR 可配
  q: 'voxel',
  sort: 'createdAt:desc',
  page: 1,
  pageSize: 24,
});

// 也可脱离 React 使用
const api = createApiClient({ baseUrl: '/api/v1', cache: 'stale-while-revalidate' });
const project = await api.getProject('voxel-tool');
```

**查询策略**：
| 模式 | 行为 | 触发条件 |
|---|---|---|
| `client` （默认） | 落盘全量 JSON，客户端过滤/排序/分页 | 项目数 ≤ 200 |
| `hybrid` | 热门组合构建期预生成 + 冷门组合客户端兜底 | 项目数 > 200，或显式配置 |
| `static` | 仅预生成组合，未命中则报错 | 追求极致带宽时 |

**虚拟模块（构建期内联，与 API 互补）**：
```ts
import { projects, profile, tags } from 'virtual:mineproj/data';  // 零请求，直取内存
import { config } from 'virtual:mineproj/config';
import { routes } from 'virtual:mineproj/routes';
```
二次开发者可自由选择 "**构建期内联（最快）**" 或 "**运行时 fetch（最像真实应用）**"。

---

## 7. SEO 与 AI 友好（需求 2）

### 7.1 产物清单

| 文件 | 说明 |
|---|---|
| `sitemap.xml` | 含 `<lastmod>`，按 `updatedAt` 生成；支持图片 sitemap 扩展 |
| `sitemap.md` | Markdown 版站点地图（标题层级 + 链接），AI 友好 |
| `robots.txt` | 放行主流 AI 爬虫 + `Sitemap:` 声明 + 自定义规则合并 |
| `llms.txt` | H1 站点名 + 引用块一句话描述 + 分组链接清单（10–30 条，每条一句话描述），`text/plain` |
| `llms-full.txt` | 全量正文内联（Markdown），让爬虫一次取完 |
| `AGENTS.md` | 面向编码 Agent：如何消费数据（端点清单 + curl 示例 + schema 摘要 + 字段语义） |
| `<page>/index.md` | **每页 Markdown 镜像**；HTML 内 `<link rel="alternate" type="text/markdown" href="./index.md">` |
| `feed.xml` / `feed.json` | RSS 2.0 / Atom / JSON Feed |
| `og/*.png` | 构建期用 satori + resvg 自动生成社交卡片图（1200×630） |

### 7.2 JSON-LD 策略

| 页面 | 结构化数据 |
|---|---|
| 首页 | `Person`（作者，含 `sameAs` 社交链接）+ `WebSite`（含 `SearchAction`）+ `CollectionPage` |
| 列表/标签页 | `CollectionPage` + `ItemList`（含 `ListItem` 的 `position/url/name`） |
| **项目详情页** | `SoftwareSourceCode`（`codeRepository`/`programmingLanguage`/`dateCreated`/`license`）+ `SoftwareApplication`（`applicationCategory`/`operatingSystem`/`offers`）+ `CreativeWork` + `BreadcrumbList`；有 FAQ 时追加 `FAQPage`；有截图时追加 `ImageObject` |
| 全站 | `Organization` 或 `Person` 保持一致实体 ID（`@id`），构建实体图谱 |

所有 JSON-LD 经 **XSS 安全序列化**（`<` → `\u003c`），并由 `audit` 用 schema.org 校验器抽查。

### 7.3 `mineproj audit --seo --ai`

按 Agent Readability 检查项实现自动打分（0–100），输出表格报告并支持 `--fail-under=85` 作为 CI 门禁：

```
站点级  ✓ llms.txt            ✓ robots.txt(AI 放行)  ✓ sitemap.xml   ✓ sitemap.md   ✓ AGENTS.md
页面级  ✓ 200/0 跳  ✓ meta description  ✓ og:*  ✓ html lang  ✓ JSON-LD  ✓ ≥3 标题  ✓ 文本比 18%  ✓ .md 镜像
评分    92 / 100  (Excellent)   ·  失败项：2 个页面缺 og:image
```

### 7.4 性能与 SEO 的交叉收益

- 首屏 HTML 全量可读 → 爬虫零 JS 依赖
- 图片：多尺寸 webp/avif + `srcset` + `loading=lazy` + 显式宽高（防 CLS）+ LQIP 模糊占位
- 关键 CSS 内联、字体 `font-display: swap`、`<link rel="preload">` 关键资源
- 规范链接 `<link rel="canonical">`，i18n 场景补 `hreflang`

---

## 8. 主题系统（需求 5）

### 8.1 主题契约

```ts
// 主题包入口（默认导出）
export default defineTheme({
  name: 'mineproj-theme-classic',
  version: '1.0.0',

  // ① 布局：按路由类型分发（缺失时回退到默认主题的对应布局）
  layouts: {
    home: HomeLayout,        // 首页：Hero 轮播 + 导轨
    list: ListLayout,        // 全部项目：筛选 + 网格
    detail: DetailLayout,    // 项目详情：主列 + 右栏 + 可玩面板
    tag: TagLayout,
    collection: CollectionLayout,
    about: AboutLayout,
    notFound: NotFoundLayout,
  },

  // ② 组件注册表：用户/插件可按名精确覆盖单个组件
  components: {
    ProjectCard, ProjectGallery, PlayableFrame,
    TagFilter, SearchBox, SortSelect, RailCarousel, StatsPanel, Footer,
    // v1.1 新增
    Prose,        // Markdown 渲染容器（§12）
    Toc,          // 目录
    Lightbox,     // 图片灯箱（§11.5）
    PdfViewer,    // PDF 阅读器（§11.4）
    ThemeToggle,  // 浅色 / 深色 / 跟随系统
    LangSwitch,   // 语言切换（§13）
  },

  // ③ 插槽：无需 fork 主题即可注入内容
  slots: {
    'card-badge': [],        // 卡片右上角角标
    'card-overlay': [],      // 卡片悬停覆盖层
    'detail-sidebar-top': [],
    'detail-after-body': [],
    'rail-paddle': [],
    'nav-end': [],           // 导航栏右侧（语言/主题切换默认挂这里）
    'footer': [],
    'prose-top': [],         // Markdown 正文上方（公告 / 译文提示）
    'prose-bottom': [],
  },

  // ④ 配置 schema（Zod），用户 themeConfig 会被校验 + 类型推导
  configSchema: z.object({
    accent: z.string().default('#2563EB'),           // 强调色；深色模式变体自动派生
    colorMode: z.enum(['light', 'dark', 'system']).default('system'),
    density: z.enum(['compact', 'comfortable']).default('comfortable'),
    contentWidth: z.union([z.literal(1200), z.literal(1280), z.literal(1440), z.literal('full')]).default(1280),
    palette: z.enum(['neutral', 'slate', 'warm', 'showcase']).default('neutral'),
    cardStyle: z.enum(['grid', 'wide', 'list', 'immersive']).default('grid'),
    heroMode: z.enum(['carousel', 'grid', 'none']).default('grid'),
    radius: z.enum(['none', 'sm', 'md', 'lg']).default('md'),   // 0 / 6 / 12 / 16px
    // v1.1 新增
    lightbox: z.object({
      enabled: z.boolean().default(true),
      zoom: z.boolean().default(true),
      counter: z.boolean().default(true),
    }).default({}),
    pdf: z.object({
      mode: z.enum(['viewer', 'iframe', 'cover']).default('viewer'),
      lazy: z.boolean().default(true),
      textLayer: z.boolean().default(true),
    }).default({}),
    markdown: z.object({
      toc: z.boolean().default(true),
      tocDepth: z.number().min(1).max(4).default(3),
      anchor: z.boolean().default(true),
    }).default({}),
  }),

  // ⑤ 本地化字典
  locales: { 'zh-CN': zhCN, 'en': en },

  // ⑥ 构建期扩展（等价于 VitePress 的 /config 子路径，但内聚在包内）
  vite: { plugins: [], css: [] },

  // ⑦ 生命周期
  setup(ctx) { /* ctx: { config, themeConfig, addComponent, registerSlot, logger } */ },
});

export type ThemeConfig = z.infer<typeof configSchema>;
```

### 8.2 解析与使用

```ts
// mineproj.config.ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  theme: 'classic',          // ① 简写 → @mineproj/theme-classic（★ 默认主题，可省略）
  // theme: 'gallery',        //    → @mineproj/theme-gallery（可选官方主题：深色沉浸式画廊）
  // theme: 'nebula',        //    → mineproj-theme-nebula（社区包自动补前缀）
  // theme: '@scope/theme-x',//    → 作用域包原样解析
  // theme: myLocalTheme,    //    → 内联对象
  themeConfig: {
    accent: '#2563EB',
    colorMode: 'system',      // light | dark | system
    density: 'comfortable',
    contentWidth: 1280,
    radius: 'md',
  },
});
```

**解析优先级**：内联对象 > 已安装 npm 包 > `mineproj-theme-*` 自动补全 > 本地 `.mineproj/theme/` 目录 > 回退 `@mineproj/theme-classic`。

**扩展（不 fork）**：
```ts
// .mineproj/theme/index.ts
import classic from '@mineproj/theme-classic';

export default {
  extends: classic,
  components: { ProjectCard: MyCard, PdfViewer: MyPdf },   // 只换需要的组件
  slots: { 'card-badge': [MyBadge] },                      // 只插一个角标
  configSchema: classic.configSchema.extend({ ... }),
};
```

### 8.3 设计令牌（换肤不 fork）

所有主题必须消费**同一套 CSS 自定义属性名**——换肤只改值不改结构，二次开发者覆盖变量即可：

```css
:root {
  /* ── 中性色阶（浅色为默认；对比度已按 §1.3.4 校验）── */
  --mp-color-bg:          #FAFAFA;   /* 页面底 */
  --mp-color-surface:     #FFFFFF;   /* 卡片 / 面板 */
  --mp-color-surface-alt: #F4F4F5;   /* 次级块（代码底色、表头）*/
  --mp-color-border:      #E4E4E7;   /* 两种模式下均可见 */
  --mp-color-text:        #09090B;   /* ≈ 19.8:1 */
  --mp-color-muted:       #52525B;   /* ≈ 7.5:1 */
  --mp-color-accent:      #2563EB;
  --mp-color-accent-fg:   #FFFFFF;

  /* ── 间距（基准 4px）─────────────────────────────── */
  --mp-space-1: 4px;   --mp-space-2: 8px;   --mp-space-3: 12px;  --mp-space-4: 16px;
  --mp-space-5: 20px;  --mp-space-6: 24px;  --mp-space-8: 32px;  --mp-space-12: 48px;
  --mp-space-16: 64px; --mp-space-24: 96px;

  /* ── 圆角（radius 配置项映射到这四个值）───────────── */
  --mp-radius-sm: 6px;  --mp-radius-md: 12px; --mp-radius-lg: 16px; --mp-radius-full: 999px;

  /* ── 阴影 ─────────────────────────────────────────── */
  --mp-shadow-1: 0 1px 2px rgb(0 0 0 / .06);
  --mp-shadow-2: 0 8px 24px rgb(0 0 0 / .10);

  /* ── 布局 ─────────────────────────────────────────── */
  --mp-content-width: 1280px;
  --mp-grid-columns: 12;  --mp-grid-gutter: 24px;  --mp-nav-height: 64px;

  /* ── 字体 ─────────────────────────────────────────── */
  --mp-font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI',
                  'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC',
                  'Microsoft YaHei', sans-serif;
  --mp-font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular',
                  'Cascadia Code', Consolas, monospace;
  --mp-text-display: 40px;  --mp-text-h2: 24px;
  --mp-text-body: 16px;     --mp-text-meta: 14px;
  --mp-leading-body: 1.75;  --mp-leading-heading: 1.3;

  /* ── 动效 ─────────────────────────────────────────── */
  --mp-duration-fast: 150ms; --mp-duration: 200ms; --mp-duration-slow: 300ms;
  --mp-ease: cubic-bezier(.4, 0, .2, 1);
}

/* 深色模式：同名变量换值，组件代码零条件分支 */
:root[data-theme='dark'] {
  --mp-color-bg:          #0B0C0E;
  --mp-color-surface:     #151719;
  --mp-color-surface-alt: #1F2124;
  --mp-color-border:      #2A2D31;
  --mp-color-text:        #E7E9EA;   /* ≈ 15.3:1 */
  --mp-color-muted:       #A1A1AA;   /* ≈ 7.0:1 */
  --mp-color-accent:      #60A5FA;
  --mp-color-accent-fg:   #0B0C0E;
  --mp-shadow-1: 0 1px 2px rgb(0 0 0 / .40);
  --mp-shadow-2: 0 8px 24px rgb(0 0 0 / .50);
}

/* 动效降级：一条规则覆盖全部 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

**明暗切换无闪烁**：`<head>` 内联一段 ~300 字节的同步脚本，在首帧前根据 `localStorage.theme` / `prefers-color-scheme` 写好 `documentElement.dataset.theme`，避免"先白后黑"的闪屏。切换器只改这个属性 + 持久化。

> `theme-gallery` **不改任何变量名**，只覆盖值（画布 `#1b2838`、圆角 0/2px、无阴影等），因此任何为 classic 写的插槽组件都能无缝跑在 gallery 下——这是契约测试的断言之一。

### 8.4 主题生态约定

- 命名：`@mineproj/theme-*`（官方）/ `mineproj-theme-*`（社区）
- `package.json` 标注 `"keywords": ["mineproj-theme"]`、`"mineproj": { "type": "theme" }`
- **契约测试**：`@mineproj/test-utils` 提供 `runThemeContract(theme)`，任何主题跑同一套断言（布局齐全、schema 可解析、令牌齐全、SSR 无副作用），CI 中强制通过
- 仓库维护 `THEMES.md` 索引表

---

## 9. 插件系统（需求 6）

### 9.1 插件契约

```ts
export default definePlugin({
  name: 'mineproj-plugin-og-image',
  enforce: 'post',                       // pre | normal | post（执行顺序）

  // ① mineproj 生命周期钩子
  hooks: {
    'config:resolved':  (config) => config,                 // 瀑布：可改写配置
    'data:loaded':      (dataset, ctx) => {},               // 序列：增删改项目、注入字段
    'data:validated':   (dataset, ctx) => {},
    'routes:collect':   (routes, ctx) => routes,            // 瀑布：增改路由（造新页面）
    'api:endpoints':    (endpoints, ctx) => endpoints,      // 瀑布：注册自己的 API 端点
    'assets:process':   (assets, ctx) => {},                // 序列：图片/资源管线介入
    'render:before':    (html, ctx) => html,                // 瀑布：注入 JSON-LD / 脚本
    'render:after':     (ctx) => {},
    'emit':             (files, ctx) => {},                 // 序列：任意文件写入产物
    'md-mirror:before': (md, ctx) => md,                    // 瀑布：改 Markdown 镜像
    'build:done':       (stats, ctx) => {},
  },

  // ② 直接透传原生 Vite 插件（★ 白嫖整个 Vite/Rollup/unplugin 生态）
  vite: [ /* VitePlugin[] */ ],

  // ③ 运行时组件（注入主题组件注册表，可被主题覆盖）
  components: { OgBadge: OgBadge },

  // ④ 声明式配置 schema（用户在 config.plugins 里传参，会被校验）
  optionsSchema: z.object({ width: z.number().default(1200) }),
});
```

### 9.2 Hook 内核

自研轻量实现（约 2KB，不引 tapable 依赖），支持四种调用语义：

| 语义 | 说明 | 用于 |
|---|---|---|
| `seq` 序列 | 按注册顺序依次执行，忽略返回值 | `data:loaded`、`emit`、`build:done` |
| `waterfall` 瀑布 | 上一返回值作为下一入参，最终返回终值 | `config:resolved`、`render:before`、`routes:collect` |
| `parallel` 并行 | `Promise.all` | `assets:process` |
| `first` 短路 | 首个非 `undefined` 返回即终止 | `resolve:page`、`resolve:og-image` |

顺序控制：`enforce`（pre/normal/post）+ `before: ['plugin-a']` + `after: ['plugin-b']` 三级排序，拓扑排序检测循环依赖并报错。

### 9.3 插件发现

```ts
export default defineConfig({
  plugins: [
    'seo',                                   // 简写 → @mineproj/plugin-seo
    ['sitemap', { exclude: ['/drafts/**'] }], // 带参
    'mineproj-plugin-analytics',             // 社区包
    myLocalPlugin,                           // 内联对象
    tailwindcssPlugin(),                     // 甚至可以是纯 Vite 插件
  ],
  autoDiscover: false,   // 可选：扫描 package.json 中 mineproj.plugin=true 的依赖
});
```

**关键设计**：`plugins` 数组**同时接受 mineproj 插件与裸 Vite 插件**——内核自动识别形态（有 `hooks`/`name: mineproj-plugin-*` 走钩子管线，否则原样透传给 Vite）。这一条让生态接入成本降到零。

---

## 10. 默认主题 `@mineproj/theme-classic`（需求 7）

### 10.1 设计立场：学架构，不学皮肤

| | 内容 |
|---|---|
| **学：信息架构** | 卡片网格一眼扫过；分面筛选（多维、实时、可分享）；悬停即得更多信息；详情页「内容在左 / 事实在右」；可玩即试；标签即入口；随机探索 |
| **不学：品牌皮肤** | 深色玻璃质感；0–2px 圆角；"密集即品牌"的压迫感；商店化符号（价格、愿望单、评测、促销位） |

一句话目标：**让作品自己说话，界面退到幕后。** 中性底、克制的强调色、充足留白、可读优先。默认浅色（覆盖绝大多数通用场景），深色模式一等公民。

### 10.2 页面结构

**首页**

```
┌ Nav（64px，sticky，半透明毛玻璃；滚动后显示 1px 边框）──────────┐
│  mineproj    项目 · 分类 · 标签 · 关于        [搜索]  [中]  [明]  │
├ Hero（居中，最大 720px）────────────────────────────────────────┤
│  Mai · 开发者                                                    │
│  一句话自我介绍                                                  │
│  [ 浏览项目 ]  [ GitHub ]         12 个项目 · 8 个可玩 · 4 个开源  │
├ 精选 Featured（非对称：1 大 + 2 小）────────────────────────────┤
│  ┌────────────────────────┐   ┌──────────┐                      │
│  │  大卡：封面 + 名称 + 标语  │   │  小卡 1  │                      │
│  │                        │   ├──────────┤                      │
│  │                        │   │  小卡 2  │                      │
│  └────────────────────────┘   └──────────┘                      │
├ 全部项目（筛选条 + 网格）────────────────────────────────────────┤
│  [全部] [Web] [游戏] …   标签 ▾  状态 ▾   排序：最新 ▾   共 12 项  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  封面 16:9 │ │          │ │          │ │          │            │
│  │  名称      │ │          │ │          │ │          │            │
│  │  标语（2行）│ │          │ │          │ │          │            │
│  │  标签  时间 │ │          │ │          │ │          │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
├ 关于 / 技能 / 联系 ────────────────────────────────────────────┤
└ Footer（License · 源码 · RSS · llms.txt · 语言 · 主题）──────────┘
```

**项目列表页**：顶部横向筛选 chip 条 + 可展开的筛选面板（分类 × 标签 × 状态 × 平台 × 年份 × 是否可玩）+ 排序下拉 + 搜索框；下方卡片网格；筛选态同步 URL query（可分享、可书签、可 SSR）。

**项目详情页**

```
[面包屑：项目库 / Web / mineproj]

左主列（~820px）                        右栏（~340px，sticky）
├ 标题 + 标语 + 状态角标                 ┌────────────────────┐
├ 媒体区：封面 / 视频 / 截图轮播 → 灯箱    │ 封面               │
├ 可玩面板 PlayableFrame（若有）          │ [仓库] [在线试用]   │
├ 正文（Markdown · Prose + 目录）         │ ────────────────── │
├ 亮点 highlights                       │ 创作时间  2026-09  │
├ 文档 docs（PDF 阅读器，支持多语言）      │ 最近更新  2026-09  │
├ 截图画廊（点击进灯箱）                   │ 版本      v1.1     │
├ 更新日志 changelog                     │ 许可      Apache   │
├ FAQ（→ FAQPage JSON-LD）               │ ────────────────── │
└ 相关项目推荐                            │ 技术栈 · 平台       │
                                        │ 标签云              │
                                        │ 统计（stars …）     │
                                        └────────────────────┘
```

移动端（< 768px）：单列，右栏下沉为「项目信息」折叠面板，紧跟在媒体区之后。

### 10.3 卡片规格

| 状态 | 表现 |
|---|---|
| 默认 | 圆角 12px、1px 边框 `--mp-color-border`、背景 `--mp-color-surface`；封面 16:9 `object-fit: cover`；内容区 padding 16px：名称（16px/600）+ 标语（14px，muted，2 行截断）+ 标签 pill（最多 3 个 + "+N"）+ 时间（13px，muted，右对齐） |
| 悬停 | 边框转强调色 + `--mp-shadow-2` + `translateY(-2px)` + **封面在容器内 `scale(1.03)`**（`overflow: hidden`）；200ms `--mp-ease`；**盒子尺寸不变**（无布局抖动） |
| 聚焦 | `:focus-visible` → 2px 强调色 outline + 2px offset |
| 角标 | 左上：状态（`NEW` 30 天内 / `UPDATED` 14 天内 / `WIP` / `ARCHIVED`）；右上：`可玩` / `开源` / 插件自定义（走 `card-badge` 插槽） |
| 无封面 | 首字母 + 基于 slug 的稳定渐变 + 可选技术栈字样（对比度须达标） |
| 骨架 | 同尺寸骨架屏，防 CLS |
| 触控 | < 768px 不启用 hover 效果，整卡可点，热区 ≥ 44px |

### 10.4 筛选 / 搜索 / 排序

- **筛选**：chip 条（常用项）+ 展开面板（分类 / 标签 / 状态 / 平台 / 年份 / 是否可玩），多选、实时生效、URL 同步、结果计数、"清除全部"、"排除已归档"开关
- **搜索**：`/` 或 `Cmd/Ctrl+K` 打开命令面板；MiniSearch 前缀 + 模糊，字段权重 `name 3.0 / tags 2.0 / tagline 1.5 / summary 1.0`；结果分组（项目 / 标签 / 页面）
- **排序**：最新 / 最早 / 名称 A–Z / 最近更新 / 热度（stats 加权）/ 自定义 `weight`
（随机推荐，提升长尾曝光）

### 10.5 响应式与无障碍

| 断点 | 布局 |
|---|---|
| ≥ 1440px | 4 列，内容宽 1280px |
| 1024–1439px | 3 列，内容宽 1200px |
| 768–1023px | 2 列，筛选面板折叠为抽屉 |
| < 768px | 1 列，导航折叠汉堡菜单，触控目标 ≥ 44×44px |

无障碍：全键盘可达（筛选 / 轮播 / 可玩面板 / 灯箱 / PDF 阅读器均有焦点与 `aria-*`）、可见 focus ring、对比度 ≥ 4.5:1、`prefers-reduced-motion` 关闭全部动效、图片 `alt` 缺失构建告警、提供"跳到主内容"链接。

### 10.6 内置配色

| 名称 | 说明 |
|---|---|
| `neutral` | 中性灰白 + 蓝强调（**默认**） |
| `slate` | 冷灰蓝，偏专业 / 企业 |
| `warm` | 暖米色，偏人文 / 设计向 |
| `showcase` | 深色沉浸式画廊（**仅换令牌值，结构完全相同**） |
| 自定义 | 覆盖 `--mp-*` 令牌即可，无需 fork |

### 10.7 可选官方主题 `@mineproj/theme-gallery`

- 与 classic 走**完全相同**的契约与解析路径，用户只需 `theme: 'gallery'`
- 差异仅在**令牌值**与少量组件：沉浸式卡片（圆角 0、封面满幅无内边距）、深色分区、横向导轨 + 悬停渐显翻页、悬停展开大图轮播、纯黑 tooltip
- 令牌基线：`#1b2838` 主画布 / `#0f1c25` 深色区 / `#67c1f5` 强调 / `#c7d5e0` 正文 / `#67707b` 次要；圆角 0–2px；6 列栅格 16px gutter；内容宽 940 或 1200
- **它的存在有两个目的**：① 满足偏好深色沉浸式陈列的用户；② **作为契约 dogfooding 的第二样本** —— 证明同一份数据、同一批插件在截然不同的皮肤下都能跑通，主题契约没有悄悄耦合 classic 的实现细节

### 10.8 主题切换的实现约束（硬）

1. `<head>` 内联 ~300 字节同步脚本，首帧前写入 `documentElement.dataset.theme`（来源：`localStorage.theme` → `prefers-color-scheme`），**杜绝闪白/闪黑**
2. 组件内**禁止硬编码颜色值**——CI 用正则扫描主题包内 `#[0-9a-fA-F]{3,8}` 字面量并告警（令牌定义文件除外）
3. 深色模式必须单独跑对比度检查（`audit --a11y` 集成）
4. 图标统一 Lucide，尺寸一致；**禁止 emoji 当图标**

---

## 11. 富媒体预览与可玩试用（需求 8 / 11 / 12）

### 11.1 目录约定

```
public/                      # 原样复制到 dist/ 根目录
├─ demos/<slug>/             # 可玩 Demo 的构建产物（HTML/CSS/JS/WASM）
data/projects/<slug>/
├─ gallery/                  # 截图（自动按文件名排序，可选 caption.json 补充）
└─ docs/                     # PDF 等附件（自动探测页数/体积、抽取首页封面）
```

Demo 产物被**原样复制**到 `dist/demos/<slug>/`，详情页通过 `PlayableFrame` 内嵌即可在线试用；PDF 附件被复制到 `dist/projects/<slug>/docs/`，由 `PdfViewer` 消费。

### 11.2 安全策略（硬性 · iframe）

| 场景 | sandbox 值 |
|---|---|
| **默认（不可信 / 同源 Demo）** | `allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox`（**不含 `allow-same-origin`**） |
| 显式 `trusted: true` | 追加 `allow-same-origin`（仅当你完全信任该 Demo 代码） |
| 纯静态展示（无 JS） | `""`（全锁） |
| 外链 Demo（itch.io / CodeSandbox / GitHub Pages） | 由对方 `X-Frame-Options` 决定；不支持嵌入时自动降级为"在新窗口打开"按钮 |

> **红线**：`allow-scripts` 与 `allow-same-origin` **绝不可同时授予不可信内容**——组合后 iframe 内的脚本可移除自身的 `sandbox` 属性，隔离完全失效。此条为 CI 回归断言之一。

配套：`referrerpolicy="no-referrer"`、`loading="lazy"`、`title`（无障碍必备）、`allow` 显式授权（fullscreen / gamepad / clipboard-write）、`postMessage` 来源白名单校验。

### 11.3 PlayableFrame 组件能力

- 悬停/点击才挂载 iframe（首屏不加载重型 Demo）
- 加载态骨架 + 进度提示 + 超时兜底 + 加载失败降级为「新窗口打开」
- 全屏按钮、新窗口打开、重载按钮
- `postMessage` 高度自适应（`{type:'mp-demo-resize', height}`）
- 移动端不友好时显示横屏提示（由 `requirements` 驱动）
- 主题可通过 `components.PlayableFrame` 完全替换

### 11.4 PDF 预览（需求 11）

**三级降级链（必须全部实现，缺一不可）**

| 级别 | 触发条件 | 表现 |
|---|---|---|
| **L1 pdf.js 自绘 viewer** | 桌面端 + JS 可用 + `preview: 'viewer'`（默认） | 翻页、缩放、缩略图侧栏、页内搜索、可选文本层 |
| **L2 原生 iframe** | iOS Safari / 低端设备 / `preview: 'iframe'` / L1 加载或渲染失败 | `<iframe src="*.pdf#view=FitH">`，零 JS 成本 |
| **L3 封面 + 下载** | JS 不可用 / L2 也不支持 / `preview: 'cover'` | 构建期抽取的首页封面 + 「下载 PDF（2.4 MB · 18 页）」+ 新窗口打开 |

降级判定发生在运行时：`await import('pdfjs-dist')` reject 或首屏渲染抛错 → 自动切 L2；再失败 → L3。三条路径都要有 E2E 断言。

**性能约束（硬）**

- `pdfjs-dist` **不得进入任何页面的初始 JS**：只在用户点击「预览」或 viewer 滚动进视口时动态 `import()`
- `rollupOptions.manualChunks` 拆独立 chunk（带 hash、长缓存）
- Worker 路径必须写成 `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()`，否则 Vite 不会产出 worker 资源
- PDF chunk 单列预算 ≤ 350KB gzip，**不计入首屏预算**（§17）
- 构建期可选抽取首页封面写入 `docs[].cover`，让 L3 与卡片缩略图零运行时成本

**无障碍与 i18n**

- 工具栏按钮均有 `aria-label`（走主题 `locales` 字典，随站点语言切换）
- 键盘：`←/→` 翻页、`+/-` 缩放、`0` 适应宽度、`Esc` 退出全屏
- 文本层开启时支持选中、复制、页内搜索与屏幕阅读器
- 多语言 PDF：`docs[]` 中同 `title` 不同 `lang` 的条目在当前语言下优先展示（`design-doc.en.pdf`）
- 已知限制：XFA 动态表单、部分加密或嵌入特殊字体的 PDF 可能渲染异常 → 这正是降级链必须存在的理由

### 11.5 图片预览 / 灯箱（需求 12）

**触发位置**：详情页媒体区与截图画廊、Markdown 正文内图片（同组图片自动成为一个画廊）。

**能力清单（自研，目标 ≤ 6KB gzip）**

| 能力 | 说明 |
|---|---|
| 打开 / 关闭 | 点击放大；`Esc`、点击遮罩、关闭按钮均可退出 |
| 导航 | `←` `→` 或左右按钮；触屏左右滑动；循环 |
| 缩放 | 滚轮 / 双指捏合 / `+` `-`；双击在 1× 与 2× 间切换；`0` 适应窗口 |
| 平移 | 放大后可拖拽，带边界限制 |
| 计数器 + 说明 | `3 / 12` + caption（取自 `screenshots[].caption` 或 Markdown 的 `alt`/`title`） |
| 缩略图条 | 底部横向条，当前项高亮；> 12 张时可滚动 |
| 预加载 | 当前 ±1 张，其余 lazy |

**无障碍（硬）**

- `role="dialog"` + `aria-modal="true"` + `aria-label`
- **焦点陷阱**：Tab 循环限制在灯箱内部
- 打开时锁定 body 滚动（`overflow: hidden` + 补 padding 补偿滚动条宽度，**不产生布局跳动**）
- 关闭后**焦点返回触发元素**
- `prefers-reduced-motion` 关闭过渡
- 图片 `alt` 非空（构建期告警，见 §5.3）

**图片管线**：480 / 960 / 1440 / 1920 四档 `webp` + `avif`；LQIP base64 内联占位（< 1KB）；显式 `width`/`height` 防 CLS；EXIF 方向自动纠正；HEIC / RAW 不处理并提示转换。

### 11.6 视频与其他媒体

- `video` 字段：`<video controls preload="metadata" poster>`，**禁止自动播放**（无障碍与流量）
- 外链视频（YouTube / Bilibili）走 **facade 模式**：先显示封面图，点击才加载播放器（省 ~1MB）
- 未来扩展（`audio`、glTF 3D 模型、地图）一律走插件位与 `components` 覆盖，不进内核

---

## 12. Markdown 内容管线（需求 10）

### 12.1 定位：JSON 管元数据，Markdown 管叙述

| 层 | 载体 | 负责 | 特征 |
|---|---|---|---|
| **元数据层** | `index.json` | 可查询、可筛选、可排序、可结构化的字段 | Zod 校验、进 API 与 JSON-LD |
| **正文层** | `body.md` / `body.<locale>.md` | 长文叙述、图文排版、代码与公式 | 构建期渲染为 HTML，运行时零 JS |

二者在同一项目目录内共存，互不重叠：`body.md` 不再重复写"项目名/标签/时间"，那些是 JSON 的活。

### 12.2 渲染管线（全部在构建期完成）

```
body.md
  ↓  front-matter（可选：覆盖 title / description / toc / draft）
  ↓  markdown-it（GFM：表格 · 任务列表 · 删除线 · 自动链接 · 脚注）
  ↓  块级扩展：容器（::: tip / ::: warning）、Mermaid→SVG、KaTeX→MathML+CSS
  ↓  @shikijs/markdown-it（构建期着色，输出明暗双主题 CSS 变量）
  ↓  图片处理：相对路径 → 资源管线（多档 srcset + LQIP + 显式宽高）
  ↓  链接处理：站内链接可达性校验 + 外链自动 rel="noopener noreferrer"
  ↓  标题处理：slugify（中文按字切分 + 重名去重）→ 锚点 + Toc 数据
  ↓  安全净化：默认 html:false；显式开启时用白名单 sanitize
  ↓  产出 { html, toc, excerpt, plainText, readingTime, headings }
```

**产出物**（构建期算好，随页面内联或写入 API）：

| 字段 | 用途 |
|---|---|
| `html` | 直接内联进静态页（SEO 可见，禁用 JS 也能读） |
| `toc` | 目录组件数据（`h2`–`h4`，深度可配） |
| `excerpt` | 纯文本前 160 字 → `meta description` 兜底 / 卡片摘要 / `llms.txt` 条目 |
| `plainText` | 全文纯文本 → **Markdown 镜像页**（§7）与搜索索引 |
| `readingTime` | 阅读时长（中文 300 字/分钟、英文 200 词/分钟） |
| `headings` | JSON-LD 与 AI 解析辅助 |

### 12.3 代码块规格

- **Shiki 3** `createHighlighter({ themes: { light: 'github-light', dark: 'github-dark' } })` → 输出 `--shiki-light` / `--shiki-dark` 双变量，**明暗切换纯 CSS，无需重新着色**
- 默认语言白名单：`ts / tsx / js / json / bash / python / rust / go / java / c / cpp / css / html / md / sql / yaml / docker / nginx`；用 `shiki/bundle/web` 或 `createHighlighterCore` 精细导入以控制冷启动
- `langAlias` 支持 `sh→shell`、`zsh`、`vue`、`nix` 等别名
- 兜底三件套：`fallbackLanguage: 'text'` + `onError` + 构建 info 告警（**单个语言失败不中断构建**）
- 代码工具条（Island，可选）：复制、语言标签、行号开关、超长代码折叠

> v1/v2 的 `getHighlighter()` 与 `loadWasm` 在 v3 已废弃，M0 起一律用 `createHighlighter` + `createOnigurumaEngine`。

### 12.4 安全

- **默认禁止内联 HTML**（`html: false`）
- 确需 HTML 时：`markdown.html = true` + 白名单净化（禁 `script` / `iframe` / `style` / `on*` / `javascript:`）
- 外链自动 `rel="noopener noreferrer"`
- 相对图片路径必须在项目目录内，越界（`../`）直接报错

### 12.5 插件扩展点

| Hook | 用途 |
|---|---|
| `'md:before-parse'` | 改写源 Markdown（包含式、变量替换） |
| `'md:transformers'` | 注入 Shiki transformers（行高亮、diff、聚焦） |
| `'md:after-render'` | 改写产出 HTML |
| `'md:toc'` | 自定义目录结构与层级 |

官方与社区可在这些点上挂：Mermaid、KaTeX、PlantUML、ECharts、Callout 容器、B 站 / YouTube 嵌入 facade、Open Graph 卡片。

### 12.6 与 SEO / AI 友好的协同

- 每页 Markdown 镜像（§7）**直接复用 `plainText` + front-matter**，无需二次解析
- 代码块保留语言标注（AI 解析成功率更高）
- 长文自动产出 `h2`/`h3` 小节，满足"≥ 3 个子标题"的可读性检查项
- `excerpt` 与 `plainText` 同时喂给 `llms.txt` 与搜索索引，三处内容同源

---

## 13. i18n（需求 9）

### 13.1 三类翻译对象

| 层 | 来源 | 治理者 |
|---|---|---|
| **UI 文案** | 主题 `locales` 字典 + 站点 `site.i18n.overrides` 覆盖 | 主题作者 / 站长 |
| **内容字段** | `index.json` 字段 + `i18n.<locale>` 或 `index.<locale>.json` 覆盖 | 内容作者 |
| **长文与附件** | `body.md` / `body.<locale>.md`、`docs[]` 的 `lang` 与 `<basename>.<locale>.pdf` | 内容作者 |

### 13.2 覆盖与回退

**优先级（后者覆盖前者）**

1. `index.json` 根字段（视为默认语言 `defaultLocale` 的内容）
2. `index.json` 内的 `i18n.<locale>` 对象
3. `index.<locale>.json` 文件

- 合并语义：对象**深度合并**，数组**整体替换**（避免"半翻译的数组"这类难以理解的状态）
- 缺失键：回退默认语言并构建告警；`--strict-i18n` 时升级为 error
- **运行时回退链**：`locale` → `fallbackLocale` → `defaultLocale`
- `availableLocales` 声明该项目实际支持的语言。未列出的语言下**仍然生成页面**，但顶部显示「暂无本语言版本，以下为原文」提示条——**不返回 404**，避免链接失效与 SEO 损失

### 13.3 路由与产物

| 策略 | 产物 | 说明 |
|---|---|---|
| 默认语言**无前缀** | `/`、`/projects/foo/` | 默认语言路径最干净（可用 `prefixAll` 改为全部带前缀） |
| 其他语言**带前缀** | `/en/`、`/en/projects/foo/` | 前缀 = locale 小写第一段 |

- 每页输出 `hreflang`（含 `x-default`）与正确的 `<html lang>`
- `sitemap.xml` 输出**全部语言**的 URL（多语言站点要求各语言版本成对互指）
- 语言切换器保留当前路径（`/projects/foo/` ⇄ `/en/projects/foo/`）；目标语言无此页时回落到该语言首页并提示

### 13.4 资产与索引

- **搜索索引按语言分片**：`/search-index.<locale>.json`，只下载当前语言
- **API 按语言**：`/api/v1/projects.json?lang=en` 与 `/en/api/v1/projects.json` 等价；缺省用默认语言
- **Markdown 镜像按语言**：`/projects/foo/index.md` 与 `/en/projects/foo/index.md`
- **`llms.txt` 按语言**：`/llms.txt` 与 `/en/llms.txt`，各含自身语言条目
- **日期 / 数字**：用 `Intl.DateTimeFormat` / `Intl.NumberFormat` 在**构建期**格式化，避免运行时引入体积

### 13.5 主题与插件的 i18n 契约

- 主题导出 `locales: { 'zh-CN': {...}, 'en': {...} }`；缺失键回退 `en`，再回退字面量键名
- 主题**必须**通过 `ctx.t(key, params)` 取文案，**禁止硬编码 UI 字符串**（`runThemeContract` 的断言之一）
- 插件提供同名 `locales` 字段，内核按插件名加命名空间合并（`pluginName:key`），避免键冲突
- 复数与插值：`ctx.t('project.count', { count })` + `Intl.PluralRules`
- **RTL 预留**：`<html dir>` 由 locale 推导（`ar` / `he` / `fa` → `rtl`）；主题令牌与布局使用逻辑属性（`margin-inline` 而非 `margin-left`）

### 13.6 CLI 支持

| 命令 | 说明 |
|---|---|
| `mineproj check --i18n` | 输出每种语言的字段缺失清单与覆盖率 |
| `mineproj i18n:extract` | 扫描主题/插件源码中的 `ctx.t('key')`，生成待翻译 JSON 模板 |
| `mineproj i18n:init <locale>` | 为全部项目批量创建 `index.<locale>.json`（仅骨架与 TODO 注释） |

---

## 14. CLI 与配置

### 14.1 命令

| 命令 | 说明 |
|---|---|
| `npm create mineproj@latest` | 交互式脚手架（模板 / 包管理器 / 主题选择） |
| `mineproj dev` | 开发服务器（HMR + API 中间件 + 数据热重载） |
| `mineproj build` | 构建静态产物（含增量缓存） |
| `mineproj preview` | 本地预览产物（含正确的 MIME 与 SPA 回退） |
| `mineproj check` | 数据 + 配置校验（CI 友好，非零退出） |
| `mineproj dev --editor` | 启动开发服务器并挂载可视化编辑器（默认仅 127.0.0.1） |
| `mineproj editor:export` | 把浏览器草稿（`.mineproj-draft.json`）合并回 `content/` |
| `mineproj new <slug>` |
| `mineproj import github --user <name>` | 从 GitHub 批量导入仓库 → 生成 JSON（自动填空 stars/license/createdAt/links） |
| `mineproj audit [--seo] [--ai] [--a11y] [--perf] [--fail-under=N]` | 质量自检与评分 |
| `mineproj migrate --to <version>` | 数据 schema 迁移 |
| `mineproj info` / `doctor` | 环境、配置、主题、插件诊断 |
| `mineproj theme:eject` | 把当前主题源码复制到 `.mineproj/theme/` 以便深度定制 |

### 14.2 配置示例

```ts
// mineproj.config.ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'Mai 的项目库',
    description: '游戏、工具与实验的集合',
    url: 'https://projects.example.com',
    base: '/',                       // GitHub Pages 子路径部署支持
    lang: 'zh-CN',
    author: { name: 'Mai', url: 'https://github.com/Maicarons', sameAs: [] },
  },
  data: { dir: 'data', format: 'directory' },
  theme: 'classic',                  // 可选：'gallery' | 社区包名 | 内联对象
  themeConfig: {
    palette: 'neutral', colorMode: 'system', density: 'comfortable',
    contentWidth: 1280, radius: 'md',
    lightbox: { enabled: true, zoom: true },
    pdf: { mode: 'viewer', lazy: true },
    markdown: { toc: true, tocDepth: 3 },
  },
  plugins: [
    'seo', 'sitemap', 'llms', 'markdown-mirror', 'feed', 'search',
    ['og-image', { width: 1200, height: 630, font: 'Inter' }],
    ['playable', { defaultSandbox: 'allow-scripts allow-popups' }],
    ['pdf', { mode: 'viewer', lazy: true, textLayer: true }],
    ['lightbox', { zoom: true, counter: true }],
    ['markdown', { gfm: true, highlight: { light: 'github-light', dark: 'github-dark' } }],
    ['analytics', { provider: 'umami', siteId: 'xxx' }],
  ],
  api: {
    version: 'v1',
    mode: 'client',                  // client | hybrid | static
    pageSize: 24,
    facets: true,
  },
  seo: {
    jsonld: { enable: true, entity: 'Person' },
    llms: { enable: true, full: true, maxLinks: 30 },
    markdownMirror: true,
  },
  build: { outDir: 'dist', incremental: true, imageWidths: [480, 960, 1440, 1920] },
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    fallbackLocale: 'en',
    prefixAll: false,            // 默认语言不带 /zh-CN/ 前缀
    overrides: { 'en': { 'nav.about': 'About' } },   // 覆盖主题 UI 字典
  },
  markdown: {
    gfm: true, html: false,      // 默认禁内联 HTML（安全）
    toc: { depth: 3 }, anchor: true,
    highlight: { light: 'github-light', dark: 'github-dark', fallbackLanguage: 'text' },
  },
});
```

---

## 15. 部署

产物 `dist/` 为纯静态目录，可部署到任意静态托管：

| 平台 | 要点 |
|---|---|
| **GitHub Pages** | 配置 `site.base = '/<repo>/'`；提供官方 Actions 模板；SPA 回退用 `404.html` |
| **Cloudflare Pages** | 支持 `_headers` 设置 `llms.txt` 的 `Content-Type: text/plain`；可用 Worker 实现 `Accept: text/markdown` 内容协商 |
| **Netlify** | `_redirects` + Edge Function 做内容协商 |
| **Vercel** | 零配置 |
| **Nginx / OSS / COS** | 提供示例配置（含 MIME 与缓存头） |

官方提供 `.github/workflows/deploy.yml`（构建 → 上传 artifact → 部署）与多平台文档。

---

## 16. 开源治理（Apache 方向）

| 文件 | 内容 |
|---|---|
| `LICENSE` | Apache-2.0 全文 |
| `NOTICE` | 版权声明与第三方依赖归属 |
| `CONTRIBUTING.md` | 提交流程、commit 规范（Conventional Commits）、PR 模板 |
| `CODE_OF_CONDUCT.md` | Contributor Covenant |
| `SECURITY.md` | 漏洞披露流程（对应 ASF 要求的 Security 链接） |
| `GOVERNANCE.md` | 角色（user / contributor / committer / PMC-like maintainer）、共识决策、投票规则 |
| `DCO` | 提交签署（`Signed-off-by`），无需 CLA 的法律负担 |
| 源文件头 | `SPDX-License-Identifier: Apache-2.0` |
| Release | source release `.tar.gz` + `.asc`（GPG 签名）+ `.sha512`；`CHANGELOG.md` 自动生成 |

**ASF 合规预留**：默认主题提供 `asfBranding: true` 选项，自动在页脚注入 ASF 要求的 License / Sponsorship / Thanks / Security / Privacy 链接与商标归因文本。**在正式成为 ASF 项目前，此选项默认关闭，且不得使用 Apache 商标与羽毛标。**

---

## 17. 性能、无障碍与安全预算

| 维度 | 预算 / 门禁 |
|---|---|
| 首屏交互 JS（内容页） | **0 KB** |
| 首屏交互 JS（首页，含水合岛屿） | **≤ 30 KB gzip** |
| 单个 API JSON | ≤ 200 KB（超出自动分页 + 警告） |
| 图片 | 自动生成 480/960/1440 三档 webp + avif，LQIP 占位 |
| Lighthouse | Performance ≥ 95、Accessibility ≥ 95、Best Practices ≥ 95、SEO = 100（CI 门禁） |
| AI 可读性 | `mineproj audit --ai --fail-under=85` |
| 无障碍 | 图片 `alt` 缺失告警、对比度 ≥ 4.5:1、全键盘可达 |
| 安全 | Markdown 渲染经 sanitize（默认禁内联 HTML）、JSON-LD XSS 转义、iframe 默认不含 `allow-same-origin`、依赖 `pnpm audit` 门禁 |
| 构建速度 | 100 项目 ≤ 10s（增量 ≤ 2s） |

---

## 18. 风险与权衡

| 风险 | 影响 | 缓解 |
|---|---|---|
| **自建 SSG 内核维护成本** | 高 | 把能力外包给 Vite（透传插件）；内核只保留六件事；契约测试防回归 |
| **React runtime 体积** | 中 | Islands 按需水合；提供 `preact/compat` 别名开关进一步瘦身 |
| **主题契约腐化** | 中 | 默认主题 dogfooding + `runThemeContract` 契约测试强制 CI 通过 |
| **版本矩阵（Node 22+/Vite 7+/React 19/Zod 4）** | 中 | `peerDependencies` 宽松范围 + CI 矩阵测试 + `doctor` 诊断 |
| **静态 API 的表达力天花板**（无法 POST、无法真分页） | 中 | `hybrid` 模式预生成热门组合；MSW 插件补动态场景；文档明确边界 |
| **`allow-same-origin` 误用导致 XSS** | 高 | 默认不授予；`audit` 检查并告警；文档用醒目警告块说明 |
| **ASF 商标误用** | 中（法律） | 文档明确"Apache-2.0 许可 ≠ Apache 项目"；`asfBranding` 默认关闭 |
| **Editor 代码混入生产产物** | 高 | `editor.enabled` 默认 false；Editor 独立 chunk；CI bundle 断言产物中无 Editor 标记 |
| **Editor 写回破坏用户源文件** | 高 | FsTransport 路径白名单（`content/`、`public/media/`）；写前自动备份到 `.mineproj/backup/`；保存前强制 diff 预览 |
| **Zod 4 破坏性变更**

---

## 19. 验收标准（整体）

| # | 验收项 | 判定 |
|---|---|---|
| A1 | `npm create mineproj` → `pnpm dev` → 5 分钟内看到默认主题首页（含示例数据） | 人工 + E2E |
| A2 | `pnpm build` 产出纯静态目录，`python -m http.server` 直接托管可完整浏览全部内容 | E2E |
| A3 | 禁用 JS 后，全部页面内容（含列表、详情、搜索结果落地页）可完整阅读 | 人工 + E2E |
| A4 | `curl dist 托管地址/api/v1/projects.json` 返回合法 JSON | 集成测试 |
| A5 | 换个社区主题 npm 包（仅改配置一行），站点外观整体改变且功能完整 | 集成测试 |
| A6 | 写个 20 行插件注册新 API 端点并落盘 | 集成测试 |
| A7 | `mineproj audit --seo --ai` ≥ 85 | CI |
| A8 | Lighthouse 四项达标（95/95/95/100） | CI |
| A9 | 一个 HTML 小游戏 Demo 能在详情页内嵌试玩，且 iframe 无 `allow-same-origin` | 人工 + E2E |
| A10 | 100 个项目的站点构建 ≤ 10s | CI 基准 |
| A11 | `mineproj dev --editor` 创建一个完整项目 ≤ 3 分钟，保存后 `content/` 变更符合预期 | 人工 + 集成测试 |
| A12 | 生产构建（`editor.enabled: false`）产物中不含任何 Editor 代码 | bundle 断言 |

---

## 20. 演进路线

| 阶段 | 主题 | 内容 |
|---|---|---|
| **v0.x** | 内核可用 | M0–M3（本期 plan-dev 覆盖） |
| **v1.0** | 生态就绪 | M4–M6：官方插件齐备、3+ 社区主题、文档站上线 |
| **v1.5** | 编辑器与可视化 | 可视化编辑器三种形态落地（Dev / Static / PR），见 §21 |
| **v2.0** | 数据模型泛化 | 允许自定义内容类型（把 Project 变成一种 preset，支持论文墙 / 摄影集 / Mod 站） |
| **远期** | ASF 孵化评估 | 若社区成型，评估捐赠 ASF 孵化器（需商标批准、PMC 组建、IP 清理） |

---

## 21. 可视化编辑器（需求 14）

### 21.1 定位与边界

可视化编辑器（下称 Editor）是 mineproj 的**可选附加能力**：把"手写 JSON"变成"可视化填表 + 实时预览"。

**它解决什么**：

- 单项目字段多（§5.1 共 30+ 字段），手写易错、字段名难记
- 媒体路径与多语言文件散落在多处，靠人肉维护容易断链
- 调整数组顺序（亮点 / 画廊 / 附件）要反复改 JSON 再刷新看效果
- 非技术协作者（设计师、产品、导师）无法参与内容维护

**它明确不解决什么**（写进文档，避免期望错位）：

| 非目标 | 说明 |
|---|---|
| 多人实时协作 | 不做 CRDT / OT，不做在线协同。Git 才是协作层 |
| 账号与权限体系 | 不做用户系统；生产态的写入能力通过 OAuth 借用 GitHub 身份 |
| 通用 CMS | 不提供自定义内容类型建模，那是 v2.0「数据模型泛化」的事 |
| 替代 Git / 替代代码编辑器 | Editor 只产出 JSON / Markdown / 媒体文件，最终仍由 Git 管理版本 |

### 21.2 三种运行形态

纯前端项目要做"写回"，必须先回答**写到哪里**。按场景给出三种形态，共用同一套表单内核：

| 形态 | 触发方式 | 写入目标 | 依赖 | 适用场景 |
|---|---|---|---|---|
| **Dev Editor** | `mineproj dev --editor` | 本地 `content/`，经 Node `fs` 直接回写 | 仅 dev server | 日常创作，主力形态 |
| **Static Editor** | 构建产物 `/__editor__/`（需 `editor.static: true`） | 浏览器内存 + `localStorage`；导出 `.mineproj-draft.json` 或 JSON Patch 供下载 | 无 | 演示、评审、离线改稿 |
| **PR Editor** | 构建产物 + `editor.pr: { repo, clientId }` | 经 GitHub Contents API 直接开一个 PR | GitHub OAuth App | 开源项目众包贡献、他人帮忙改稿 |

三者的表单内核、校验、字段控件完全一致，只有"提交"这一步不同 —— 用 `EditorTransport` 接口隔离：

```ts
interface EditorTransport {
  read(slug: string): Promise<ProjectSource>;
  write(slug: string, next: ProjectSource, message: string): Promise<WriteResult>;
  upload(file: File): Promise<{ path: string }>;
  diff(slug: string, next: ProjectSource): Promise<DiffEntry[]>;
}
```

Dev 用 `FsTransport`（Node 侧）、Static 用 `MemoryTransport`、PR 用 `GitHubTransport`。

### 21.3 架构：Schema 驱动的表单

Editor 不另建一套数据定义 —— **Zod schema 是唯一事实来源**，表单结构与校验全部由它派生：

```
@mineproj/schema  (Zod schema + .meta() 元数据)
        │  describeFields()
        ▼
   FormDescriptor[]  ──►  字段控件注册表 fieldControls
        │                        ├─ text / textarea / number / switch
        │                        ├─ date / url / select / tags
        │                        ├─ markdown（复用 §12 管线做预览）
        │                        └─ media（上传 / 选择 / 去重）
        ▼
   <ProjectForm />  ──►  Zod 校验 ──►  字段级错误提示
        │
        ├──► 右侧实时预览（iframe + HMR 联动）
        └──► Transport.write() ──► content/
```

字段元数据直接挂在 Zod schema 上（Zod 4 的 `.meta()`）：

```ts
summary: z.string().max(200).meta({
  label: '一句话简介',
  help:  '显示在卡片与 OG 描述，建议 ≤ 60 字',
  group: 'basic',
  order: 20,
  widget: 'textarea',
  rows: 2,
}),

tags: z.array(z.string()).meta({
  label: '标签',
  widget: 'tags',
  group: 'taxonomy',
  order: 10,
}),
```

好处：schema 改一处，校验、表单、JSON Schema、IDE 提示、文档同步生效，不存在"表单漏字段"或"两处定义漂移"。

### 21.4 界面与交互

**布局**：左侧项目列表（搜索 + 新建），中间表单（按 `group` 分组折叠），右侧实时预览（iframe 指向 `/projects/<slug>`，与 dev server 同源）。窄屏下三者变为可切换的标签页。

| 能力 | 说明 |
|---|---|
| 实时预览 | 保存后走 HMR 增量刷新，不整页重载；滚动位置保持 |
| 拖拽排序 | `highlights` / `gallery` / `docs` / `techStack` 支持拖拽，顺序即数组顺序 |
| 媒体管理 | 本地上传 → 内容 hash 去重 → 写入 `public/media/<hash>.<ext>` → 回填相对路径；可从已有媒体库选择 |
| 多语言编辑 | 顶部语言切换；未翻译字段显示回退值 +「缺失」徽标；顶部显示翻译覆盖率进度条（复用 §13 的覆盖率算法） |
| Markdown 字段 | 双栏编辑 + 预览，预览走与生产一致的 §12 管线（含 Shiki 高亮），所见即所得 |
| 草稿与 diff | 未保存改动存内存 + `localStorage` 兜底；保存前可逐字段查看 diff；关页时拦截确认 |
| 校验反馈 | Zod 错误按 `issue.path` 精确落到字段，不用一个全局 toast 敷衍 |
| 键盘与无障碍 | 全表单可纯键盘操作；错误字段带 `aria-invalid` + `aria-describedby`；保存后焦点有反馈 |

### 21.5 安全边界（硬性）

Editor 是全项目**唯一具备写能力**的部分，安全约束硬编码，不靠配置自觉：

1. **生产构建默认不打包**。`editor.enabled` 默认 `false`；开启时 Editor 进独立 chunk，且必须显式声明 Static 或 PR 形态。
2. **Dev Editor 只绑定 `127.0.0.1`**，不监听 `0.0.0.0`；启动时终端打印醒目提示。
3. **FsTransport 路径白名单**：写入目标必须在 `content/` 与 `public/media/` 内，`..` 与绝对路径一律拒绝。
4. **上传三重校验**：扩展名 + MIME + 内容嗅探；单文件 ≤ 10MB；SVG 额外净化（防内嵌脚本）。
5. **PR Editor 最小权限**：OAuth 仅申请 `public_repo`（私有仓 `repo`）；token 只存内存与 `sessionStorage`，不落盘、不进产物。
6. **写接口防 CSRF**：校验 `Origin` 与一次性 token。

### 21.6 插件与主题扩展点

```ts
// 注册自定义字段控件
registerFieldControl('color-picker', ColorPickerControl);

// 生命周期钩子
hooks: {
  'editor:field:render': ...,  // waterfall：替换某字段的渲染结果
  'editor:beforeSave':   ...,  // seq：保存前改写数据（如自动生成 slug）
  'editor:afterSave':    ...,  // parallel：保存后触发（如重新生成 OG 图）
  'editor:transport':    ...,  // first：自定义 Transport（写 Notion / 数据库等）
}
```

主题可通过插槽覆盖编辑器外壳（如 `editor-shell`），但**表单内核与校验归 Editor 自己管** —— 主题可以换皮，不能破坏数据正确性。

### 21.7 验收

| # | 验收项 | 判定 |
|---|---|---|
| E1 | 从空白到创建一个完整项目（封面 + 3 张截图 + 正文 + 2 个标签）≤ 3 分钟 | 人工计时 |
| E2 | 任意字段填错都有字段级提示，且不阻塞其他字段编辑 | E2E |
| E3 | Dev Editor 保存后 `content/projects/<slug>/index.json` 内容正确，git diff 只含预期改动 | 集成测试 |
| E4 | 生产构建（`editor.enabled: false`）产物中不含任何 Editor 代码 | bundle 断言 |
| E5 | FsTransport 拒绝 `../../` 之类越界路径 | 单元测试 |
| E6 | Static Editor 导出的 draft 可被 `mineproj editor:export` 正确合并 | 集成测试 |

---

## 附录：参考来源

1. Vercel — *Agent Readability: A Specification for AI-Optimized Websites*（llms.txt / sitemap.md / AGENTS.md / 页面级检查项与评分）
2. Apache Software Foundation — *Project Branding Policy*、*Trademark Policy*、*Licensing FAQ*
4. VitePress — *Using a Custom Theme*（npm 主题分发契约：`extends` / `ThemeConfig` / 子路径 config）
5. Static Site Generators 2026 横评（Astro / Hugo / 11ty / VitePress / Next.js 的基准与定位）
6. MDN — `<iframe>` 与 `sandbox`（`allow-scripts` + `allow-same-origin` 的安全红线）
7. Mock Service Worker 文档（浏览器 Service Worker 与 Node 双路径拦截模型）
8. React 19 — `renderToPipeableStream` / `hydrateRoot`（`onAllReady` 用于爬虫与静态生成）
9. Astro 6 升级指南（Node 22.12+ / Vite 7 / Zod 4 生态基线）

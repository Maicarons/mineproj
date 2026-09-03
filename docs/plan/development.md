# mineproj · 开发计划（plan-dev.md）

> 文档版本：**v1.2**（v1.0 评审后修订）
> 创建日期：2026-09-03
> 上游文档：`plan.md`（产品技术方案）
> 状态：待评审 · 评审通过后按 M0 → M8 顺序执行

---

## 0. 本文档的定位

[《产品技术方案》](./) 回答"**做什么、为什么这么做**"，本文档回答"**按什么顺序做、每步做到什么程度算完成**"。

对照 §3–§12 的里程碑细节与 §13 的 WBS 总表

---

## 1. 开发原则与协作约定

### 1.1 铁律

| # | 规则 |
|---|---|
| **R1 · 一条任务 = 一次提交** | WBS 中每个 `M*-NN` 任务完成后立即 commit，不攒批。commit message 用**英文**（规避本机 Bash 传中文的编码风险），格式见 §1.2 |
| **R2 · 契约先于实现** | 任何跨包接口（内核↔主题、内核↔插件、站点↔API）先写 TypeScript 类型 + Zod schema + 契约测试骨架，再写实现 |
| **R3 · 默认主题即契约验证器** | `@mineproj/theme-classic`
| **R4 · 能透传就不自研** | 遇到 Vite 生态已有能力（PWA、图标、自动导入、压缩…），一律写成"透传 Vite 插件"的薄封装 |
| **R5 · 每个里程碑必须有可演示产物** | 里程碑结束必须能 `pnpm build` 出静态目录并在浏览器里用起来，禁止"只有单测绿、没有可见产物" |
| **R6 · 测试是交付的一部分** | 未通过契约测试 / 集成测试的功能不计入完成 |

### 1.2 Git 与提交规范

```
分支：trunk-based
  main            —— 唯一长期分支，始终可发布
  feat/M1-03-data-loader   —— 短生命特性分支（存活 < 3 天）
  fix/xxx  chore/xxx

提交信息（Conventional Commits，全英文）：
  feat(core): add zod schema loader with file-level error reporting
  fix(theme-classic): prevent
  test(api): add endpoint snapshot contract
  docs(plan-dev): refine M6 SEO plugin acceptance criteria

提交签署（DCO）：git commit -s
PR：squash merge，PR 描述必须含 "Closes #<issue>" 与验收清单勾选
```

### 1.3 本机环境注意事项（Windows + Git Bash）

| 事项 | 说明 |
|---|---|
| 运行时 | Node **≥ 22.12**（推荐 24 LTS）；`pnpm` 通过 `corepack enable` 启用 |
| **构建时的 NODE_OPTIONS 坑** | 本机 WorkBuddy Bash 沙箱注入 `NODE_OPTIONS="--require=genie-safe-delete.cjs"`，会让需要清理临时目录的 Node 构建失败。执行 `pnpm build` / `pnpm test` 前加 `NODE_OPTIONS=""` |
（见 §15.4）
| 行尾 | 仓库统一 **LF**（`.gitattributes` 强制），但 `.bat`/`.cmd` 必须 CRLF + 纯 ASCII |
| 代理 | 本机 `127.0.0.1:7890` 代理会干扰 `git push` 与下载，涉及网络操作时用 env-cleared 方式执行 |
| Playwright | 首次需 `pnpm exec playwright install chromium`（需能访问 CDN，必要时走代理） |

---

## 2. 里程碑总览

| 里程碑 | 名称 | 核心目标 | 关键退出标准 | 预估 |
|---|---|---|---|---|
| **M0** | 地基与内核骨架 | monorepo 跑通，CLI 能把一份 JSON 渲染成一个静态 HTML | `mineproj build` 产出可读 HTML | 3–4 d |
| **M1** | 数据层与模拟 API | Zod schema、数据加载 / 校验 / 合并、静态 API 落盘、dev 中间件、client SDK | `curl dist/api/v1/projects.json` 通 | 4–5 d |
| **M2** | 渲染、路由、插件与主题内核 | hook 引擎、主题解析、路由收集、SSR 预渲染 + Islands 水合、Vite 透传 | 换主题包改变全站外观 | 6–8 d |
| **M3** | 默认主题 `@mineproj/theme-classic` | 大众风格完整 UI：令牌与明暗双模式、卡片、5 类布局、筛选 / 搜索 / 排序、可玩面板 | 人工验收 UI + E2E 交互 | 8–10 d |
| **M4** | 内容管线与富媒体 | Markdown 管线（构建期高亮、零运行时）+ PDF 三级降级预览 + 图片灯箱 + 视频 | 长文 / PDF / 图集可用，且首屏体积不涨 | 7–9 d |
| **M5** | i18n | 路由前缀、字段级覆盖、正文与附件分语言、回退链、`hreflang`、分语言索引 | 中英双语站点完整、切语言不 404 | 4–5 d |
| **M6** | SEO/AI 与官方插件集 | seo/sitemap/llms/mirror/og-image/search/feed/playable/msw/analytics | `audit --seo --ai ≥ 85` | 5–7 d |
| **M7** | 生态工具与脚手架 | create-* 三件套、契约测试、GitHub 导入器、`theme:eject`、`audit` 全量 | 新人 10 分钟建站 | 4–6 d |
| **M8** | 工程化、文档站与发布 | 测试补齐、CI/CD、文档站（dogfooding）、性能预算、v1.0 发布 | v1.0.0 上 npm | 5–7 d |
| **M9** | 可视化编辑器 | Schema 驱动表单、实时预览、Dev / Static / PR 三种 Transport、安全收口、插件字段控件 | 建一个完整项目 ≤ 3 分钟；生产产物无 Editor 代码 | 7–9 d |

**合计约 53–70 个工作日**（单人全职口径）。若为兼职投入，按每周 3 天折算约 4–5 个月。

**并行建议**：M2 完成后，M3（主题 UI）与 M6（插件）可并行；M4 / M5 依赖 M3 的组件层与 M1 的数据层，可与 M6 并行；M8 的文档站建议等 M6 结束后启动（dogfooding 需要功能基本稳定）。

---

## 3. M0 · 地基与内核骨架

**目标**：把"CLI → 解析配置 → 读 JSON → 渲染 HTML → 写入 dist"这条最短路径跑通。此时 UI 极简（无样式裸 HTML），只为验证管线。

| ID | 任务 | 产出物 | 验收标准（AC） | 依赖 | 点 |
|---|---|---|---|---|---|
| M0-01 | 仓库初始化：pnpm workspace、tsconfig base、`.gitattributes`、`LICENSE`(Apache-2.0)、`NOTICE`、`CONTRIBUTING`、`CODE_OF_CONDUCT`、`SECURITY`、DCO | 仓库骨架 | `pnpm install` 成功；`pnpm -r typecheck` 零错误 | — | S |
| M0-02 | 统一工程配置：`@mineproj/tsconfig`、`eslint-config`、`prettier`、`vitest` 共享 preset | `configs/` | 各包继承后 lint/typecheck 通过 | M0-01 | S |
| M0-03 | `@mineproj/schema`：Project / Profile / Tag / Collection / SiteConfig 的 Zod schema 与推导类型 | schema 包 + 单测 | 100% 字段覆盖；非法数据报错带字段名 | M0-01 | M |
| M0-04 | `@mineproj/core` 配置模块：`defineConfig()`、`loadConfig()`（支持 `.ts/.mjs/.json`）、Zod 校验、默认值合并 | core/config | 配置文件写错时报错精确到行 | M0-03 | M |
| M0-05 | `@mineproj/core` Hook 引擎：seq / waterfall / parallel / first 四种语义 + `enforce`/`before`/`after` 三级排序 + 循环依赖检测 | core/hooks + 单测 | 排序正确、循环依赖可读报错 | M0-01 | M |
| M0-06 | `@mineproj/core` 虚拟模块：`virtual:mineproj/config`、`virtual:mineproj/data`、`virtual:mineproj/routes` 的解析与代码生成 | core/virtual | 组件内可 import 且类型可推导 | M0-04 | M |
| M0-07 | `mineproj` CLI 骨架：`dev/build/preview` 命令雏形（基于 Vite JS API），参数解析、日志、错误处理 | packages/mineproj | `mineproj build` 可执行 | M0-04 | M |
| M0-08 | 最小渲染管线：读 `data/projects/**/index.json` → 生成 1 个 `index.html`（裸 HTML 列表）→ 写入 `dist/` | core/render | `python -m http.server` 打开能看到项目名列表 | M0-05/06/07 | L |
| M0-09 | `examples/basic` 示例站点（5 个示例项目 JSON + 封面） | examples/basic | 可被 CLI 构建 | M0-08 | S |
| M0-10 | 冒烟 E2E：Playwright 打开 preview 服务，断言页面含项目名 | tests/e2e | CI 可运行 | M0-09 | S |

**M0 退出标准**：`git clean` 状态下执行 `NODE_OPTIONS="" pnpm install && pnpm build`，`dist/index.html` 中出现 5 个示例项目名；`pnpm test` 全绿。

---

## 4. M1 · 数据层与模拟 API

**目标**：把"JSON 数据"变成可靠、可校验、可查询、可被 `fetch()` 的一等公民。

| ID | 任务 | 产出物 | AC | 依赖 | 点 |
|---|---|---|---|---|---|
| M1-01 | 数据加载器：扫描三种组织形态（单文件 / 一项目一文件 / 目录式）、递归发现、按 slug 去重、冲突检测 | core/data/loader | 重复 slug 报错并指出两个文件路径 | M0-03 | M |
| M1-02 | 数据校验与错误报告：Zod 校验 + 文件级错误定位（`文件:字段: 期望/实际`） | core/data/validate | 错误信息含文件路径与字段路径 | M1-01 | M |
| M1-03 | 资源就近解析：`cover`/`screenshots`/`icon` 相对路径解析 → 纳入 Vite 资源管线 | core/data/assets | 相对路径图片能正确出现在产物 | M1-01 | M |
| M1-04 | 正文与外链：`description` 内联 Markdown 与 `bodyFile` 外链 `body.md` 两种取法，统一输出 `{ markdown, html }` | core/data/body | Markdown 渲染正确、代码高亮可用 | M1-01 | M |
| M1-05 | 语言覆盖合并：`index.<locale>.json` 深度合并到默认语言 | core/data/i18n | 缺失字段回退、多余字段保留 | M1-01 | S |
| M1-06 | 派生数据：标签聚合（含计数）、分类聚合、时间线、统计面板数据 | core/data/derive | 计数准确，空标签不出现 | M1-02 | M |
| M1-07 | ★ **静态 API 生成器**：`defineEndpoint()` 契约 + 端点清单（§6.1 全部端点）+ 统一响应信封 + 落盘 `dist/api/v1/*.json` | core/api + 快照测试 | `curl` 每个端点均返回合法 JSON，字段与 schema 一致 | M1-06 | L |
| M1-08 | ★ **Dev API 中间件**：Vite `configureServer` 挂载同路径路由，支持完整查询参数（`q/tag/category/status/sort/page/pageSize/fields`）+ 可选延迟注入 | core/api/middleware | dev 与 build 对同一请求返回同构响应 | M1-07 | M |
| M1-09 | 查询引擎：过滤 / 多选标签 AND-OR / 排序 / 分页 / 字段投影 / facet 计算 | core/api/query | 单测覆盖边界（空结果、越界页、非法排序字段回退） | M1-07 | L |
| M1-10 | `@mineproj/client` SDK：`createApiClient()`（SWR 语义、内存缓存、超时与错误归一化） | client/api | 无 React 环境可用 | M1-07 | M |
| M1-11 | `@mineproj/client` Hooks：`useProjects/useProject/useTags/useSearch/useStats` | client/hooks | 组件测试覆盖加载/成功/错误三态 | M1-10 | M |
| M1-12 | 查询策略实现：`client`（默认，客户端过滤）/ `hybrid`（预生成热门组合）/ `static` | core/api/strategy | 三种模式各自产出正确产物 | M1-09 | M |
| M1-13 | 数据契约测试：API 响应结构快照（golden file），变更需显式更新快照 | tests/contract | CI 中快照不一致即失败 | M1-07 | S |
| M1-14 | `mineproj check` 命令：数据 + 配置校验，CI 友好非零退出 | cli/check | 故意写错一条数据 → 退出码非 0 且报错可读 | M1-02 | S |

**M1 退出标准**：对 `examples/basic` 执行 build，`dist/api/v1/projects.json` 可被 `curl` 读取且结构符合信封；dev 模式下 `fetch('/api/v1/projects?tag=web&sort=createdAt:desc')` 返回过滤后的正确结果；`mineproj check` 对错误数据报错并退出 1。

---

## 5. M2 · 渲染、路由、插件与主题内核

**目标**：让"主题"与"插件"成为真正可替换的运行时实体——这是整个项目扩展性的支点。

| ID | 任务 | 产出物 | AC | 依赖 | 点 |
|---|---|---|---|---|---|
| M2-01 | 插件契约：`definePlugin()`、`optionsSchema`、形态识别（mineproj 插件 vs 裸 Vite 插件）、简写解析（`'seo'` → `@mineproj/plugin-seo`） | core/plugin | 裸 Vite 插件也能放进 `plugins` 数组并生效 | M0-05 | M |
| M2-02 | 插件注册与排序：`enforce` + `before/after` 拓扑排序、循环检测、插件清单诊断（`mineproj info` 展示） | core/plugin/registry | 顺序可预测、可打印 | M2-01 | M |
| M2-03 | 生命周期钩子接线：`config:resolved` → `data:loaded` → `data:validated` → `routes:collect` → `api:endpoints` → `assets:process` → `render:before` → `emit` → `build:done` | core/pipeline | 每个钩子在管线中真实可被调用 | M2-01 | L |
| M2-04 | 路由收集器：home / list / detail / tag / collection / about / 404 七类路由 + `routes:collect` 钩子允许插件造页 | core/router | 插件新增路由能产出对应 HTML | M1-01 | L |
| M2-05 | 主题解析：npm 包名 → 路径解析（`mineproj-theme-*` 补全、作用域包、本地 `.mineproj/theme/`、内联对象）+ 动态 import + 契约校验 | core/theme/resolve | 四种输入形态均正确解析 | M2-01 | L |
| M2-06 | 主题契约：`defineTheme()`（layouts / components / slots / configSchema / locales / vite / setup）+ `extends` 继承语义 | core/theme/contract | `extends` 后未覆盖的部分仍生效 | M2-05 | M |
| M2-07 | 布局分发与缺失回退：主题缺某布局 → 回退默认主题对应布局，并打印警告 | core/theme/layout | 只实现 home 的迷你主题也能构建 | M2-06 | M |
| M2-08 | 组件注册表与按名覆盖：`components` 注册表 + 用户/插件覆盖 + 未注册组件的构建期告警 | core/theme/registry | 覆盖后生效，覆盖不存在的键告警 | M2-06 | M |
| M2-09 | 插槽系统：命名插槽 + 多消费者按序渲染 + 主题可声明可用插槽清单 | core/theme/slots | 插件往 `card-badge` 插组件能出现在卡片上 | M2-06 | M |
| M2-10 | ★ **SSR 预渲染**：`renderToPipeableStream(..., { onAllReady })`（爬虫/静态生成等全部内容）、逐路由出 HTML、模板注入（head/meta/样式/序列化状态） | core/render/ssr | 100 个页面全部产出且内容完整 | M2-04/07 | L |
| M2-11 | ★ **Islands 水合**：标记交互组件、生成独立 chunk、按需 `hydrateRoot`、SSR 失败降级 `createRoot` | core/render/islands | 内容页交互 JS = 0；首页 ≤ 30KB gzip | M2-10 | L |
| M2-12 | 客户端路由（可选 `spa-fallback` 模式）：预渲染 + 无刷新切换 + `404.html` 回退 | client/router | 直接访问深链不 404 | M2-10 | M |
| M2-13 | Vite 透传通道：插件的 `vite[]` 与主题 `vite{}` 合并进最终 Vite 配置，冲突检测 | core/vite/merge | 装 `vite-plugin-pwa` 之类可直接用 | M2-01 | M |
| M2-14 | 增量构建：内容哈希缓存（数据/主题/配置/模板四维 key），只重渲染受影响页 | core/build/cache | 改 1 个项目后构建时间显著下降 | M2-10 | M |
| M2-15 | 图片管线：多尺寸 webp/avif 生成、`srcset`、显式宽高、LQIP 占位、懒加载 | core/assets/image | 产物含三档尺寸；无 CLS | M1-03 | M |
| M2-16 | 主题契约测试工具：`runThemeContract(theme)`（布局齐全/schema 可解析/令牌齐全/SSR 无副作用） | test-utils | 迷你主题必须能通过 | M2-06 | M |
| M2-17 | 插件契约测试工具：`runPluginContract(plugin)` | test-utils | 同上 | M2-01 | S |

**M2 退出标准**：写一个 30 行的迷你主题 npm 包（仅 `home` 布局 + 一个自定义色），改配置一行即可让全站换成该主题；写一个 20 行插件通过 `api:endpoints` 注册出 `dist/api/v1/hello.json`；`pnpm build` 后内容页交互 JS 为 0。

---

## 6. M3 · 默认主题 `@mineproj/theme-classic`

**目标**：把 §1.3 定下的视觉基线落成真正好用的 UI。默认主题走**中性、克制、国际化**的大众审美（浅色为主 + 深色模式）；借鉴的是内容平台的**浏览效率**，不是任何特定产品的皮肤。这是用户第一眼看到的东西，质量优先。

| ID | 任务 | 产出物 | 验收标准（AC） | 依赖 | 点 |
|---|---|---|---|---|---|
| M3-01 | 设计令牌落地：`--mp-color-*` / `--mp-space-*` / `--mp-radius-*` / `--mp-shadow-*` / `--mp-font-*` 全套变量 + 4 套配色（neutral / slate / warm / showcase）+ 深色模式变量组 + `prefers-reduced-motion` 降级 | theme-classic/tokens.css | 仅改变量即可整体换肤；明暗两套对比度均 ≥ 4.5:1 | M2-06 | M |
| M3-02 | 基础组件层：Button / Tag / SearchBox / Select / Panel / Modal / Tooltip / Skeleton / Pagination / Switch（含 focus-visible 与 aria） | theme-classic/components/base | 组件测试 + 键盘可达 | M3-01 | L |
| M3-03 | ★ **卡片 ProjectCard**：16:9 封面 + 名称 + 标语（2 行截断）+ 标签 pill + 时间；hover 边框高亮 + 阴影抬升 + 封面容器内 `scale(1.03)`（**不改变盒模型**）；角标位；无封面时稳定渐变占位 | theme-classic/components/ProjectCard | 视觉验收 + 交互 E2E + hover 无布局抖动 | M3-02 | L |
| M3-04 | 首页布局：sticky 毛玻璃 Nav + Hero（身份 + 关键数字 + CTA）+ Featured 非对称网格（1 大 2 小）+ 全部项目网格 + 关于 + Footer | theme-classic/layouts/home | 视觉验收；≥1440/1024/768/375 四档断点正常 | M3-03 | L |
| M3-05 | 列表页布局：顶部筛选 chip 条 + 可展开筛选面板 + 排序 + 搜索 + 卡片网格 + 结果计数 + URL query 同步 | theme-classic/layouts/list | 筛选组合可分享、刷新后状态保持、支持 SSR 渲染筛选结果 | M3-03 | L |
| M3-06 | 详情页布局：主列（媒体区 / 正文 / 亮点 / 文档 / 画廊 / 更新日志 / FAQ）+ 右栏 sticky（主按钮组 / 元信息表 / 技术栈 / 标签云 / 统计 / 相关推荐） | theme-classic/layouts/detail | 视觉验收 + 结构化数据字段齐全 | M3-03 | L |
| M3-07 | 标签页 / 合集页 / 关于页 / 404 页布局 | theme-classic/layouts/* | 路由可达、内容正确 | M3-05 | M |
| M3-08 | ★ **PlayableFrame 可玩面板**：懒挂载 iframe、sandbox 策略、加载态 / 超时兜底、全屏、新窗口打开、postMessage 高度自适应、移动端提示 | theme-classic/components/PlayableFrame | 集成测试断言**无** `allow-same-origin`（除非 trusted） | M2-09 | L |
| M3-09 | 搜索交互：`/` 与 `Cmd/Ctrl+K` 打开命令面板、MiniSearch 集成、字段权重排序、结果高亮与分组、无结果态 | theme-classic/components/SearchBox | 搜索延迟 < 50ms（100 项目） | M1-11 | M |
| M3-10 | 筛选面板：分类 × 标签 × 状态 × 平台 × 年份 × 是否可玩 多选、实时生效、"排除已归档"开关、键盘可达、移动端抽屉 | theme-classic/components/TagFilter | 交互 E2E 全覆盖 | M3-05 | L |
| M3-11 | 探索队列：随机 5 个未浏览项目、逐个下一个、localStorage 记录、可跳过 | theme-classic/components/DiscoveryQueue | 交互正常、状态持久化 | M3-04 | M |
| M3-12 | 主题切换：浅色 / 深色 / 跟随系统 + localStorage 记忆 + `<head>` 无闪烁内联脚本 + `ThemeToggle` 组件 | theme-classic/components/ThemeToggle | 首帧无闪白 / 闪黑；刷新后保持 | M3-01 | M |
| M3-13 | 响应式与无障碍收口：四档断点、触控目标 ≥ 44px、对比度 ≥ 4.5:1（明暗两套）、`prefers-reduced-motion`、`aria-*` 补全、键盘全流程可达、skip-to-content | theme-classic | axe 扫描零严重问题；Lighthouse A11y ≥ 95 | M3-04~12 | L |
| M3-14 | 主题配置项落地（`configSchema`）：accent / colorMode / density / contentWidth / palette / cardStyle / heroMode / radius / lightbox / pdf / markdown | theme-classic/config | 每项改动均产生可见且正确的视觉变化 | M3-01 | M |
| M3-15 | 主题契约测试通过 + 组件快照测试 | theme-classic/tests | `runThemeContract` 全绿 | M2-16 | M |

**M3 退出标准**：默认主题四档断点视觉达标；明暗两套对比度全过；Lighthouse A11y ≥ 95；`theme: 'classic'` 与一个社区空主题可互换。

---

## 7. M4 · 内容管线与富媒体

**目标**：让"写 Markdown、放 PDF、贴截图"成为开箱体验，且**不牺牲首屏体积与 SEO**。全部重活放在构建期，运行时按需加载。

| ID | 任务 | 产出物 | 验收标准（AC） | 依赖 | 点 |
|---|---|---|---|---|---|
| M4-01 | Markdown 管线骨架：`@mineproj/markdown` 包，markdown-it + GFM（表格 / 任务列表 / 删除线 / 脚注 / 自动链接）+ front-matter 解析 | markdown/parse | GFM 全项 fixture 通过 | M1-07 | M |
| M4-02 | ★ Shiki 构建期高亮：`createHighlighter` + 明暗双主题 CSS 变量（`--shiki-light/dark`）+ 语言白名单 + `langAlias` + `fallbackLanguage` + `onError` | markdown/highlight | 产物 HTML 中**无**高亮运行时脚本；切换明暗代码配色跟着变且无需重新渲染 | M4-01 | L |
| M4-03 | 标题 slugify（中文按字切分 + 重名去重）+ 锚点 + `toc` 数据（深度可配） | markdown/toc | 中文标题锚点可跳转且唯一 | M4-01 | M |
| M4-04 | 产出 `excerpt`（160 字纯文本）/ `plainText` / `readingTime` / `headings`，供 SEO、搜索索引、Markdown 镜像复用 | markdown/meta | 三处内容同源一致 | M4-01 | M |
| M4-05 | 图片处理：相对路径解析 → 资源管线（480/960/1440/1920 webp+avif）+ LQIP 内联占位 + 显式 `width/height` | markdown/image | 无 CLS；越界路径（`../`）报错 | M4-01 | M |
| M4-06 | 链接处理：站内链接可达性校验 + 外链自动 `rel="noopener noreferrer"` | markdown/link | 死链在 `check` 中告警 | M4-01 | S |
| M4-07 | 安全：默认 `html:false`；显式开启时白名单 sanitize（禁 script / iframe / on* / javascript:） | markdown/sanitize | XSS 向量 fixture 全被过滤 | M4-01 | M |
| M4-08 | 插件扩展点：`md:before-parse` / `md:transformers` / `md:after-render` / `md:toc` | core/hooks | 一个 20 行插件可注册自定义块 | M4-01 | M |
| M4-09 | `Prose` 渲染组件 + 排版样式（标题层级、引用、表格、代码块、图片说明、脚注、打印样式） | theme-classic/components/Prose | 明暗两套排版可读 | M4-02 | M |
| M4-10 | ★ PDF 预览：pdf.js 动态 `import()` + `manualChunks` 独立 chunk + worker `new URL(..., import.meta.url)` + 按页 canvas 渲染 + 虚拟滚动只渲染可见页 | components/PdfViewer | PDF chunk **不出现**在首屏请求；100 页文档流畅翻页 | M3-02 | L |
| M4-11 | PDF 三级降级：L1 自绘 viewer → L2 原生 iframe → L3 封面 + 下载；失败自动降级 | components/PdfViewer | 三条路径各有 E2E 断言 | M4-10 | M |
| M4-12 | PDF 构建期处理：探测 `pages` / `size`、可选抽取首页封面写入 `docs[].cover`（走图片管线） | core/assets | 详情页显示页数与体积；L3 有封面 | M4-10 | M |
| M4-13 | PDF 工具条与无障碍：翻页 / 缩放 / 页内搜索 / 文本层开关、`aria-label`、键盘 `←→ +/-/0/Esc` | components/PdfViewer | 键盘全流程可达 | M4-10 | M |
| M4-14 | ★ 图片灯箱：自研 ≤ 6KB gzip，开 / 关、前后导航、滚轮与双指缩放、拖拽平移、双击 1×↔2×、计数器、caption、缩略图条、±1 预加载 | components/Lightbox | 体积门禁 ≤ 6KB；交互 E2E | M3-02 | L |
| M4-15 | 灯箱无障碍：`role="dialog"` + `aria-modal` + **焦点陷阱** + 关闭后焦点返回 + body 滚动锁定（不跳动）+ `prefers-reduced-motion` | components/Lightbox | axe 零严重；可纯键盘开合 | M4-14 | M |
| M4-16 | 视频与外链媒体：`<video controls preload="metadata" poster>`（禁自动播放）、视频站 facade（点击才加载播放器） | components/MediaFrame | 首屏不加载播放器 | M4-09 | M |

**M4 退出标准**：示例站点含 1 篇 Markdown 长文、2 个 PDF、8 张截图；首页 JS 体积仍满足预算；PDF chunk 未被首屏加载；灯箱可纯键盘操作。

---

## 8. M5 · i18n

**目标**：让多语言成为默认能力而非事后补丁——路由、数据、正文、附件、索引、SEO 六处同时对齐。

| ID | 任务 | 产出物 | 验收标准（AC） | 依赖 | 点 |
|---|---|---|---|---|---|
| M5-01 | locale 配置：`defaultLocale` / `locales` / `fallbackLocale` / `prefixAll`，Zod 校验 | core/i18n | 非法 locale 配置报错 | M0-04 | S |
| M5-02 | 数据层合并：`index.<locale>.json` 与 `i18n.<locale>` 覆盖；对象深度合并、数组整体替换 | core/data | 合并语义单测全绿 | M1-04 | M |
| M5-03 | 回退链 `locale → fallbackLocale → defaultLocale` + 缺失键构建告警 + `--strict-i18n` 升级为 error | core/i18n | 缺失翻译有清单输出 | M5-02 | M |
| M5-04 | 正文分语言：`body.<locale>.md` 解析与回退；缺失时页面**仍生成**并展示提示条 | markdown/i18n | 不产生 404 | M4-01 | M |
| M5-05 | 附件分语言：`docs[].lang` 与 `<basename>.<locale>.pdf` 优先匹配当前语言 | core/data | 英文站显示英文 PDF | M4-12 | S |
| M5-06 | 路由与产物：默认语言无前缀 / 其他语言前缀目录；每页 `<html lang>` + `hreflang`（含 `x-default`） | core/router | 各语言页成对互指 | M2-10 | M |
| M5-07 | `sitemap.xml` 输出全部语言 URL；`llms.txt` 与 Markdown 镜像按语言产出 | plugins/{sitemap,llms,mirror} | 语言版本齐全 | M5-06 | M |
| M5-08 | 搜索索引按语言分片，只下载当前语言 | plugins/search | 索引随语言数线性拆分 | M5-06 | S |
| M5-09 | API 按语言：`?lang=` 与 `/<locale>/api/...` 等价 | core/api | 响应快照一致 | M5-06 | S |
| M5-10 | 主题 UI 字典：`ctx.t()` + 插件命名空间合并 + 插值与 `Intl.PluralRules`；**禁止硬编码 UI 文案** | core/i18n + 主题 | `runThemeContract` 断言通过 | M5-01 | M |
| M5-11 | `LangSwitch` 组件：保留当前路径切换；目标语言无此页时回落该语言首页并提示 | 主题组件 | 切换不 404 | M5-06 | S |
| M5-12 | RTL 预留：`dir` 由 locale 推导；布局与令牌用逻辑属性（`margin-inline` 等） | 主题 tokens | `dir=rtl` 下无错位 | M5-06 | S |
| M5-13 | CLI：`check --i18n`（覆盖率报告）、`i18n:extract`（抽取待翻译键）、`i18n:init <locale>` | packages/mineproj | 三条命令可用 | M5-03 | M |

**M5 退出标准**：示例站点中英双语完整；`hreflang` 成对；切语言不丢页面；`check --i18n` 输出可读报告。

---

## 9. M6 · SEO/AI 与官方插件集

**目标**：把"SEO 友好、AI 友好"从设计意图变成构建产物里的具体文件，并验证 `audit` 可打分。

| ID | 任务 | 产出物 | AC | 依赖 | 点 |
|---|---|---|---|---|---|
| M6-01 | `plugin-seo`：title / meta description / canonical / OG / Twitter Card / `html lang` / `noindex` 支持 | plugins/seo | 每个页面 head 完整；字段优先级（项目 seo 覆盖 > summary > 站点默认）正确 | M2-03 | M |
| M6-02 | `plugin-seo` JSON-LD：Person / WebSite(+SearchAction) / CollectionPage / ItemList / SoftwareSourceCode / SoftwareApplication / CreativeWork / BreadcrumbList / FAQPage，XSS 安全序列化 | plugins/seo/jsonld | 用 schema.org 校验器抽查通过；`<!--` 与 `<` 已转义 | M6-01 | L |
| M6-03 | `plugin-sitemap`：`sitemap.xml`（含 lastmod、图片扩展）+ **`sitemap.md`** | plugins/sitemap | XML 可被 Google Search Console 校验；md 结构对应站点层级 | M2-03 | M |
| M6-04 | `plugin-llms`：`llms.txt`（10–30 条分组链接 + 一句话描述，`text/plain`）+ `llms-full.txt` + **`AGENTS.md`** | plugins/llms | 文件非空、结构合规、可被 `curl -I` 验证 MIME | M2-03 | M |
| M6-05 | `plugin-markdown-mirror`：每页产出 `index.md`，HTML 注入 `<link rel="alternate" type="text/markdown">`，提供 `md-mirror:before` 钩子 | plugins/markdown-mirror | 每个 HTML 有对应 md；md 内容去噪（无导航/页脚） | M2-03 | M |
| M6-06 | `plugin-og-image`：satori + resvg 构建期生成 1200×630 PNG（含项目名、标语、标签、封面），支持中文字体嵌入 | plugins/og-image | 产物存在且可被 OG 调试器读取 | M2-03 | L |
| M6-07 | `plugin-search`：MiniSearch 分片索引构建（按语言/首字母分桶）+ 按片按需加载 | plugins/search | 100 项目索引总量 ≤ 300KB；首屏只加载首片 | M1-09 | M |
| M6-08 | `plugin-feed`：RSS 2.0 + Atom + JSON Feed | plugins/feed | 三种格式均可被阅读器解析 | M2-03 | S |
| M6-09 | `plugin-playable`：demo 目录复制、sandbox 策略集中配置、requirements 校验（构建期检查 entry 是否存在） | plugins/playable | entry 缺失时构建报错 | M3-08 | M |
| M6-10 | `plugin-msw`（可选）：Service Worker 层动态 mock，支持 POST / 延迟 / 错误注入，生产可关 | plugins/msw | 开启后 `POST /api/v1/like` 可用；关闭后无副作用 | M1-08 | M |
| M6-11 | `plugin-analytics`：Umami / Plausible / GA 适配 + 事件（曝光/卡片点击/试用启动/外链点击）+ 隐私开关 | plugins/analytics | 事件正确上报；Do Not Track 时禁用 | M2-03 | S |
| M6-12 | `plugin-i18n`：多语言路由（`/<locale>/`）、`hreflang` + `x-default`、语言切换器 | plugins/i18n | 每种语言均有完整路由树；hreflang 双向一致 | M2-04 | L |
| M6-13 | ★ `mineproj audit`：seo / ai / a11y / perf 四类检查项 + 0–100 评分 + `--fail-under=N` + 表格化报告 | cli/audit | 对示例站点评分 ≥ 85；故意破坏某项能检出 | M6-01~05 | L |
| M6-14 | `plugin-pwa`：透传 `vite-plugin-pwa` 的薄封装（验证透传通道好用） | plugins/pwa | 装了就有 manifest + SW | M2-13 | S |

**M6 退出标准**：`examples/basic` 构建后 `dist/` 含 `sitemap.xml`、`sitemap.md`、`robots.txt`、`llms.txt`、`llms-full.txt`、`AGENTS.md`、每页 `.md` 镜像、`og/*.png`、`feed.xml/json`；`mineproj audit --seo --ai --fail-under=85` 通过；JSON-LD 经在线校验器无错误。

---

## 10. M7 · 生态工具与脚手架

**目标**：把"二次开发友好"变成可复制的模板与自动化，降低社区参与门槛。

| ID | 任务 | 产出物 | AC | 依赖 | 点 |
|---|---|---|---|---|---|
| M7-01 | `create-mineproj`：交互式脚手架（模板选择 basic/minimal、包管理器、主题、是否 git init、是否装依赖） | packages/create-mineproj | `npm create mineproj@latest` 一路回车可跑 | M6 全部 | M |
| M7-02 | `@mineproj/create-theme`：主题包模板（含契约骨架、令牌、示例布局、契约测试、发布配置） | packages/create-theme | 生成即可 `pnpm build` 并通过契约测试 | M2-16 | M |
| M7-03 | `@mineproj/create-plugin`：插件包模板（含 10 类钩子示例、optionsSchema、测试） | packages/create-plugin | 同上 | M2-17 | M |
| M7-04 | ★ `mineproj theme:eject`：把当前主题源码完整复制到 `.mineproj/theme/` 并改写配置引用，保证可深度定制且可继续升级内核 | cli/theme-eject | 弹出后构建结果与弹出前一致 | M2-05 | M |
| M7-05 | ★ `mineproj import github`：调 GitHub API 批量导入仓库 → 生成项目 JSON（name/summary/createdAt/license/stars/links/topics→tags），支持 `--dry-run` 与增量更新 | plugins/github-import | 导入 30 个仓库生成合法数据，可再编辑 | M1-14 | L |
| M7-06 | `mineproj new <slug>`：创建项目骨架（目录 + 模板 JSON + 占位封面 + 空 body.md） | cli/new | 生成后 `check` 通过 | M1-14 | S |
| M7-07 | `mineproj migrate`：schema 版本检测 + 数据迁移（前向兼容 + 备份） | cli/migrate | 旧版数据可迁到新版 | M0-03 | M |
| M7-08 | `mineproj doctor` / `info`：环境（Node/pnpm）、配置、主题、插件、端口、依赖冲突诊断 | cli/doctor | 常见错误能给出可操作建议 | M2-02 | S |
| M7-09 | JSON Schema 导出：`.mineproj/schema.json` + 自动生成 `.vscode/settings.json` 映射（字段补全与悬浮文档） | core/schema/export | VSCode 中编辑 JSON 有补全 | M0-03 | S |
| M7-10 | `THEMES.md` / `PLUGINS.md` 生态索引 + 收录 PR 流程 | 仓库文档 | 索引表结构清晰 | M7-02/03 | S |
| M7-11 | 第二个官方主题 `@mineproj/theme-gallery`（深色沉浸式，验证契约表达力足够） | theme-gallery | 与 theme-classic 走同一契约，切换无适配代码 | M2-16 | L |
| M7-12 | `templates/minimal`、`templates/showcase` 两个 starter 模板 | templates/ | 可被 create 脚手架使用 | M7-01 | S |

**M7 退出标准**：在一台干净机器上执行 `npm create mineproj@latest` → 一路默认 → `pnpm dev`，10 分钟内看到可浏览的站点；执行 `pnpm create-theme` 生成的空主题能通过契约测试；`theme-gallery` 与 `theme-classic` 只靠改配置即可互换。

---

## 11. M8 · 工程化、文档站与发布

**目标**：让项目可被他人信任地使用、贡献和依赖。

| ID | 任务 | 产出物 | AC | 依赖 | 点 |
|---|---|---|---|---|---|
| M8-01 | 测试补齐：core/client ≥ 85%、主题 ≥ 60%、插件 ≥ 75% 行覆盖 | 全仓库 | `pnpm test:cov` 达标并有覆盖率报告 | M7 | L |
| M8-02 | E2E 补齐：无 JS 可读、筛选、搜索、深链、可玩 iframe、i18n 切换、404 | tests/e2e | 全部通过 | M7 | M |
| M8-03 | 视觉回归（可选）：Playwright 截图对比，关键页面基线快照 | tests/visual | 有意改动需显式更新基线 | M8-02 | M |
| M8-04 | 性能基准：100 项目构建时间基准 + `hyperfine` 脚本 + 回归告警 | bench/ | 记录基线数字；增量构建显著更快 | M8-01 | S |
| M8-05 | CI `ci.yml`：install → lint → typecheck → unit → contract → build → e2e → lighthouse → audit | .github/workflows | PR 全绿才允许合并 | M8-02 | M |
| M8-06 | CI 矩阵：Node 22/24 × Windows/Linux/macOS | .github/workflows | 三平台构建产物一致 | M8-05 | M |
| M8-07 | 版本与发布：changesets 接入、`beta`/`latest` tag、CHANGELOG 自动生成 | .changeset | 版本号与变更匹配 | M8-05 | S |
| M8-08 | Release 流水线：tag 触发 → 构建 → npm publish（provenance）→ GitHub Release（`.tar.gz` + `.asc` + `.sha512`） | .github/workflows/release.yml | 产物可校验签名与哈希 | M8-07 | M |
| M8-09 | 安全：CodeQL / `pnpm audit` 门禁 / 依赖自动更新（Dependabot） | .github/ | 高危漏洞阻断合并 | M8-05 | S |
| M8-10 | ★ **文档站**（用 mineproj 自身构建，dogfooding）：快速上手、配置参考、数据模型、主题开发、插件开发、API 参考、部署指南、FAQ | docs/ | 文档站自身 `audit --seo --ai ≥ 85` | M7 | L |
| M8-11 | README：一句话定位 + 30 秒演示 GIF + 特性表 + 快速上手 + 生态索引 | README.md | 新人读完能建站 | M8-10 | S |
| M8-12 | 部署文档与模板：GitHub Pages / Cloudflare Pages / Netlify / Vercel / Nginx 五份 | docs/deploy | 每份都实测通过 | M7 | M |
| M8-13 | v1.0.0 发布检查清单（法务、品牌、文档、产物、公告） | RELEASE-CHECKLIST.md | 全部勾选项完成 | M8-08/10 | S |
| M8-14 | 社区就绪：Issue 模板、PR 模板、Discussions 分类、路线图公开 | .github/ | 模板可用 | M8-10 | S |

**M8 退出标准**：`main` 分支 CI 全绿；`v1.0.0` 已发布到 npm 且 GitHub Release 含签名与校验和；文档站上线且自身 audit 达标；README 与部署文档经一名未参与开发的人验证可独立完成建站。

---

## 12. M9 · 可视化编辑器

**目标**：把「手写 JSON」变成「可视化填表 + 实时预览」，让非技术协作者也能维护内容。对应 [《产品技术方案》](./) §21。

**铁律**：Editor 是全项目唯一具备写能力的部分，默认不进生产产物；任何写操作必须可预测、可回退、可审计。

| ID | 任务 | 产出 | 验收 | 依赖 | 估点 |
|---|---|---|---|---|---|
| M9-01 | `@mineproj/editor` 包骨架：独立依赖（react-hook-form 或自研极简表单态），与 `core` 单向依赖，可被 tree-shake | packages/editor | `core` 中不出现任何 editor 引用 | M2-16 | M |
| M9-02 | ★ **Schema → 表单描述生成器** `describeFields(schema)`：读取 Zod `.meta()`（label/help/group/order/widget/visibleIf）产出 `FormDescriptor[]` | editor/describe | 字段覆盖率 100%（schema 有 meta 的字段全部出现在表单） | M1-02 | L |
| M9-03 | 字段控件注册表 `fieldControls` + 内置控件：text / textarea / number / switch / date / url / select / tags | editor/controls | 控件单测 + 键盘可达 | M9-01 | L |
| M9-04 | Markdown 字段控件：编辑 + 预览双栏，预览复用 §12 渲染管线（含 Shiki 高亮），所见即所得 | editor/controls/MarkdownField | 预览样式与生产详情页一致 | M9-03, M4-05 | M |
| M9-05 | Media 字段控件：本地上传 → 内容 hash 去重 → 写入 `public/media/<hash>.<ext>` → 回填相对路径；支持从已有媒体库选择 | editor/controls/MediaField | 重复上传同一文件不产生第二份拷贝 | M9-03 | L |
| M9-06 | 项目编辑表单：基础字段按 `group` 分组折叠、`highlights` 拖拽排序、必填与长度校验落字段级 | editor/ProjectForm | E2E：填错有字段级提示且不阻塞其他字段 | M9-02, M9-03 | L |
| M9-07 | 媒体与附件编辑：`cover` / `gallery` / `docs` 的增删改排序，PDF 附件带页数与体积回填 | editor/MediaPanel | 与 §5 `docs[]` schema 一致 | M9-05 | M |
| M9-08 | i18n 字段编辑：顶部语言切换、未翻译字段显示回退值 +「缺失」徽标、覆盖率进度条 | editor/I18nBar | 复用 §13 覆盖率算法，数字一致 | M5-02 | M |
| M9-09 | 项目列表管理：搜索 / 新建 / 复制 / 删除 / 拖拽排序 / 批量改标签 | editor/ProjectList | 删除有二次确认 + 可撤销 | M9-02 | M |
| M9-10 | 草稿与 diff：内存 draft + `localStorage` 兜底，保存前逐字段 diff 视图，关页拦截确认 | editor/draft | 刷新页面草稿不丢 | M9-06 | M |
| M9-11 | ★ **FsTransport**：Node 侧回写 `content/`，路径白名单（`content/`、`public/media/`），拒绝 `..` 与绝对路径，写前备份到 `.mineproj/backup/` | editor/transport/fs | 单测覆盖越界路径；集成测试校验 git diff 干净 | M9-06 | L |
| M9-12 | ★ **实时预览**：右侧 iframe 指向 `/projects/<slug>`，保存后走 HMR 增量刷新、不整页重载，滚动位置保持 | editor/PreviewPane | 人工验证；保存 → 预览 ≤ 800ms | M9-11 | M |
| M9-13 | Static Editor：`MemoryTransport` + 导出 `.mineproj-draft.json` / JSON Patch 下载，配套 `mineproj editor:export` | editor/transport/memory | 导出的 draft 可被 `editor:export` 正确合并 | M9-11 | M |
| M9-14 | PR Editor：`GitHubTransport` + OAuth（`public_repo` 最小权限）+ Contents API 开 PR；token 仅存内存与 `sessionStorage` | editor/transport/github | 沙箱仓库端到端跑通一次 PR | M9-11 | L |
| M9-15 | ★ **安全收口**：`editor.enabled` 默认 false；Dev Editor 只绑 `127.0.0.1`；上传三重校验（扩展名 + MIME + 内容嗅探）+ 单文件 ≤ 10MB + SVG 净化；写接口校验 `Origin` 与一次性 token | editor/security | E2E：生产产物无 Editor chunk；越界写入被拒 | M9-11~14 | L |
| M9-16 | 插件扩展点：`registerFieldControl()` + 四个 hook（`editor:field:render` / `beforeSave` / `afterSave` / `transport`）；主题可覆盖 `editor-shell` 插槽 | editor/plugins | 20 行插件可替换一个字段控件 | M9-03 | M |
| M9-17 | E2E：创建项目全流程（封面 + 3 截图 + 正文 + 2 标签）≤ 3 分钟；校验错误可见；导出可导入 | editor/e2e | Playwright 全流程通过 | M9-06, M9-12 | M |
| M9-18 | CLI：`mineproj dev --editor`（含醒目安全提示）、`mineproj editor:export`；`editor` 配置项 schema 与文档 | packages/mineproj | `--help` 与配置校验通过 | M9-13 | S |

---

## 13. WBS 总表

| 里程碑 | 任务数 | 估点合计（≈人日） | 关键路径任务 |
|---|---|---|---|
| M0 地基与内核骨架 | 10 | 4.5 | M0-08 最小渲染管线 |
| M1 数据层与模拟 API | 14 | 9 | M1-07 静态 API 生成器 → M1-09 查询引擎 |
| M2 渲染·路由·插件·主题内核 | 17 | 15 | M2-05 主题解析 → M2-10 SSR → M2-11 Islands |
| M3 默认主题 theme-classic | 15 | 17 | M3-03 卡片 → M3-04/05/06 三大布局 → M3-13 无障碍收口 |
| M4 内容管线与富媒体 | 16 | 18 | M4-02 Shiki 高亮 → M4-10 PDF → M4-14 灯箱 |
| M5 i18n | 13 | 10 | M5-02 数据合并 → M5-06 路由与 hreflang |
| M6 SEO/AI 与官方插件 | 14 | 11.5 | M6-02 JSON-LD → M6-13 audit |
| M7 生态工具与脚手架 | 12 | 8 | M7-04 theme:eject、M7-05 GitHub 导入 |
| M8 工程化·文档·发布 | 14 | 10 | M8-05 CI → M8-10 文档站 |
| M9 可视化编辑器 | 18 | 18 | M9-03 字段控件 → M9-11 FsTransport → M9-15 安全收口 |
| **合计** | **143** | **≈ 121 人日**（含缓冲，对应 §2 的 53–70 自然日全职 + 并行与返工） | |

> 估点口径：S=0.5d，M=1d，L=2d，XL=4d。表中为加权合计，已含 20% 缓冲。

---

## 14. 测试策略

| 层级 | 工具 | 范围 | 目标 |
|---|---|---|---|
| **单元** | Vitest | core（config / data / hooks / api 生成 / 查询引擎）、client（SDK / hooks） | 覆盖率 ≥ 85% |
| **契约** | Vitest + golden file | ① 主题契约 `runThemeContract` ② 插件契约 `runPluginContract` ③ **API 响应快照** | 三套契约 CI 强制 |
| **组件** | Vitest + RTL + jsdom | 主题组件、client hooks 三态（loading/success/error） | 关键交互全覆盖 |
| **集成** | Vitest（Node） | 对 fixture 站点跑完整 build，断言产物文件树、HTML 关键内容、API JSON 结构 | 每里程碑 ≥ 1 套 |
| **E2E** | Playwright（Chromium） | 真实浏览器：无 JS 可读、筛选、搜索、深链、可玩 iframe、**PDF 三级降级**、**灯箱键盘**、**Markdown 正文**、**语言切换**、**编辑器创建项目全流程**、404 | 关键路径全覆盖 |
| **视觉** | Playwright 截图对比 | 首页 / 列表 / 详情 / 详情（移动端）四张基线 × 明暗两套 |
| **性能** | Lighthouse CI + 构建计时 | 四指标门禁 + 100 项目构建基准 | CI 门禁 |
| **安全** | CodeQL + `pnpm audit` + 自定义断言 | 依赖漏洞；**iframe `allow-same-origin` 断言**；JSON-LD 转义断言 | 高危阻断 |

**关键回归断言（必须存在）**：
1. 内容页交互 JS 体积 = 0
2. 详情页可玩 iframe 的 `sandbox` **不含** `allow-same-origin`（除非 `trusted: true`）
3. 每个 HTML 页存在同名 `.md` 镜像
4. API 响应信封结构与快照一致
5. JSON-LD 中不含未转义的 `<`
6. 主题契约测试对所有官方主题通过
7. PDF chunk **不出现**在任何页面的首屏请求列表
8. 页面 JS 体积不随 Markdown 代码块数量增长（高亮在构建期完成）
9. 灯箱可纯键盘开关，关闭后焦点回到触发元素
10. 多语言页 `hreflang` 成对互指，切换语言不产生 404
11. 生产产物（默认配置）中不含任何 Editor 代码
12. Editor 越界写入（如 `../../`）被 FsTransport 拒绝

---

## 15. CI/CD 与质量门禁

### 12.1 流水线

```
PR 触发 → ci.yml
  ├ setup（pnpm + Node 矩阵 22/24）
  ├ lint（eslint + prettier --check）
  ├ typecheck（pnpm -r typecheck）
  ├ unit + contract（vitest run --coverage）
  ├ build（examples/basic + examples/showcase）
  ├ e2e（playwright，对 preview 服务）
  ├ audit（mineproj audit --seo --ai --fail-under=85）
  └ lighthouse-ci（perf/a11y/bp/seo 四项预算）

push main → changesets/action → 开 Release PR → 合并/打 tag
tag 触发 → release.yml
  ├ build（tsdown，含 dts）
  ├ npm publish --provenance（tag: latest | beta）
  └ GitHub Release（.tar.gz + .asc + .sha512 + CHANGELOG 片段）
```

### 12.2 门禁清单

| 门禁 | 阈值 | 阻断？ |
|---|---|---|
| lint / typecheck | 零错误 | ✅ |
| 单元测试 | 全通过 | ✅ |
| 契约测试 | 全通过 | ✅ |
| 覆盖率 | core/client ≥ 85% | ✅ |
| E2E | 全通过 | ✅ |
| `audit --seo --ai` | ≥ 85 | ✅ |
| Lighthouse | P/A/BP ≥ 95，SEO = 100 | ✅ |
| 首屏交互 JS | 内容页 0KB；首页 ≤ 30KB gzip | ✅ |
| 构建时间 | 100 项目 ≤ 10s | ⚠️ 告警 |
| `pnpm audit` | 无 high/critical | ✅ |

### 12.3 分支保护

`main` 要求：CI 全绿 + 至少 1 人 review（单人开发阶段可自审，但 PR 描述必须含验收清单）+ DCO 签署 + 线性历史。

### 12.4 中文文件编码校验脚本（本机专用）

写入含中文的源码/文档后，执行：

```python
# scripts/check-encoding.py —— 中文文件编码校验
# 注意：脚本内一律使用 \u 转义表示中文，避免 shell 传递中文字面量时的编码不确定性
import sys

SAMPLE = '\u9879\u76ee\u5e93'   # 关键中文样本："项目库"

for p in sys.argv[1:]:
    raw = open(p, 'rb').read()
    raw.decode('utf-8')                          # 能解码即说明没有 GBK 字节混入
    assert SAMPLE.encode('utf-8') in raw, p      # 关键中文确实以 UTF-8 形态存在
    assert b'\r\n' not in raw, p                 # 行尾统一 LF（.bat/.cmd 除外）
    print('OK', p, len(raw), 'bytes')
```

判定依据：GBK 编码的中文双字节序列不是合法 UTF-8，因此**只要 `decode('utf-8')` 不抛错，就等价于"无 GBK 乱码混入"**——比字面量匹配 mojibake 字符串更严谨，也不依赖 shell 的中文传递。

用法：`python scripts/check-encoding.py path/to/file.md`（Windows 下建议写成脚本文件执行，而不是 `python -c "..."`，后者经过 shell 传参时中文可能被改写）。

建议同时在 CI 中对 `**/*.{ts,tsx,md,json}` 全量跑一遍等价的 Node 脚本 `scripts/check-encoding.mjs`。

---

## 16. 发布与版本策略

| 项 | 策略 |
|---|---|
| 版本规范 | SemVer；`0.x` 阶段允许 minor 破坏性变更（并在 CHANGELOG 显著标注） |
| 变更管理 | **changesets**：每个 PR 附 `.changeset/*.md`，Release PR 自动聚合版本与 CHANGELOG |
| npm tag | `latest`（稳定）/ `beta`（预发布）/ `next`（实验） |
| 包发布顺序 | `schema → core → client → test-utils → theme-classic → plugins → mineproj(CLI)`（拓扑序，CI 自动推导） |
| 版本对齐 | 官方包统一同版本号（fixed 模式），社区包独立 |
| 发布产物 | npm 包 + GitHub Release（源码 `.tar.gz` + GPG `.asc` + `SHA512` 校验和，对齐 ASF source release 惯例） |
| 兼容性承诺 | v1.0 起：主题契约与插件钩子的**破坏性变更需走 major 版本**，并提供至少 1 个 minor 版本的弃用警告期 |

---

## 17. 风险登记表

| ID | 风险 | 触发信号 | 应对动作 | 责任阶段 |
|---|---|---|---|---|
| R1 | 自建 SSG 内核工作量失控 | M2 实际耗时 > 2 倍预估 | 砍掉 `spa-fallback` 与增量构建（M2-12/14）到 v1.1；渲染降级为全量 `renderToStaticMarkup` | M2 |
| R2 | Islands 水合方案复杂度过高 | M2-11 超过 3 天未收敛 | 降级为"整页 hydrateRoot + 组件级 lazy"，先保功能；性能预算放宽到 60KB 并记录 | M2 |
| R3 | 中文 OG 图字体嵌入体积爆炸 | 产物 OG 图生成 > 5s 或字体 > 10MB | 改用子集化字体；或改为仅对拉丁字符渲染 + 中文走预生成模板 | M6 |
| R4 | 静态 API 表达力不足（真实需求出现 POST / 真服务端分页） | M6 阶段出现无法满足的用例 | 明确边界并文档化；提供 MSW 插件 + 可选的"边缘函数适配器"示例（Cloudflare Worker / Netlify Edge）作为进阶路径 | M6 |
| R5 | `allow-same-origin` 误用 | 回归断言 #2 失败 | 构建期硬阻断（除非 `trusted`）；文档红字警告 | M3 起 |
| R6 | Zod 4 破坏性变更踩坑 | schema 升级报错 | 全部 schema 集中在 `@mineproj/schema` 单包，迁移面可控 | M0 |
| R7 | Vite 大版本升级破坏 SSR API | `vite` 主版本更新后构建失败 | 锁定 minor；CI 有 `vite@latest` 的 weekly 探测 job（不阻断） | 全周期 |
| R8 | 主题视觉不达预期（用户高标准） | M3 评审被否 | 预留一轮返工（约 3d）；先出高保真静态稿再编码 | M3 |
| R9 | 文档站 dogfooding 暴露契约缺口 | 文档站开发受阻 | 视为高价值反馈，补契约而非开后门 | M8 |
| R10 | ASF 商标/品牌误用 | 文档或 README 出现"Apache mineproj" | 发布前合规检查项；统一表述为"Apache-2.0 许可的 mineproj" | M8 |
| R11 | pdf.js 体积击穿首屏预算 | Lighthouse 预算失败或 PDF chunk 进首屏 | 强制 `manualChunks` + 动态 import；E2E 断言首屏请求列表无 PDF chunk；必要时默认降级为 L2（原生 iframe） | M4 |
| R12 | Markdown 渲染拖慢构建（大量代码块） | 100 项目构建 > 20s | Shiki 高亮结果按内容 hash 缓存到 `.mineproj/cache/md-*`；收紧语言白名单 | M4 |
| R13 | i18n 翻译维护成本随项目数线性增长 | `check --i18n` 覆盖率持续 < 60% | 允许部分翻译（缺失回退 + 提示条）；提供 `i18n:init` 批量骨架与机器翻译导入位 | M5 |
| R14 | Editor 代码混入生产产物 | 线上多出几百 KB 且暴露写接口 | `editor.enabled` 默认 false；Editor 独立 chunk；CI 断言产物中无 Editor 标记字符串 | M9 |
| R15 | Editor 写回破坏用户源文件 | 用户 `content/` 被覆盖且无备份 | FsTransport 路径白名单 + 写前备份 `.mineproj/backup/` + 保存前强制 diff 预览 | M9 |

---

## 18. Definition of Done（每个任务）

一个 `M*-NN` 任务只有在以下全部满足时才可标记完成并 commit：

- [ ] **功能**：实现满足该任务的全部验收标准（AC）
- [ ] **类型**：新增/修改的公开接口有完整 TypeScript 类型，无 `any`（确有必要时用 `unknown` + 收窄）
- [ ] **测试**：单元/契约/组件测试覆盖新增逻辑；涉及产物形态的补集成断言
- [ ] **文档**：公开 API 有 JSDoc；用户可见变更同步更新 `docs/`（M8 前至少更新对应 README/注释）
- [ ] **编码**：中文文件通过 §12.4 的 UTF-8 校验；行尾为 LF
- [ ] **质量**：`pnpm lint` 与 `pnpm typecheck` 零错误
- [ ] **演示**：能用 `examples/basic` 实际跑出可观察的效果（UI 任务附截图）
- [ ] **提交**：`git commit -s`，英文 Conventional Commits 格式，一条任务一次提交
- [ ] **CI**：推送后 CI 全绿

---

## 19. 立即可执行的第一步（M0 开工清单）

评审通过后，按以下顺序启动（预计 30 分钟内完成环境就绪）：

```bash
# 1. 环境校验
node -v                 # 需 ≥ 22.12
corepack enable && corepack prepare pnpm@latest --activate
pnpm -v                 # 需 10.x

# 2. 仓库地基（M0-01）
cd /g/GitHub/mineproj
git init -b main
pnpm init
# 写 pnpm-workspace.yaml / tsconfig.base.json / .gitattributes
# 写 LICENSE(Apache-2.0) / NOTICE / CONTRIBUTING.md / CODE_OF_CONDUCT.md / SECURITY.md

# 3. 包骨架（M0-02 ~ M0-04）
# packages/{schema,core,client,markdown,mineproj,theme-classic}

# 4. 首次安装与校验
NODE_OPTIONS="" pnpm install
NODE_OPTIONS="" pnpm -r typecheck
```

随后进入 **M0-03（Zod schema）→ M0-08（最小渲染管线）→ M0-10（冒烟 E2E）** 的主线，跑通第一条端到端链路后再向 M1 推进。

---

## 20. 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-09-03 | v1.0 | 初稿：基于 `plan.md` 拆解 M0–M6 共 95 项任务，含 WBS、测试策略、CI、发布策略与风险登记 |
| 2026-09-03 | v1.1 | 默认主题改为 `@mineproj/theme-classic`（大众视觉风格，去品牌化）；第二个官方主题改名 `@mineproj/theme-gallery` |
| 2026-09-03 | v1.2 | 新增 **M4 内容管线与富媒体**（16 项）与 **M5 i18n**（13 项），原 M4/M5 顺延为 M6/M7；新增 **M9 可视化编辑器**（18 项）；里程碑扩至 M0–M9；WBS 合计 143 项 ≈ 121 人日；新增风险 R11–R15 与回归断言 7–12 |

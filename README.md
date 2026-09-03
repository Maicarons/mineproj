# mineproj

> Apache-2.0 许可的、纯前端部署的个人项目展示静态站点生成器。

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-VitePress-8A2BE2)](docs/index.md)

**mineproj** 把你的作品组织成一个**项目库（Project Library）**：卡片网格、标签筛选、即时搜索、悬停预览、详情页内嵌可玩 Demo 与富媒体预览（PDF / 图片 / 视频）。全部内容由 **JSON + Markdown** 驱动，无需后端；构建产物是一份纯静态目录，同时输出一套可直接 `fetch()` 的静态 API 端点（`/api/v1/*.json`）。

> ⚠️ 状态：**规划阶段**。当前仓库包含产品技术方案、开发计划与项目骨架；实现按 `docs/plan/development.md` 中的里程碑（M0–M9）推进。

## 特性

- **纯前端部署**：零后端，构建产物为纯静态目录，可直接托管到任意静态服务器或 GitHub Pages。
- **主题即 npm 包**：默认主题 `@mineproj/theme-classic` 自身也是 npm 包，与第三方主题走完全相同的解析路径（dogfooding，防止契约腐化）。
- **插件双形态**：mineproj 生命周期钩子 + 原生 Vite 插件透传，直接复用整个 Vite/Rollup/unplugin 生态。
- **Markdown 内容管线**：GFM + Shiki 构建期高亮（零运行时）+ 数学/图表 + 目录 + 摘录 + 安全净化。
- **富媒体预览**：PDF 内嵌阅读器（pdf.js 按需懒加载 + 三级降级）、图片灯箱（缩放/平移/键盘/网格切换）。
- **可视化编辑器**（M9）：把「手写 JSON」变成「可视化填表 + 实时预览」，非技术协作者也能维护内容。
- **i18n 一等公民**：路由前缀 + 字段级覆盖 + Markdown 分语言 + 回退链 + `hreflang`。
- **SEO / AI 友好**：JSON-LD、sitemap、`robots.txt` 放行 AI 爬虫、`llms.txt`、Markdown 镜像页、`AGENTS.md`、`audit --seo --ai` 自检。

## 仓库结构

```
mineproj/
├─ packages/            # pnpm workspace：内核、CLI、默认主题、插件
├─ content/             # 使用者数据（JSON + Markdown + 资源），由 CLI 消费
├─ docs/                # VitePress 文档站（产品技术方案 + 开发计划 + 指南）
├─ skills/              # 面向 AI 的项目使用说明
├─ .github/             # 工作流、Issue/PR 模板、CODEOWNERS
├─ scripts/             # 编码校验等辅助脚本
└─ README.md / LICENSE / NOTICE / CONTRIBUTING …
```

## 文档

- [产品技术方案](docs/plan/index.md) —— 做什么、为什么这么做
- [开发计划](docs/plan/development.md) —— 按什么顺序做、每步做到什么程度算完成
- [快速开始（文档站本地运行）](docs/guide/getting-started.md)

## 快速开始（文档站）

```bash
cd docs
npm install
npm run docs:dev      # 开发预览 http://localhost:5173
npm run docs:build    # 产出 docs/.vitepress/dist
```

## 参与贡献

详见 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。核心约定：**一条任务 = 一次提交**、**契约先于实现**、**默认主题即契约验证器**。

## 许可证

[Apache-2.0](LICENSE)。未成为正式 ASF 项目前，不得使用 Apache 商标或羽毛标识。

# mineproj

> Apache-2.0 许可的、纯前端部署的个人项目展示静态站点生成器。

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![CI](https://github.com/maicarons/mineproj/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-412%20passed-brightgreen)
![Status](https://img.shields.io/badge/milestones-M0–M9%20100%25-green)

**mineproj** 把你的作品组织成一个**项目库（Project Library）**：卡片网格、标签筛选、即时搜索、悬停预览、详情页内嵌可玩 Demo 与富媒体预览（PDF / 图片 / 视频）。全部内容由 **JSON + Markdown** 驱动，无需后端；构建产物是一份纯静态目录，同时输出一套可直接 `fetch()` 的静态 API 端点（`/api/v1/*.json`）。

## 快速开始

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

## 功能特性

- **零后端** — 纯静态输出，可部署至 GitHub Pages / Netlify / Vercel / Cloudflare / Nginx
- **主题即包** — `@mineproj/theme-classic`（默认）和 `@mineproj/theme-gallery`（深色沉浸式）皆为 npm 包，一行配置即可切换
- **插件系统** — mineproj 生命周期钩子 + 原生 Vite 插件透传
- **Markdown 管线** — GFM + Shiki 构建期高亮（零运行时 JS）、目录、摘要、安全过滤
- **富媒体** — PDF 预览（pdfjs 懒加载、三级降级）、灯箱（缩放/平移/焦点锁定）、视频外壳
- **国际化** — 路由前缀、字段级覆盖、多语言 Markdown、回退链、hreflang、RTL 支持
- **SEO / AI 就绪** — JSON-LD、站点地图、`llms.txt`、`AGENTS.md`、Markdown 镜像、`audit --seo --ai` 评分
- **可视化编辑器** — Schema 驱动表单、实时预览、FsTransport / GitHubTransport / MemoryTransport
- **增量构建** — 内容哈希缓存，仅重新渲染变化页面

## 源码构建

```bash
git clone https://github.com/maicarons/mineproj
cd mineproj
pnpm install
pnpm build
pnpm --filter @mineproj/e2e build
node packages/cli/dist/cli.js audit --root examples/basic
```

## 仓库结构

```
mineproj/
├─ packages/
│  ├─ core/               # 构建内核：配置、数据、管线、渲染、主题
│  ├─ cli/                # CLI：dev/build/preview/check/audit/new/doctor/theme:eject
│  ├─ client/             # 运行时 SDK：fetch 客户端、React 钩子、Islands、路由器
│  ├─ schema/             # Zod 模式：Project、Profile、Tag、Collection、SiteConfig
│  ├─ markdown/           # Markdown 管线：GFM、Shiki、目录、摘要、安全过滤
│  ├─ editor/             # 可视化编辑器：Schema 表单、传输层、预览、安全
│  ├─ theme-classic/      # 默认主题：令牌、卡片、布局、Islands
│  ├─ theme-gallery/      # 可选深色沉浸式主题
│  ├─ test-utils/         # 契约测试辅助工具
│  ├─ create-mineproj/    # 项目脚手架
│  ├─ create-theme/       # 主题脚手架
│  ├─ create-plugin/      # 插件脚手架
│  └─ plugins/            # 官方插件：seo、sitemap、llms、mirror、feed、search、i18n
├─ examples/basic/        # 5 个项目的双语示例站点
├─ tests/
│  ├─ e2e/                # Playwright E2E 测试
│  └─ contract/           # API 黄金文件契约测试
├─ templates/             # 起始模板（minimal、showcase）
├─ docs/                  # 文档站点（VitePress）
├─ THEMES.md              # 主题生态指南
├─ PLUGINS.md             # 插件生态指南
└─ AGENTS.md              # AI 代理使用指南
```

## 项目状态

所有里程碑 **M0–M9** 100% 完成（143/143 项 WBS 条目）。  
**412+ 单元测试**、12 项契约测试、17 项 E2E 测试 — 全部通过。

## 文档

- [快速上手](docs/guide/getting-started.md)
- [部署指南](docs/guide/deploying.md)
- [主题开发](THEMES.md)
- [插件开发](PLUGINS.md)
- [产品技术方案](docs/plan/index.md)
- [开发计划](docs/plan/development.md)

## 参与贡献

参见 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。  
所有提交必须签署 DCO（`git commit -s`）。

## 许可

[Apache-2.0](LICENSE)。非官方 ASF 项目——请勿使用 Apache 品牌或羽毛标志。
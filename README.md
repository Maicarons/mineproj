# mineproj

> Apache-2.0 许可的、纯前端部署的个人项目展示静态站点生成器。

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![CI](https://github.com/maicarons/mineproj/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-395%20passed-brightgreen)

**mineproj** 把你的作品组织成一个**项目库（Project Library）**：卡片网格、标签筛选、即时搜索、悬停预览、详情页内嵌可玩 Demo 与富媒体预览（PDF / 图片 / 视频）。全部内容由 **JSON + Markdown** 驱动，无需后端；构建产物是一份纯静态目录，同时输出一套可直接 `fetch()` 的静态 API 端点（`/api/v1/*.json`）。

## Quick Start

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

## Features

- **Zero backend** — static output, deploy anywhere (GitHub Pages, Netlify, Vercel, Cloudflare, Nginx)
- **Theme-as-package** — `@mineproj/theme-classic` (default) and `@mineproj/theme-gallery` (dark immersive) are npm packages; switch with one config line
- **Plugin system** — mineproj lifecycle hooks + native Vite plugin passthrough
- **Markdown content pipeline** — GFM + Shiki build-time highlighting (zero runtime JS), TOC, excerpts, sanitize
- **Rich media** — PDF viewer (pdfjs lazy-load, 3-level degradation), Lightbox (zoom/pan/focus-trap), video facade
- **i18n** — route prefix, field-level overrides, per-locale markdown, fallback chain, `hreflang`, RTL
- **SEO / AI ready** — JSON-LD, sitemap, `llms.txt`, `AGENTS.md`, Markdown mirrors, `audit --seo --ai` scoring (100/100)
- **i18n** — bilingual sites, `hreflang`, language switcher
- **Incremental builds** — content-hash cache, only re-render changed pages

## Quick Start (from source)

```bash
git clone https://github.com/maicarons/mineproj
cd mineproj
pnpm install
pnpm build
pnpm --filter @mineproj/e2e build
node packages/cli/dist/cli.js audit --root examples/basic
```

## Repository Structure

```
mineproj/
├─ packages/
│  ├─ core/               # Build-time kernel: config, data, pipeline, render, themes
│  ├─ cli/                # CLI: dev/build/preview/check/audit/new/doctor/theme:eject
│  ├─ client/             # Runtime SDK: fetch client, React hooks, islands, router
│  ├─ schema/             # Zod schemas for Project, Profile, Tag, Collection, SiteConfig
│  ├─ markdown/           # Markdown pipeline: GFM, Shiki, TOC, excerpts, sanitize
│  ├─ theme-classic/      # Default theme: tokens, cards, layouts, islands
│  ├─ theme-gallery/      # Optional dark immersive theme
│  ├─ test-utils/         # Contract test helpers: runThemeContract, runPluginContract
│  ├─ create-mineproj/    # Project scaffold
│  ├─ create-theme/       # Theme scaffold
│  ├─ create-plugin/      # Plugin scaffold
│  └─ plugins/            # Official plugins: seo, sitemap, llms, mirror, feed, search, kit
├─ examples/basic/        # 5-project bilingual example site
├─ tests/
│  ├─ e2e/                # Playwright smoke tests
│  └─ contract/           # API golden-file contract tests
├─ templates/             # Starter templates (minimal, showcase)
├─ docs/                  # Documentation site (VitePress)
├─ THEMES.md              # Theme ecosystem guide
├─ PLUGINS.md             # Plugin ecosystem guide
└─ AGENTS.md              # AI agent consumption guide
```

## Status

Milestones M0–M7 complete (M8: engineering/docs, M9: visual editor — in progress). 395+ unit tests, 12 contract tests, 3 E2E — all green.

## Documentation

- [Product & Technical Plan](docs/plan/index.md)
- [Development Plan](docs/plan/development.md)
- [Getting Started](docs/guide/getting-started.md)
- [Deploying](docs/guide/deploying.md)
- [Theme Development](THEMES.md)
- [Plugin Development](PLUGINS.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Core conventions: one task = one commit, contract before implementation, default theme is the contract validator.

## License

[Apache-2.0](LICENSE). Not an official ASF project — do not use Apache branding or feather logo.
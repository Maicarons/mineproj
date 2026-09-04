# mineproj

> **mineproj** organizes your work into a **Project Library** — card grids, tag filtering, instant search, hover previews, and rich media (PDF/images/video) inside detail pages. Everything is driven by **JSON + Markdown**, no backend required. The build output is a fully static directory that also exposes a `fetch()`-ready static API at `/api/v1/*.json`.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![CI](https://github.com/maicarons/mineproj/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-vitepress-blue)](https://maicarons.github.io/mineproj/)
![Tests](https://img.shields.io/badge/tests-412%20passed-brightgreen)
![Status](https://img.shields.io/badge/milestones-M0–M9%20100%25-green)

---

## Quick Start

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and start adding projects.

## Features

- **Zero backend** — static output, deploy anywhere (GitHub Pages, Netlify, Vercel, Cloudflare, Nginx)
- **Theme-as-package** — `@mineproj/theme-classic` (default) and `@mineproj/theme-gallery` (dark immersive) are npm packages; switch with one config line
- **Plugin system** — mineproj lifecycle hooks + native Vite plugin passthrough
- **Markdown content pipeline** — GFM + Shiki build-time highlighting (zero runtime JS), TOC, excerpts, sanitize
- **Rich media** — PDF viewer (pdfjs lazy-load, 3-level degradation), Lightbox (zoom/pan/focus-trap), video facade
- **i18n** — route prefix, field-level overrides, per-locale markdown, fallback chain, `hreflang`, RTL support
- **SEO / AI ready** — JSON-LD, sitemap, `llms.txt`, `AGENTS.md`, Markdown mirrors, `audit --seo --ai` scoring
- **Visual editor** — schema-driven form, real-time preview, FsTransport / GitHubTransport / MemoryTransport
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
│  ├─ editor/             # Visual editor: schema forms, transports, preview, security
│  ├─ theme-classic/      # Default theme: tokens, cards, layouts, islands
│  ├─ theme-gallery/      # Optional dark immersive theme
│  ├─ test-utils/         # Contract test helpers
│  ├─ create-mineproj/    # Project scaffold
│  ├─ create-theme/       # Theme scaffold
│  ├─ create-plugin/      # Plugin scaffold
│  └─ plugins/            # Official plugins: seo, sitemap, llms, mirror, feed, search, i18n
├─ examples/basic/        # 5-project bilingual example site
├─ tests/
│  ├─ e2e/                # Playwright E2E tests
│  └─ contract/           # API golden-file contract tests
├─ templates/             # Starter templates (minimal, showcase)
├─ docs/                  # Documentation site (VitePress)
├─ THEMES.md              # Theme ecosystem guide
├─ PLUGINS.md             # Plugin ecosystem guide
└─ AGENTS.md              # AI agent consumption guide
```

## Status

All milestones **M0–M9** are 100% complete (143/143 WBS items).  
**412+ unit tests**, 12 contract tests, 17 E2E tests — all green.

## Documentation

- [Documentation](https://maicarons.github.io/mineproj/) — online docs site
- [Getting Started](docs/guide/getting-started.md)
- [Deploying](docs/guide/deploying.md)
- [Theme Development](THEMES.md)
- [Plugin Development](PLUGINS.md)
- [Product & Technical Plan](docs/plan/index.md) (Chinese)
- [Development Plan](docs/plan/development.md) (Chinese)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).  
All commits must be signed off (`git commit -s`) per DCO.

## License

[Apache-2.0](LICENSE). Not an official ASF project — do not use Apache branding or feather logo.
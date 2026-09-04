# mineproj Plugins

Extend your mineproj site with official and community plugins.

## Official Plugins

| Plugin | Package | Description |
|---|---|---|
| **SEO** | `@mineproj/plugin-seo` | Meta tags (title, OG, Twitter, canonical), JSON-LD structured data (Person, WebSite, SoftwareSourceCode, FAQPage, BreadcrumbList) |
| **Sitemap** | `@mineproj/plugin-sitemap` | `sitemap.xml` (lastmod, hreflang, images) + `sitemap.md` |
| **LLMs** | `@mineproj/plugin-llms` | `llms.txt`, `llms-full.txt`, `AGENTS.md` for AI agent consumption |
| **Markdown Mirror** | `@mineproj/plugin-markdown-mirror` | Per-page `index.md` mirror + `<link rel="alternate" type="text/markdown">` |
| **OG Image** | `@mineproj/plugin-og-image` | Build-time SVG OG image generation (1200×630) |
| **Search** | `@mineproj/plugin-kit/search` | MiniSearch sharded index per language/letter |
| **Feed** | `@mineproj/plugin-kit/feed` | RSS 2.0 + Atom feed generators |
| **Playable** | `@mineproj/plugin-kit/playable` | Build-time validation of playable demo entries |
| **Analytics** | `@mineproj/plugin-kit/analytics` | Umami / Plausible / GA snippet injection with DNT support |
| **MSW** | `@mineproj/plugin-kit/msw` | Service Worker mock generator for API prototyping |
| **PWA** | `@mineproj/plugin-kit/pwa` | Thin passthrough for `vite-plugin-pwa` |

## Using a Plugin

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({
      siteUrl: 'https://example.com',
      siteTitle: 'My Site',
    }),
  ],
});
```

## Plugin Lifecycle Hooks

| Hook | Type | Called When |
|---|---|---|
| `config:resolved` | waterfall | After config is loaded and validated |
| `data:loaded` | seq | After dataset is loaded |
| `data:validated` | seq | After data validation |
| `routes:collect` | waterfall | After routes are collected |
| `api:endpoints` | waterfall | Before API endpoints are emitted |
| `assets:process` | seq | During asset processing |
| `render:before` | waterfall | Before each page is rendered (mutate HTML) |
| `emit` | seq | After all files are written |
| `build:done` | seq | After build completes |

## Creating a Plugin

```bash
pnpm create @mineproj/create-plugin my-plugin
```

A plugin is an object with `name`, `hooks`, `vite[]`, `components`, and `optionsSchema`.

## Contract Testing

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] if valid
```

## PR Template

See [CONTRIBUTING.md](../CONTRIBUTING.md) for plugin submission guidelines.
# Configuration

mineproj is configured via `mineproj.config.ts` in your project root. The configuration file exports a config object created with `defineConfig()`.

## Site Configuration

```ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'My Portfolio',
    description: 'A showcase of my work',
    url: 'https://example.com',
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
    fallbackLocale: 'en',
    prefixAll: false,
    keywords: ['portfolio', 'projects'],
  },
  // ... theme, plugins, api
});
```

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | required | Site title |
| `description` | `string` | `''` | Site description for meta tags |
| `url` | `string` | `''` | Production URL (required for SEO plugins) |
| `defaultLocale` | `string` | `'zh-CN'` | Default locale |
| `locales` | `string[]` | `['zh-CN']` | All enabled locales |
| `fallbackLocale` | `string` | `undefined` | Fallback for untranslated content |
| `prefixAll` | `boolean` | `false` | Prefix default locale URLs too |
| `keywords` | `string[]` | `[]` | SEO keywords |

## Theme Configuration

```ts
export default defineConfig({
  theme: 'classic',            // shorthand, or package name, or local path
  themeConfig: {               // passed to the theme's configSchema
    accent: '#2563EB',
    palette: 'neutral',
    colorMode: 'system',
    density: 'comfortable',
    contentWidth: 1280,
    cardStyle: 'grid',
    heroMode: 'hero',
    radius: 'md',
  },
});
```

## Plugin Configuration

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // shorthand
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // with options
    {                          // inline plugin
      name: 'my-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // bare Vite plugin passthrough
  ],
});
```

## API Strategy

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## Paths

```ts
export default defineConfig({
  dataDir: 'data',        // default: 'data'
  outDir: 'dist',         // default: 'dist'
  publicDir: 'public',    // default: 'public'
});
```
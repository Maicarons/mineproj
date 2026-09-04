# Konfigurasi

mineproj dikonfigurasi melalui `mineproj.config.ts` di direktori root proyek Anda. File konfigurasi mengekspor objek konfigurasi yang dibuat dengan `defineConfig()`.

## Konfigurasi Situs

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

### Field

| Field | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| `title` | `string` | wajib | Judul situs |
| `description` | `string` | `''` | Deskripsi situs untuk tag meta |
| `url` | `string` | `''` | URL produksi (diperlukan untuk plugin SEO) |
| `defaultLocale` | `string` | `'zh-CN'` | Lokal default |
| `locales` | `string[]` | `['zh-CN']` | Semua lokal yang diaktifkan |
| `fallbackLocale` | `string` | `undefined` | Cadangan untuk konten yang belum diterjemahkan |
| `prefixAll` | `boolean` | `false` | Awali URL lokal default juga |
| `keywords` | `string[]` | `[]` | Kata kunci SEO |

## Konfigurasi Tema

```ts
export default defineConfig({
  theme: 'classic',            // singkatan, atau nama paket, atau jalur lokal
  themeConfig: {               // diteruskan ke configSchema tema
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

## Konfigurasi Plugin

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // singkatan
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // dengan opsi
    {                          // plugin inline
      name: 'my-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // plugin Vite biasa
  ],
});
```

## Strategi API

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## Jalur (Paths)

```ts
export default defineConfig({
  dataDir: 'data',        // default: 'data'
  outDir: 'dist',         // default: 'dist'
  publicDir: 'public',    // default: 'public'
});
```
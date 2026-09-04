# Configuration

mineproj est configuré via `mineproj.config.ts` à la racine de votre projet. Le fichier de configuration exporte un objet de configuration créé avec `defineConfig()`.

## Configuration du Site

```ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'Mon Portfolio',
    description: 'Une vitrine de mon travail',
    url: 'https://example.com',
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
    fallbackLocale: 'en',
    prefixAll: false,
    keywords: ['portfolio', 'projets'],
  },
  // ... thème, plugins, api
});
```

### Champs

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `title` | `string` | requis | Titre du site |
| `description` | `string` | `''` | Description du site pour les balises meta |
| `url` | `string` | `''` | URL de production (requis pour les plugins SEO) |
| `defaultLocale` | `string` | `'zh-CN'` | Locale par défaut |
| `locales` | `string[]` | `['zh-CN']` | Toutes les locales activées |
| `fallbackLocale` | `string` | `undefined` | Repli pour le contenu non traduit |
| `prefixAll` | `boolean` | `false` | Préfixer aussi les URLs de la locale par défaut |
| `keywords` | `string[]` | `[]` | Mots-clés SEO |

## Configuration du Thème

```ts
export default defineConfig({
  theme: 'classic',            // raccourci, ou nom du package, ou chemin local
  themeConfig: {               // passé au configSchema du thème
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

## Configuration des Plugins

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // raccourci
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // avec options
    {                          // plugin en ligne
      name: 'mon-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // passage direct de plugin Vite brut
  ],
});
```

## Stratégie API

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## Chemins

```ts
export default defineConfig({
  dataDir: 'data',        // défaut : 'data'
  outDir: 'dist',         // défaut : 'dist'
  publicDir: 'public',    // défaut : 'public'
});
```
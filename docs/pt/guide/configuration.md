# Configuração

O mineproj é configurado via `mineproj.config.ts` na raiz do seu projeto. O arquivo de configuração exporta um objeto de configuração criado com `defineConfig()`.

## Configuração do Site

```ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'Meu Portfólio',
    description: 'Uma vitrine do meu trabalho',
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

### Campos

| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `title` | `string` | obrigatório | Título do site |
| `description` | `string` | `''` | Descrição do site para meta tags |
| `url` | `string` | `''` | URL de produção (obrigatório para plugins de SEO) |
| `defaultLocale` | `string` | `'zh-CN'` | Localidade padrão |
| `locales` | `string[]` | `['zh-CN']` | Todas as localidades habilitadas |
| `fallbackLocale` | `string` | `undefined` | Fallback para conteúdo não traduzido |
| `prefixAll` | `boolean` | `false` | Prefixar URLs da localidade padrão também |
| `keywords` | `string[]` | `[]` | Palavras-chave de SEO |

## Configuração do Tema

```ts
export default defineConfig({
  theme: 'classic',            // atalho, ou nome do pacote, ou caminho local
  themeConfig: {               // passado para o configSchema do tema
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

## Configuração de Plugins

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // atalho
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // com opções
    {                          // plugin inline
      name: 'meu-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // passagem direta de plugin Vite
  ],
});
```

## Estratégia de API

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## Caminhos

```ts
export default defineConfig({
  dataDir: 'data',        // padrão: 'data'
  outDir: 'dist',         // padrão: 'dist'
  publicDir: 'public',    // padrão: 'public'
});
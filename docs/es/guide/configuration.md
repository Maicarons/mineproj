# Configuración

mineproj se configura mediante `mineproj.config.ts` en la raíz de tu proyecto. El archivo de configuración exporta un objeto de configuración creado con `defineConfig()`.

## Configuración del Sitio

```ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'Mi Portafolio',
    description: 'Una muestra de mi trabajo',
    url: 'https://example.com',
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
    fallbackLocale: 'en',
    prefixAll: false,
    keywords: ['portafolio', 'proyectos'],
  },
  // ... theme, plugins, api
});
```

### Campos

| Campo | Tipo | Por Defecto | Descripción |
|-------|------|-------------|-------------|
| `title` | `string` | requerido | Título del sitio |
| `description` | `string` | `''` | Descripción del sitio para meta tags |
| `url` | `string` | `''` | URL de producción (requerida para plugins SEO) |
| `defaultLocale` | `string` | `'zh-CN'` | Idioma por defecto |
| `locales` | `string[]` | `['zh-CN']` | Todos los idiomas habilitados |
| `fallbackLocale` | `string` | `undefined` | Idioma alternativo para contenido no traducido |
| `prefixAll` | `boolean` | `false` | Prefijar también las URLs del idioma por defecto |
| `keywords` | `string[]` | `[]` | Palabras clave SEO |

## Configuración del Tema

```ts
export default defineConfig({
  theme: 'classic',            // forma abreviada, nombre del paquete o ruta local
  themeConfig: {               // se pasa al configSchema del tema
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

## Configuración de Plugins

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // forma abreviada
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // con opciones
    {                          // plugin en línea
      name: 'my-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // paso directo de plugin Vite
  ],
});
```

## Estrategia API

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## Rutas

```ts
export default defineConfig({
  dataDir: 'data',        // por defecto: 'data'
  outDir: 'dist',         // por defecto: 'dist'
  publicDir: 'public',    // por defecto: 'public'
});
```
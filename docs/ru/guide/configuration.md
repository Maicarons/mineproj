# Конфигурация

mineproj настраивается через файл `mineproj.config.ts` в корне вашего проекта. Файл конфигурации экспортирует объект конфигурации, созданный с помощью `defineConfig()`.

## Конфигурация сайта

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

### Поля

| Поле | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `title` | `string` | обязательно | Название сайта |
| `description` | `string` | `''` | Описание сайта для мета-тегов |
| `url` | `string` | `''` | URL продакшена (требуется для SEO-плагинов) |
| `defaultLocale` | `string` | `'zh-CN'` | Локаль по умолчанию |
| `locales` | `string[]` | `['zh-CN']` | Все включённые локали |
| `fallbackLocale` | `string` | `undefined` | Резервная локаль для непереведённого контента |
| `prefixAll` | `boolean` | `false` | Добавлять префикс локали по умолчанию к URL тоже |
| `keywords` | `string[]` | `[]` | SEO-ключевые слова |

## Конфигурация темы

```ts
export default defineConfig({
  theme: 'classic',            // сокращение, или имя пакета, или локальный путь
  themeConfig: {               // передаётся в configSchema темы
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

## Конфигурация плагинов

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // сокращение
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // с опциями
    {                          // встроенный плагин
      name: 'my-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // прямой проход Vite-плагина
  ],
});
```

## Стратегия API

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## Пути

```ts
export default defineConfig({
  dataDir: 'data',        // по умолчанию: 'data'
  outDir: 'dist',         // по умолчанию: 'dist'
  publicDir: 'public',    // по умолчанию: 'public'
});
```
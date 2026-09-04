# Разработка плагинов

Плагины mineproj расширяют конвейер сборки с помощью хуков и компонентов.

## Контракт плагина

Плагин — это объект со следующими свойствами:

| Свойство | Тип | Обязательно | Описание |
|----------|-----|-------------|----------|
| `name` | `string` | ✅ | Уникальное имя плагина |
| `hooks` | `Record<string, Function>` | Необязательно | Обработчики хуков жизненного цикла |
| `vite` | `VitePlugin[]` | Необязательно | Vite-плагины для внедрения |
| `components` | `Record<string, Component>` | Необязательно | Компоненты для регистрации |
| `optionsSchema` | `ZodSchema` | Необязательно | Схема для опций плагина |
| `setup` | `Function` | Необязательно | Хук времени установки |

## Пример

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('Сборка завершена!');
    },
  },
});
```

## Хуки жизненного цикла

| Хук | Тип | Сигнатура | Когда вызывается |
|-----|-----|-----------|------------------|
| `config:resolved` | waterfall | `(config, ctx) => config` | После загрузки конфигурации |
| `data:loaded` | seq | `(_, ctx) => void` | После загрузки набора данных |
| `data:validated` | seq | `(_, ctx) => void` | После проверки данных |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | После сбора маршрутов |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | Перед генерацией API |
| `render:before` | waterfall | `(html, ctx) => html` | Перед рендерингом каждой страницы |
| `emit` | seq | `(_, ctx) => void` | После записи всех файлов |
| `build:done` | seq | `(_, ctx) => void` | После завершения сборки |

## Плагин с опциями

```ts
import { z } from 'zod';
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: '@mineproj/plugin-analytics',
  optionsSchema: z.object({
    provider: z.enum(['umami', 'plausible', 'ga']),
    id: z.string(),
  }),
  hooks: {
    'render:before': (html, ctx) => {
      // Внедрение фрагмента аналитики перед </head>
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## Использование плагина

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'My Site' }),
  ],
});
```

## Контрактное тестирование

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] если валидно
```

## Публикация

1. Назовите ваш пакет `mineproj-plugin-*` или `@mineproj/plugin-*`
2. Добавьте `"keywords": ["mineproj-plugin"]` в package.json
3. Запустите `runPluginContract` для проверки
4. Опубликуйте в npm
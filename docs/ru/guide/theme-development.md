# Разработка тем

Темы mineproj — это npm-пакеты, которые управляют внешним видом вашего сайта.

## Контракт темы

Тема — это объект со следующими свойствами:

| Свойство | Тип | Обязательно | Описание |
|----------|-----|-------------|----------|
| `name` | `string` | ✅ | Уникальное имя темы |
| `layouts` | `Record<string, Component>` | ✅ | Макеты для каждого типа маршрута |
| `components` | `Record<string, Component>` | Необязательно | Переиспользуемые компоненты |
| `slots` | `string[]` | Необязательно | Именованные точки вставки |
| `configSchema` | `ZodSchema` | Необязательно | Схема для themeConfig |
| `locales` | `Record<string, Record<string, string>>` | Необязательно | Словари перевода интерфейса |
| `styles` | `string[]` | Необязательно | CSS-строки, встраиваемые в `<head>` каждой страницы |
| `headScripts` | `string[]` | Необязательно | Встроенные скрипты, внедряемые в `<head>` страницы |
| `islands` | `Record<string, Component>` | Необязательно | Интерактивные компоненты, гидратируемые на клиенте |
| `extends` | `Theme \| string` | Необязательно | Родительская тема для наследования |

## Пример

```ts
import { defineTheme } from '@mineproj/core';

const theme = defineTheme({
  name: 'my-theme',
  layouts: {
    home: ({ data, config }) => (
      <main>
        <h1>{config.title}</h1>
        <ul>
          {data.projects.map(p => <li key={p.slug}>{p.name}</li>)}
        </ul>
      </main>
    ),
  },
  styles: [`:root { --mp-color-accent: #ff5500; }`],
});

export default theme;
```

## Использование локальной темы

Создайте `.mineproj/theme/index.mts`:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

Затем установите `theme: '.mineproj/theme'` в вашей конфигурации.

## Макеты

Семь обязательных типов макетов:

| Макет | Маршрут | Назначение |
|-------|---------|------------|
| `home` | `/` | Главная страница с героем, избранными проектами, сеткой |
| `list` | `/projects/` | Фильтруемая сетка проектов |
| `detail` | `/projects/<slug>/` | Детальная страница проекта с боковой панелью |
| `tag` | `/tags/<name>/` | Проекты, отфильтрованные по тегу |
| `collection` | `/collections/<slug>/` | Курируемая коллекция |
| `about` | `/about/` | Профиль автора |
| `notFound` | `404.html` | Пользовательская страница 404 |

## Острова

Интерактивные компоненты помечаются как острова:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Регистрация в теме:

```ts
const theme = defineTheme({
  name: 'my-theme',
  layouts: { ... },
  islands: { 'my-counter': MyCounter },
  islandsImport: 'my-theme/islands',
});
```

## Контрактное тестирование

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] если валидно
```

## Публикация

1. Назовите ваш пакет `mineproj-theme-*` или `@scope/mineproj-theme-*`
2. Добавьте `"keywords": ["mineproj-theme"]` в package.json
3. Запустите `runThemeContract` для проверки
4. Опубликуйте в npm
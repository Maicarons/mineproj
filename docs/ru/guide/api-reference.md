# Справочник API

mineproj генерирует полностью статический REST-подобный API в `dist/api/v1/`. Каждая конечная точка отдаёт статический JSON — бэкенд не требуется.

## Конверт

Каждый ответ следует этой структуре:

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": 1,
  "data": { ... }
}
```

## Конечные точки

| Конечная точка | Kind | Описание |
|----------------|------|----------|
| `/api/v1/projects.json` | ProjectList | Полный список проектов |
| `/api/v1/projects/<slug>.json` | Project | Детальная информация об одном проекте |
| `/api/v1/tags.json` | TagList | Все теги с количеством проектов |
| `/api/v1/categories.json` | CategoryList | Все категории |
| `/api/v1/collections.json` | CollectionList | Все коллекции |
| `/api/v1/profile.json` | Profile | Данные профиля |
| `/api/v1/stats.json` | Stats | Агрегированная статистика |
| `/api/v1/search.json` | SearchIndex | Индекс MiniSearch |
| `/api/v1/feed.json` | Feed | Элементы ленты |
| `/api/v1/manifest.json` | Manifest | Самодокументируемый список конечных точек |

## Параметры запроса (режим разработки)

| Параметр | Пример | Описание |
|----------|--------|----------|
| `q` | `?q=web` | Полнотекстовый поиск |
| `tag` | `?tag=web,game` | Фильтрация по тегам (AND) |
| `category` | `?category=web` | Фильтрация по категории |
| `status` | `?status=released` | Фильтрация по статусу |
| `sort` | `?sort=createdAt:desc` | Поле и направление сортировки |
| `page` | `?page=2` | Номер страницы |
| `pageSize` | `?pageSize=20` | Элементов на странице |
| `lang` | `?lang=en` | Локаль для локализованных данных |

## Клиентский SDK

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('my-project');
const results = await api.search('web');
```

React-хуки:

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MyComponent() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Загрузка...' : data.length} проектов</div>;
}
```
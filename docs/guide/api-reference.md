# API Reference

mineproj generates a fully static REST-like API under `dist/api/v1/`. Every endpoint serves static JSON — no backend required.

## Envelope

Every response follows this structure:

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": 1,
  "data": { ... }
}
```

## Endpoints

| Endpoint | Kind | Description |
|----------|------|-------------|
| `/api/v1/projects.json` | ProjectList | Full project list |
| `/api/v1/projects/<slug>.json` | Project | Single project detail |
| `/api/v1/tags.json` | TagList | All tags with counts |
| `/api/v1/categories.json` | CategoryList | All categories |
| `/api/v1/collections.json` | CollectionList | All collections |
| `/api/v1/profile.json` | Profile | Profile data |
| `/api/v1/stats.json` | Stats | Aggregated statistics |
| `/api/v1/search.json` | SearchIndex | MiniSearch index |
| `/api/v1/feed.json` | Feed | Feed items |
| `/api/v1/manifest.json` | Manifest | Self-describing endpoint list |

## Query Parameters (dev mode)

| Param | Example | Description |
|-------|---------|-------------|
| `q` | `?q=web` | Full-text search |
| `tag` | `?tag=web,game` | Filter by tags (AND) |
| `category` | `?category=web` | Filter by category |
| `status` | `?status=released` | Filter by status |
| `sort` | `?sort=createdAt:desc` | Sort field and direction |
| `page` | `?page=2` | Page number |
| `pageSize` | `?pageSize=20` | Items per page |
| `lang` | `?lang=en` | Locale for localized data |

## Client SDK

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('my-project');
const results = await api.search('web');
```

React hooks:

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MyComponent() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Loading...' : data.length} projects</div>;
}
```
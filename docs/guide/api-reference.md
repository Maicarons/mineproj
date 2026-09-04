# API Reference

mineproj generates a fully static REST-like API under `dist/api/v1/`. Every endpoint serves static JSON — no backend required.

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/v1/projects.json` | Full project list (lite fields) |
| `GET /api/v1/projects/index.json` | Paginated project list with envelope |
| `GET /api/v1/projects/<slug>.json` | Single project with full body |
| `GET /api/v1/tags.json` | Tag aggregation with counts |
| `GET /api/v1/categories.json` | Category aggregation with counts |
| `GET /api/v1/collections.json` | Curated collections |
| `GET /api/v1/profile.json` | Author profile |
| `GET /api/v1/search.json` | MiniSearch index + documents |
| `GET /api/v1/stats.json` | Site statistics |
| `GET /api/v1/feed.json` | JSON Feed (latest projects) |
| `GET /api/v1/manifest.json` | Self-describing endpoint manifest |

## Response Envelope

Every response follows a consistent envelope:

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-09-03T08:00:00.000Z",
  "schemaVersion": "1.0.0",
  "total": 42,
  "page": 1,
  "pageSize": 24,
  "data": [ ... ],
  "facets": {
    "tags": { "web": 12, "game": 7 },
    "status": { "released": 30 }
  }
}
```

## Query Parameters

`GET /api/v1/projects?q=web&tag=game&sort=createdAt:desc&page=1&pageSize=12`

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | — | Free-text search (name, tagline, summary, tags) |
| `tag` | string | — | Filter by tag (comma-separated for AND) |
| `tagMode` | `and` \| `or` | `or` | Multi-tag matching mode |
| `category` | string | — | Filter by category |
| `status` | string | — | Filter by status |
| `platform` | string | — | Filter by platform |
| `playable` | boolean | — | Filter by playable status |
| `sort` | string | `createdAt:desc` | Sort field and direction |
| `page` | number | 1 | Page number |
| `pageSize` | number | 24 | Items per page |
| `fields` | string | — | Comma-separated field projection |

## Searching

The search index is built with MiniSearch. Use the client SDK:

```ts
import { createApiClient } from '@mineproj/client';
const client = createApiClient();
const results = await client.search('voxel');
```

## Localization

Add `?lang=en` to get localized responses:

```
GET /api/v1/projects/voxel-tool.json?lang=en
```

## Client SDK

```ts
import { createApiClient } from '@mineproj/client';

const client = createApiClient({ baseUrl: '/api/v1' });

// React hooks
const { data, loading, error } = useProjects({ tag: 'web' });
const { data: project } = useProject('voxel-tool');
const { data: tags } = useTags();
```
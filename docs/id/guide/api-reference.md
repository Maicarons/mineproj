# Referensi API

mineproj menghasilkan API statis mirip REST di bawah `dist/api/v1/`. Setiap endpoint menyajikan JSON statis — tidak diperlukan backend.

## Amplop (Envelope)

Setiap respons mengikuti struktur ini:

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": 1,
  "data": { ... }
}
```

## Endpoint

| Endpoint | Kind | Deskripsi |
|----------|------|-----------|
| `/api/v1/projects.json` | ProjectList | Daftar proyek lengkap |
| `/api/v1/projects/<slug>.json` | Project | Detail proyek tunggal |
| `/api/v1/tags.json` | TagList | Semua tag dengan jumlah |
| `/api/v1/categories.json` | CategoryList | Semua kategori |
| `/api/v1/collections.json` | CollectionList | Semua koleksi |
| `/api/v1/profile.json` | Profile | Data profil |
| `/api/v1/stats.json` | Stats | Statistik agregat |
| `/api/v1/search.json` | SearchIndex | Indeks MiniSearch |
| `/api/v1/feed.json` | Feed | Item feed |
| `/api/v1/manifest.json` | Manifest | Daftar endpoint deskriptif mandiri |

## Parameter Kueri (mode dev)

| Param | Contoh | Deskripsi |
|-------|--------|-----------|
| `q` | `?q=web` | Pencarian teks lengkap |
| `tag` | `?tag=web,game` | Filter berdasarkan tag (AND) |
| `category` | `?category=web` | Filter berdasarkan kategori |
| `status` | `?status=released` | Filter berdasarkan status |
| `sort` | `?sort=createdAt:desc` | Field dan arah pengurutan |
| `page` | `?page=2` | Nomor halaman |
| `pageSize` | `?pageSize=20` | Item per halaman |
| `lang` | `?lang=en` | Lokal untuk data yang dilokalkan |

## SDK Klien

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
  return <div>{loading ? 'Memuat...' : data.length} proyek</div>;
}
```
# Referencia de API

mineproj genera una API estática similar a REST bajo `dist/api/v1/`. Cada endpoint sirve JSON estático — no se requiere backend.

## Envoltorio

Cada respuesta sigue esta estructura:

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

| Endpoint | Kind | Descripción |
|----------|------|-------------|
| `/api/v1/projects.json` | ProjectList | Lista completa de proyectos |
| `/api/v1/projects/<slug>.json` | Project | Detalle de un proyecto individual |
| `/api/v1/tags.json` | TagList | Todas las etiquetas con recuentos |
| `/api/v1/categories.json` | CategoryList | Todas las categorías |
| `/api/v1/collections.json` | CollectionList | Todas las colecciones |
| `/api/v1/profile.json` | Profile | Datos del perfil |
| `/api/v1/stats.json` | Stats | Estadísticas agregadas |
| `/api/v1/search.json` | SearchIndex | Índice MiniSearch |
| `/api/v1/feed.json` | Feed | Elementos del feed |
| `/api/v1/manifest.json` | Manifest | Lista de endpoints auto-descriptiva |

## Parámetros de Consulta (modo desarrollo)

| Parámetro | Ejemplo | Descripción |
|-----------|---------|-------------|
| `q` | `?q=web` | Búsqueda de texto completo |
| `tag` | `?tag=web,game` | Filtrar por etiquetas (Y) |
| `category` | `?category=web` | Filtrar por categoría |
| `status` | `?status=released` | Filtrar por estado |
| `sort` | `?sort=createdAt:desc` | Campo y dirección de ordenación |
| `page` | `?page=2` | Número de página |
| `pageSize` | `?pageSize=20` | Elementos por página |
| `lang` | `?lang=en` | Idioma para datos localizados |

## SDK de Cliente

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('my-project');
const results = await api.search('web');
```

Hooks de React:

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MyComponent() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Cargando...' : data.length} proyectos</div>;
}
```
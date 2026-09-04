# Referência da API

O mineproj gera uma API totalmente estática estilo REST em `dist/api/v1/`. Cada endpoint serve JSON estático — sem necessidade de backend.

## Envelope

Toda resposta segue esta estrutura:

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

| Endpoint | Kind | Descrição |
|----------|------|-----------|
| `/api/v1/projects.json` | ProjectList | Lista completa de projetos |
| `/api/v1/projects/<slug>.json` | Project | Detalhe de um único projeto |
| `/api/v1/tags.json` | TagList | Todas as tags com contagens |
| `/api/v1/categories.json` | CategoryList | Todas as categorias |
| `/api/v1/collections.json` | CollectionList | Todas as coleções |
| `/api/v1/profile.json` | Profile | Dados do perfil |
| `/api/v1/stats.json` | Stats | Estatísticas agregadas |
| `/api/v1/search.json` | SearchIndex | Índice MiniSearch |
| `/api/v1/feed.json` | Feed | Itens do feed |
| `/api/v1/manifest.json` | Manifest | Lista de endpoints auto-descritiva |

## Parâmetros de Consulta (modo dev)

| Parâmetro | Exemplo | Descrição |
|-----------|---------|-----------|
| `q` | `?q=web` | Pesquisa de texto completo |
| `tag` | `?tag=web,game` | Filtrar por tags (AND) |
| `category` | `?category=web` | Filtrar por categoria |
| `status` | `?status=released` | Filtrar por status |
| `sort` | `?sort=createdAt:desc` | Campo e direção de ordenação |
| `page` | `?page=2` | Número da página |
| `pageSize` | `?pageSize=20` | Itens por página |
| `lang` | `?lang=en` | Localidade para dados localizados |

## SDK do Cliente

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('meu-projeto');
const results = await api.search('web');
```

React hooks:

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MeuComponente() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Carregando...' : data.length} projetos</div>;
}
```
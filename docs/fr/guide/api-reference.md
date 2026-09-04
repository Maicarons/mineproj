# Référence API

mineproj génère une API entièrement statique de type REST sous `dist/api/v1/`. Chaque point de terminaison sert du JSON statique — aucun backend requis.

## Enveloppe

Chaque réponse suit cette structure :

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": 1,
  "data": { ... }
}
```

## Points de Terminaison

| Point de Terminaison | Kind | Description |
|----------|------|-------------|
| `/api/v1/projects.json` | ProjectList | Liste complète des projets |
| `/api/v1/projects/<slug>.json` | Project | Détail d'un seul projet |
| `/api/v1/tags.json` | TagList | Tous les tags avec leurs compteurs |
| `/api/v1/categories.json` | CategoryList | Toutes les catégories |
| `/api/v1/collections.json` | CollectionList | Toutes les collections |
| `/api/v1/profile.json` | Profile | Données du profil |
| `/api/v1/stats.json` | Stats | Statistiques agrégées |
| `/api/v1/search.json` | SearchIndex | Index MiniSearch |
| `/api/v1/feed.json` | Feed | Éléments du flux |
| `/api/v1/manifest.json` | Manifest | Liste auto-descriptive des points de terminaison |

## Paramètres de Requête (mode développement)

| Param | Exemple | Description |
|-------|---------|-------------|
| `q` | `?q=web` | Recherche en texte intégral |
| `tag` | `?tag=web,game` | Filtrer par tags (ET) |
| `category` | `?category=web` | Filtrer par catégorie |
| `status` | `?status=released` | Filtrer par statut |
| `sort` | `?sort=createdAt:desc` | Champ et direction de tri |
| `page` | `?page=2` | Numéro de page |
| `pageSize` | `?pageSize=20` | Éléments par page |
| `lang` | `?lang=en` | Locale pour les données localisées |

## SDK Client

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('mon-projet');
const results = await api.search('web');
```

Hooks React :

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MonComposant() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Chargement...' : data.length} projets</div>;
}
```
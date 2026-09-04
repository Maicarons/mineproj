# Développement de Thème

Les thèmes mineproj sont des packages npm qui contrôlent l'apparence de votre site.

## Contrat du Thème

Un thème est un objet avec les propriétés suivantes :

| Propriété | Type | Requis | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Nom unique du thème |
| `layouts` | `Record<string, Component>` | ✅ | Mises en page pour chaque type de route |
| `components` | `Record<string, Component>` | Optionnel | Composants réutilisables |
| `slots` | `string[]` | Optionnel | Points d'insertion nommés |
| `configSchema` | `ZodSchema` | Optionnel | Schéma pour themeConfig |
| `locales` | `Record<string, Record<string, string>>` | Optionnel | Dictionnaires de traduction UI |
| `styles` | `string[]` | Optionnel | Chaînes CSS intégrées dans chaque en-tête de page |
| `headScripts` | `string[]` | Optionnel | Scripts en ligne injectés dans l'en-tête de la page |
| `islands` | `Record<string, Component>` | Optionnel | Composants interactifs hydratés côté client |
| `extends` | `Theme \| string` | Optionnel | Thème parent à hériter |

## Exemple

```ts
import { defineTheme } from '@mineproj/core';

const theme = defineTheme({
  name: 'mon-theme',
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

## Utiliser un thème local

Créez `.mineproj/theme/index.mts` :

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

Puis définissez `theme: '.mineproj/theme'` dans votre configuration.

## Mises en Page

Les sept types de mise en page requis :

| Mise en Page | Route | Objectif |
|---|---|---|
| `home` | `/` | Page d'accueil avec hero, projets vedettes, grille |
| `list` | `/projects/` | Grille de projets filtrable |
| `detail` | `/projects/<slug>/` | Détail du projet avec barre latérale |
| `tag` | `/tags/<name>/` | Projets filtrés par tag |
| `collection` | `/collections/<slug>/` | Collection organisée |
| `about` | `/about/` | Profil de l'auteur |
| `notFound` | `404.html` | Page 404 personnalisée |

## Îles

Les composants interactifs sont marqués comme des îles :

```tsx
export function MonCompteur({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Enregistrez dans le thème :

```ts
const theme = defineTheme({
  name: 'mon-theme',
  layouts: { ... },
  islands: { 'mon-compteur': MonCompteur },
  islandsImport: 'mon-theme/islands',
});
```

## Test de Contrat

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(monTheme, { requireAllLayouts: true });
console.log(result.errors); // [] si valide
```

## Publication

1. Nommez votre package `mineproj-theme-*` ou `@scope/mineproj-theme-*`
2. Ajoutez `"keywords": ["mineproj-theme"]` dans package.json
3. Exécutez `runThemeContract` pour valider
4. Publiez sur npm
# Développement de Plugin

Les plugins mineproj étendent le pipeline de construction avec des hooks et des composants.

## Contrat du Plugin

Un plugin est un objet avec :

| Propriété | Type | Requis | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Nom unique du plugin |
| `hooks` | `Record<string, Function>` | Optionnel | Gestionnaires de hooks de cycle de vie |
| `vite` | `VitePlugin[]` | Optionnel | Plugins Vite à injecter |
| `components` | `Record<string, Component>` | Optionnel | Composants à enregistrer |
| `optionsSchema` | `ZodSchema` | Optionnel | Schéma pour les options du plugin |
| `setup` | `Function` | Optionnel | Hook d'installation |

## Exemple

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('Construction terminée !');
    },
  },
});
```

## Hooks de Cycle de Vie

| Hook | Type | Signature | Appelé Quand |
|---|---|---|---|
| `config:resolved` | waterfall | `(config, ctx) => config` | Après le chargement de la config |
| `data:loaded` | seq | `(_, ctx) => void` | Après le chargement des données |
| `data:validated` | seq | `(_, ctx) => void` | Après la validation des données |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | Après la collecte des routes |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | Avant l'émission de l'API |
| `render:before` | waterfall | `(html, ctx) => html` | Avant le rendu de chaque page |
| `emit` | seq | `(_, ctx) => void` | Après l'écriture de tous les fichiers |
| `build:done` | seq | `(_, ctx) => void` | Après la fin de la construction |

## Plugin avec Options

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
      // Injecter un extrait analytique avant </head>
      return html.replace('</head>', `${extrait}\n</head>`);
    },
  },
});
```

## Utiliser un Plugin

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'Mon Site' }),
  ],
});
```

## Test de Contrat

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(monPlugin);
console.log(result.errors); // [] si valide
```

## Publication

1. Nommez votre package `mineproj-plugin-*` ou `@mineproj/plugin-*`
2. Ajoutez `"keywords": ["mineproj-plugin"]` dans package.json
3. Exécutez `runPluginContract` pour valider
4. Publiez sur npm
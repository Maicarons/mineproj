# Îles du Thème

Les îles sont des composants React interactifs qui sont pré-rendus côté serveur et hydratés côté client. Cette architecture offre une interactivité riche sans expédier un bundle JavaScript complet à chaque page.

## Comment Fonctionnent les Îles

1. **Lors de la construction** : Le thème rend les îles en HTML avec des props sérialisées
2. **Lors du regroupement** : Un processus Vite séparé regroupe uniquement le code de l'île dans `@mp/islands.js`
3. **Lors de l'exécution** : Le client charge `@mp/islands.js` et hydrate chaque île via son attribut `data-mp-island`

## Déclarer des Îles

Dans la définition de votre thème :

```ts
export default defineTheme({
  name: '@mineproj/mon-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## Composants d'Îles

Les composants d'îles sont enregistrés dans le registre d'îles du thème :

```tsx
// src/islands.tsx
import { ThemeToggle } from './components/ThemeToggle';
import { SearchPalette } from './components/SearchPalette';
import { LibraryExplorer } from './components/LibraryExplorer';

export default {
  'theme-toggle': ThemeToggle,
  'search-palette': SearchPalette,
  'library-explorer': LibraryExplorer,
};
```

## Rendu Serveur

Pendant le SSR, les îles sont rendues comme suit :

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- HTML rendu par le serveur -->
  <button>Changer le thème</button>
</div>
```

## Hydratation Côté Client

L'environnement d'exécution des îles (`@mineproj/client`) trouve tous les éléments `[data-mp-island]` et les hydrate :

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(registreIles);
```

## Chargement Conditionnel

Les îles ne sont chargées que sur les pages qui les utilisent. Le pipeline vérifie quelles îles sont présentes sur chaque page et n'inclut le bundle que lorsque cela est nécessaire.

## Repli Sans JavaScript

Les pages sans îles ne chargent pas du tout le bundle d'îles. Cela signifie que les pages de contenu statique ont zéro JavaScript.
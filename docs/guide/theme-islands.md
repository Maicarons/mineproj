# Theme Islands

Islands are interactive React components that are pre-rendered on the server and hydrated on the client. This architecture gives you rich interactivity without shipping a full JavaScript bundle to every page.

## How Islands Work

1. **Build time**: The theme renders islands as HTML with serialized props
2. **Bundle time**: A separate Vite process bundles only the island code into `@mp/islands.js`
3. **Runtime**: The client loads `@mp/islands.js` and hydrates each island by its `data-mp-island` attribute

## Declaring Islands

In your theme definition:

```ts
export default defineTheme({
  name: '@mineproj/my-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## Island Components

Island components are registered in the theme's island registry:

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

## Server Rendering

During SSR, islands are rendered as:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- Server-rendered HTML -->
  <button>Toggle theme</button>
</div>
```

## Client Hydration

The islands runtime (`@mineproj/client`) finds all `[data-mp-island]` elements and hydrates them:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## Conditional Loading

Islands are only loaded on pages that use them. The pipeline checks which islands are present on each page and only includes the bundle when needed.

## No-JS Fallback

Pages without islands don't load the island bundle at all. This means static content pages have zero JavaScript.
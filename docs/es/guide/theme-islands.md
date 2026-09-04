# Islas de Temas

Las islas son componentes React interactivos que se pre-renderizan en el servidor y se hidratan en el cliente. Esta arquitectura te brinda una rica interactividad sin enviar un paquete completo de JavaScript a cada página.

## Cómo Funcionan las Islas

1. **Tiempo de compilación**: El tema renderiza las islas como HTML con propiedades serializadas
2. **Tiempo de empaquetado**: Un proceso Vite separado empaqueta solo el código de la isla en `@mp/islands.js`
3. **Tiempo de ejecución**: El cliente carga `@mp/islands.js` e hidrata cada isla mediante su atributo `data-mp-island`

## Declarar Islas

En la definición de tu tema:

```ts
export default defineTheme({
  name: '@mineproj/my-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## Componentes de Isla

Los componentes de isla se registran en el registro de islas del tema:

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

## Renderizado del Servidor

Durante SSR, las islas se renderizan como:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- HTML renderizado por el servidor -->
  <button>Toggle theme</button>
</div>
```

## Hidratación del Cliente

El runtime de islas (`@mineproj/client`) encuentra todos los elementos `[data-mp-island]` y los hidrata:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## Carga Condicional

Las islas solo se cargan en las páginas que las utilizan. El pipeline verifica qué islas están presentes en cada página y solo incluye el paquete cuando es necesario.

## Respaldo Sin JavaScript

Las páginas sin islas no cargan el paquete de islas en absoluto. Esto significa que las páginas de contenido estático tienen cero JavaScript.
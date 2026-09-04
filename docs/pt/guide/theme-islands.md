# Islands de Temas

Islands são componentes React interativos que são pré-renderizados no servidor e hidratados no cliente. Esta arquitetura oferece interatividade rica sem enviar um bundle JavaScript completo para cada página.

## Como Funcionam as Islands

1. **Tempo de build**: O tema renderiza islands como HTML com props serializadas
2. **Tempo de bundle**: Um processo Vite separado empacota apenas o código da island em `@mp/islands.js`
3. **Tempo de execução**: O cliente carrega `@mp/islands.js` e hidrata cada island pelo seu atributo `data-mp-island`

## Declarando Islands

Na definição do seu tema:

```ts
export default defineTheme({
  name: '@mineproj/meu-tema',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## Componentes Island

Componentes island são registrados no registro de islands do tema:

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

## Renderização no Servidor

Durante SSR, as islands são renderizadas como:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- HTML renderizado no servidor -->
  <button>Alternar tema</button>
</div>
```

## Hidratação no Cliente

O runtime de islands (`@mineproj/client`) encontra todos os elementos `[data-mp-island]` e os hidrata:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## Carregamento Condicional

Islands são carregadas apenas nas páginas que as utilizam. O pipeline verifica quais islands estão presentes em cada página e só inclui o bundle quando necessário.

## Fallback Sem JS

Páginas sem islands não carregam o bundle de islands. Isso significa que páginas de conteúdo estático têm zero JavaScript.
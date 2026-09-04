# Острова тем

Острова — это интерактивные React-компоненты, которые предварительно рендерятся на сервере и гидратируются на клиенте. Эта архитектура обеспечивает богатую интерактивность без необходимости загружать полный JavaScript-бандл на каждую страницу.

## Как работают острова

1. **Время сборки**: Тема рендерит острова как HTML с сериализованными пропсами
2. **Время бандлинга**: Отдельный процесс Vite собирает только код островов в `@mp/islands.js`
3. **Время выполнения**: Клиент загружает `@mp/islands.js` и гидратирует каждый остров по его атрибуту `data-mp-island`

## Объявление островов

В определении вашей темы:

```ts
export default defineTheme({
  name: '@mineproj/my-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## Компоненты островов

Компоненты островов регистрируются в реестре островов темы:

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

## Серверный рендеринг

Во время SSR острова рендерятся как:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- Серверный HTML -->
  <button>Toggle theme</button>
</div>
```

## Клиентская гидратация

Среда выполнения островов (`@mineproj/client`) находит все элементы `[data-mp-island]` и гидратирует их:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## Условная загрузка

Острова загружаются только на тех страницах, где они используются. Конвейер проверяет, какие острова присутствуют на каждой странице, и включает бандл только при необходимости.

## Откат без JavaScript

Страницы без островов вообще не загружают бандл островов. Это означает, что страницы со статическим содержимым не имеют JavaScript.
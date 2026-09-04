# 테마 아일랜드

아일랜드는 서버에서 사전 렌더링되고 클라이언트에서 하이드레이션되는 대화형 React 컴포넌트입니다. 이 아키텍처는 모든 페이지에 전체 JavaScript 번들을 제공하지 않으면서도 풍부한 상호작용성을 제공합니다.

## 아일랜드 작동 방식

1. **빌드 시간**: 테마가 아일랜드를 직렬화된 props와 함께 HTML로 렌더링합니다
2. **번들 시간**: 별도의 Vite 프로세스가 아일랜드 코드만 `@mp/islands.js`로 번들링합니다
3. **런타임**: 클라이언트가 `@mp/islands.js`를 로드하고 `data-mp-island` 속성으로 각 아일랜드를 하이드레이션합니다

## 아일랜드 선언하기

테마 정의에서:

```ts
export default defineTheme({
  name: '@mineproj/my-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## 아일랜드 컴포넌트

아일랜드 컴포넌트는 테마의 아일랜드 레지스트리에 등록됩니다:

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

## 서버 렌더링

SSR 중에 아일랜드는 다음과 같이 렌더링됩니다:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- Server-rendered HTML -->
  <button>Toggle theme</button>
</div>
```

## 클라이언트 하이드레이션

아일랜드 런타임(`@mineproj/client`)이 모든 `[data-mp-island]` 요소를 찾아 하이드레이션합니다:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## 조건부 로딩

아일랜드는 해당 아일랜드를 사용하는 페이지만 로드됩니다. 파이프라인은 각 페이지에 어떤 아일랜드가 존재하는지 확인하고 필요한 경우에만 번들을 포함합니다.

## No-JS 폴백

아일랜드가 없는 페이지는 아일랜드 번들을 전혀 로드하지 않습니다. 따라서 정적 콘텐츠 페이지는 JavaScript가 전혀 없습니다.

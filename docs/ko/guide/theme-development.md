# 테마 개발

mineproj 테마는 사이트의 룩앤필을 제어하는 npm 패키지입니다.

## 테마 계약

테마는 다음 속성을 가진 객체입니다:

| 속성 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `name` | `string` | ✅ | 고유 테마 이름 |
| `layouts` | `Record<string, Component>` | ✅ | 각 경로 유형에 대한 레이아웃 |
| `components` | `Record<string, Component>` | 선택 | 재사용 가능한 컴포넌트 |
| `slots` | `string[]` | 선택 | 명명된 삽입 지점 |
| `configSchema` | `ZodSchema` | 선택 | themeConfig를 위한 스키마 |
| `locales` | `Record<string, Record<string, string>>` | 선택 | UI 번역 딕셔너리 |
| `styles` | `string[]` | 선택 | 모든 페이지 head에 인라인되는 CSS 문자열 |
| `headScripts` | `string[]` | 선택 | 페이지 head에 삽입되는 인라인 스크립트 |
| `islands` | `Record<string, Component>` | 선택 | 클라이언트에서 하이드레이션되는 대화형 컴포넌트 |
| `extends` | `Theme \| string` | 선택 | 상속할 부모 테마 |

## 예제

```ts
import { defineTheme } from '@mineproj/core';

const theme = defineTheme({
  name: 'my-theme',
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

## 로컬 테마 사용하기

`.mineproj/theme/index.mts` 파일을 생성하세요:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

그런 다음 설정에서 `theme: '.mineproj/theme'`를 설정하세요.

## 레이아웃

일곱 가지 필수 레이아웃 유형:

| 레이아웃 | 경로 | 목적 |
|---|---|---|
| `home` | `/` | 히어로, 추천 프로젝트, 그리드가 포함된 랜딩 페이지 |
| `list` | `/projects/` | 필터 가능한 프로젝트 그리드 |
| `detail` | `/projects/<slug>/` | 사이드바가 있는 프로젝트 상세 페이지 |
| `tag` | `/tags/<name>/` | 태그로 필터링된 프로젝트 |
| `collection` | `/collections/<slug>/` | 선별된 컬렉션 |
| `about` | `/about/` | 작성자 프로필 |
| `notFound` | `404.html` | 커스텀 404 페이지 |

## 아일랜드

대화형 컴포넌트는 아일랜드로 표시됩니다:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

테마에 등록:

```ts
const theme = defineTheme({
  name: 'my-theme',
  layouts: { ... },
  islands: { 'my-counter': MyCounter },
  islandsImport: 'my-theme/islands',
});
```

## 계약 테스트

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] if valid
```

## 게시

1. 패키지 이름을 `mineproj-theme-*` 또는 `@scope/mineproj-theme-*`로 지정하세요
2. package.json에 `"keywords": ["mineproj-theme"]`를 추가하세요
3. `runThemeContract`를 실행하여 검증하세요
4. npm에 게시하세요

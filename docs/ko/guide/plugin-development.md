# 플러그인 개발

mineproj 플러그인은 훅과 컴포넌트로 빌드 파이프라인을 확장합니다.

## 플러그인 계약

플러그인은 다음 속성을 가진 객체입니다:

| 속성 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `name` | `string` | ✅ | 고유 플러그인 이름 |
| `hooks` | `Record<string, Function>` | 선택 | 라이프사이클 훅 핸들러 |
| `vite` | `VitePlugin[]` | 선택 | 주입할 Vite 플러그인 |
| `components` | `Record<string, Component>` | 선택 | 등록할 컴포넌트 |
| `optionsSchema` | `ZodSchema` | 선택 | 플러그인 옵션을 위한 스키마 |
| `setup` | `Function` | 선택 | 설치 시점 훅 |

## 예제

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('Build complete!');
    },
  },
});
```

## 라이프사이클 훅

| 훅 | 타입 | 시그니처 | 호출 시점 |
|---|---|---|---|
| `config:resolved` | waterfall | `(config, ctx) => config` | 설정 로드 후 |
| `data:loaded` | seq | `(_, ctx) => void` | 데이터셋 로드 후 |
| `data:validated` | seq | `(_, ctx) => void` | 데이터 검증 후 |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | 경로 수집 후 |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | API 생성 전 |
| `render:before` | waterfall | `(html, ctx) => html` | 각 페이지 렌더링 전 |
| `emit` | seq | `(_, ctx) => void` | 모든 파일 작성 후 |
| `build:done` | seq | `(_, ctx) => void` | 빌드 완료 후 |

## 옵션이 있는 플러그인

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
      // </head> 전에 분석 스니펫 삽입
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## 플러그인 사용하기

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'My Site' }),
  ],
});
```

## 계약 테스트

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] if valid
```

## 게시

1. 패키지 이름을 `mineproj-plugin-*` 또는 `@mineproj/plugin-*`로 지정하세요
2. package.json에 `"keywords": ["mineproj-plugin"]`를 추가하세요
3. `runPluginContract`를 실행하여 검증하세요
4. npm에 게시하세요

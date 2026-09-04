# 설정

mineproj는 프로젝트 루트의 `mineproj.config.ts`를 통해 설정됩니다. 설정 파일은 `defineConfig()`로 생성된 설정 객체를 내보냅니다.

## 사이트 설정

```ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'My Portfolio',
    description: 'A showcase of my work',
    url: 'https://example.com',
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
    fallbackLocale: 'en',
    prefixAll: false,
    keywords: ['portfolio', 'projects'],
  },
  // ... theme, plugins, api
});
```

### 필드

| 필드 | 타입 | 기본값 | 설명 |
|-------|------|---------|-------------|
| `title` | `string` | 필수 | 사이트 제목 |
| `description` | `string` | `''` | 메타 태그용 사이트 설명 |
| `url` | `string` | `''` | 프로덕션 URL (SEO 플러그인에 필요) |
| `defaultLocale` | `string` | `'zh-CN'` | 기본 로케일 |
| `locales` | `string[]` | `['zh-CN']` | 활성화된 모든 로케일 |
| `fallbackLocale` | `string` | `undefined` | 번역되지 않은 콘텐츠의 대체 로케일 |
| `prefixAll` | `boolean` | `false` | 기본 로케일 URL에도 접두사 사용 |
| `keywords` | `string[]` | `[]` | SEO 키워드 |

## 테마 설정

```ts
export default defineConfig({
  theme: 'classic',            // 단축 이름, 패키지 이름, 또는 로컬 경로
  themeConfig: {               // 테마의 configSchema에 전달됨
    accent: '#2563EB',
    palette: 'neutral',
    colorMode: 'system',
    density: 'comfortable',
    contentWidth: 1280,
    cardStyle: 'grid',
    heroMode: 'hero',
    radius: 'md',
  },
});
```

## 플러그인 설정

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // 단축 이름
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // 옵션 포함
    {                          // 인라인 플러그인
      name: 'my-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // 일반 Vite 플러그인 통과
  ],
});
```

## API 전략

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## 경로

```ts
export default defineConfig({
  dataDir: 'data',        // 기본값: 'data'
  outDir: 'dist',         // 기본값: 'dist'
  publicDir: 'public',    // 기본값: 'public'
});

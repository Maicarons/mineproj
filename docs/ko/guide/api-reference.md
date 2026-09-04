# API 참조

mineproj는 `dist/api/v1/` 아래에 완전히 정적인 REST 유사 API를 생성합니다. 모든 엔드포인트는 정적 JSON을 제공합니다 -- 백엔드가 필요하지 않습니다.

## 응답 구조

모든 응답은 다음 구조를 따릅니다:

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": 1,
  "data": { ... }
}
```

## 엔드포인트

| 엔드포인트 | Kind | 설명 |
|----------|------|-------------|
| `/api/v1/projects.json` | ProjectList | 전체 프로젝트 목록 |
| `/api/v1/projects/<slug>.json` | Project | 단일 프로젝트 상세 |
| `/api/v1/tags.json` | TagList | 모든 태그와 개수 |
| `/api/v1/categories.json` | CategoryList | 모든 카테고리 |
| `/api/v1/collections.json` | CollectionList | 모든 컬렉션 |
| `/api/v1/profile.json` | Profile | 프로필 데이터 |
| `/api/v1/stats.json` | Stats | 집계 통계 |
| `/api/v1/search.json` | SearchIndex | MiniSearch 인덱스 |
| `/api/v1/feed.json` | Feed | 피드 항목 |
| `/api/v1/manifest.json` | Manifest | 자기 기술적 엔드포인트 목록 |

## 쿼리 파라미터 (개발 모드)

| 파라미터 | 예제 | 설명 |
|-------|---------|-------------|
| `q` | `?q=web` | 전체 텍스트 검색 |
| `tag` | `?tag=web,game` | 태그로 필터링 (AND) |
| `category` | `?category=web` | 카테고리로 필터링 |
| `status` | `?status=released` | 상태로 필터링 |
| `sort` | `?sort=createdAt:desc` | 정렬 필드 및 방향 |
| `page` | `?page=2` | 페이지 번호 |
| `pageSize` | `?pageSize=20` | 페이지당 항목 수 |
| `lang` | `?lang=en` | 지역화된 데이터의 로케일 |

## 클라이언트 SDK

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('my-project');
const results = await api.search('web');
```

React 훅:

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MyComponent() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Loading...' : data.length} projects</div>;
}
```

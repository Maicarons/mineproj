# مرجع API

يقوم mineproj بإنشاء API ثابت بالكامل شبيه بـ REST تحت `dist/api/v1/`. كل نقطة نهاية تخدم JSON ثابت — لا حاجة لخلفية.

## المغلف

كل استجابة تتبع هذا الهيكل:

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": 1,
  "data": { ... }
}
```

## نقاط النهاية

| نقطة النهاية | النوع (Kind) | الوصف |
|----------|------|-------------|
| `/api/v1/projects.json` | ProjectList | قائمة المشاريع الكاملة |
| `/api/v1/projects/<slug>.json` | Project | تفاصيل مشروع واحد |
| `/api/v1/tags.json` | TagList | جميع الوسوم مع الأعداد |
| `/api/v1/categories.json` | CategoryList | جميع الفئات |
| `/api/v1/collections.json` | CollectionList | جميع المجموعات |
| `/api/v1/profile.json` | Profile | بيانات الملف الشخصي |
| `/api/v1/stats.json` | Stats | إحصائيات مجمعة |
| `/api/v1/search.json` | SearchIndex | فهرس MiniSearch |
| `/api/v1/feed.json` | Feed | عناصر الخلاصة |
| `/api/v1/manifest.json` | Manifest | قائمة نقاط نهاية واصفة ذاتيًا |

## معاملات الاستعلام (وضع التطوير)

| المعامل | مثال | الوصف |
|-------|---------|-------------|
| `q` | `?q=web` | بحث نصي كامل |
| `tag` | `?tag=web,game` | تصفية حسب الوسوم (AND) |
| `category` | `?category=web` | تصفية حسب الفئة |
| `status` | `?status=released` | تصفية حسب الحالة |
| `sort` | `?sort=createdAt:desc` | حقل الفرز والاتجاه |
| `page` | `?page=2` | رقم الصفحة |
| `pageSize` | `?pageSize=20` | العناصر لكل صفحة |
| `lang` | `?lang=en` | اللغة للبيانات المترجمة |

## SDK الخاص بالعميل

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('my-project');
const results = await api.search('web');
```

خطافات React:

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MyComponent() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Loading...' : data.length} projects</div>;
}
```
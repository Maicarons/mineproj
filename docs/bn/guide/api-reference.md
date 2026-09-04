# API রেফারেন্স

mineproj `dist/api/v1/`-এর অধীনে একটি সম্পূর্ণ স্ট্যাটিক REST-সদৃশ API জেনারেট করে। প্রতিটি এন্ডপয়েন্ট স্ট্যাটিক JSON পরিবেশন করে — কোনো ব্যাকএন্ডের প্রয়োজন নেই।

## এনভেলপ

প্রত্যেক রেসপন্স এই কাঠামো অনুসরণ করে:

```json
{
  "apiVersion": "v1",
  "kind": "ProjectList",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": 1,
  "data": { ... }
}
```

## এন্ডপয়েন্ট

| এন্ডপয়েন্ট | কাইন্ড | বর্ণনা |
|----------|------|-------------|
| `/api/v1/projects.json` | ProjectList | সম্পূর্ণ প্রকল্প তালিকা |
| `/api/v1/projects/<slug>.json` | Project | একক প্রকল্পের বিস্তারিত |
| `/api/v1/tags.json` | TagList | সব ট্যাগ গণনা সহ |
| `/api/v1/categories.json` | CategoryList | সব ক্যাটাগরি |
| `/api/v1/collections.json` | CollectionList | সব কালেকশন |
| `/api/v1/profile.json` | Profile | প্রোফাইল ডেটা |
| `/api/v1/stats.json` | Stats | সমষ্টিগত পরিসংখ্যান |
| `/api/v1/search.json` | SearchIndex | MiniSearch সূচক |
| `/api/v1/feed.json` | Feed | ফিড আইটেম |
| `/api/v1/manifest.json` | Manifest | স্ব-বর্ণনাকারী এন্ডপয়েন্ট তালিকা |

## কুয়েরি প্যারামিটার (ডেভ মোড)

| প্যারাম | উদাহরণ | বর্ণনা |
|-------|---------|-------------|
| `q` | `?q=web` | পূর্ণ-পাঠ্য অনুসন্ধান |
| `tag` | `?tag=web,game` | ট্যাগ অনুসারে ফিল্টার (AND) |
| `category` | `?category=web` | ক্যাটাগরি অনুসারে ফিল্টার |
| `status` | `?status=released` | স্ট্যাটাস অনুসারে ফিল্টার |
| `sort` | `?sort=createdAt:desc` | সাজানোর ফিল্ড এবং দিক |
| `page` | `?page=2` | পৃষ্ঠা নম্বর |
| `pageSize` | `?pageSize=20` | প্রতি পৃষ্ঠায় আইটেম |
| `lang` | `?lang=en` | স্থানীয় ডেটার জন্য লোকেল |

## ক্লায়েন্ট SDK

```ts
import { createApiClient } from '@mineproj/client';

const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
const project = await api.getProject('my-project');
const results = await api.search('web');
```

React হুক:

```ts
import { useProjects, useProject, useTags, useSearch } from '@mineproj/client';

function MyComponent() {
  const { data, loading } = useProjects({ tag: 'web' });
  return <div>{loading ? 'Loading...' : data.length} projects</div>;
}
```
# কনফিগারেশন

mineproj আপনার প্রকল্পের রুটে `mineproj.config.ts`-এর মাধ্যমে কনফিগার করা হয়। কনফিগারেশন ফাইলটি `defineConfig()` দিয়ে তৈরি একটি কনফিগ অবজেক্ট এক্সপোর্ট করে।

## সাইট কনফিগারেশন

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

### ফিল্ডসমূহ

| ফিল্ড | টাইপ | ডিফল্ট | বর্ণনা |
|-------|------|---------|-------------|
| `title` | `string` | প্রয়োজনীয় | সাইটের শিরোনাম |
| `description` | `string` | `''` | মেটা ট্যাগের জন্য সাইটের বিবরণ |
| `url` | `string` | `''` | প্রোডাকশন URL (SEO প্লাগিনের জন্য প্রয়োজনীয়) |
| `defaultLocale` | `string` | `'zh-CN'` | ডিফল্ট লোকেল |
| `locales` | `string[]` | `['zh-CN']` | সকল সক্রিয় লোকেল |
| `fallbackLocale` | `string` | `undefined` | অনূদিত না হওয়া বিষয়বস্তুর জন্য ফলব্যাক |
| `prefixAll` | `boolean` | `false` | ডিফল্ট লোকেল URL-ও প্রিফিক্স করুন |
| `keywords` | `string[]` | `[]` | SEO কীওয়ার্ড |

## থিম কনফিগারেশন

```ts
export default defineConfig({
  theme: 'classic',            // সংক্ষিপ্ত নাম, বা প্যাকেজের নাম, বা লোকাল পাথ
  themeConfig: {               // থিমের configSchema-তে পাঠানো হয়
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

## প্লাগিন কনফিগারেশন

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // সংক্ষিপ্ত নাম
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // অপশন সহ
    {                          // ইনলাইন প্লাগিন
      name: 'my-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // খালি Vite প্লাগিন পাসথ্রু
  ],
});
```

## API কৌশল

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## পাথসমূহ

```ts
export default defineConfig({
  dataDir: 'data',        // ডিফল্ট: 'data'
  outDir: 'dist',         // ডিফল্ট: 'dist'
  publicDir: 'public',    // ডিফল্ট: 'public'
});
```
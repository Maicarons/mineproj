# الإعدادات

يتم إعداد mineproj عبر ملف `mineproj.config.ts` في جذر مشروعك. يقوم ملف الإعدادات بتصدير كائن إعدادات تم إنشاؤه باستخدام `defineConfig()`.

## إعدادات الموقع

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

### الحقول

| الحقل | النوع | الافتراضي | الوصف |
|-------|------|---------|-------------|
| `title` | `string` | مطلوب | عنوان الموقع |
| `description` | `string` | `''` | وصف الموقع لعلامات meta |
| `url` | `string` | `''` | رابط الإنتاج (مطلوب لإضافات SEO) |
| `defaultLocale` | `string` | `'zh-CN'` | اللغة الافتراضية |
| `locales` | `string[]` | `['zh-CN']` | جميع اللغات المفعلة |
| `fallbackLocale` | `string` | `undefined` | اللغة الاحتياطية للمحتوى غير المترجم |
| `prefixAll` | `boolean` | `false` | بادئة روابط اللغة الافتراضية أيضًا |
| `keywords` | `string[]` | `[]` | كلمات مفتاحية لـ SEO |

## إعدادات السمة

```ts
export default defineConfig({
  theme: 'classic',            // اختصار، أو اسم حزمة، أو مسار محلي
  themeConfig: {               // يُمرر إلى configSchema الخاص بالسمة
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

## إعدادات الإضافات

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',    // اختصار
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }], // مع خيارات
    {                          // إضافة مضمنة
      name: 'my-plugin',
      hooks: { 'render:before': async (html) => html },
    },
    'vite-plugin-pwa',         // تمرير إضافة Vite مباشرة
  ],
});
```

## استراتيجية API

```ts
export default defineConfig({
  api: {
    strategy: 'hybrid',     // 'client' | 'hybrid' | 'static'
    pageSize: 20,
    pregeneratedPages: 5,
  },
});
```

## المسارات

```ts
export default defineConfig({
  dataDir: 'data',        // الافتراضي: 'data'
  outDir: 'dist',         // الافتراضي: 'dist'
  publicDir: 'public',    // الافتراضي: 'public'
});
```
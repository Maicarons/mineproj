# تطوير الإضافات

إضافات mineproj توسع خط أنابيب البناء باستخدام الخطافات والمكونات.

## عقد الإضافة

الإضافة هي كائن بالخصائص التالية:

| الخاصية | النوع | مطلوب | الوصف |
|---------|------|------|-------------|
| `name` | `string` | ✅ | اسم فريد للإضافة |
| `hooks` | `Record<string, Function>` | اختياري | معالجات خطافات دورة الحياة |
| `vite` | `VitePlugin[]` | اختياري | إضافات Vite لحقنها |
| `components` | `Record<string, Component>` | اختياري | مكونات لتسجيلها |
| `optionsSchema` | `ZodSchema` | اختياري | مخطط لخيارات الإضافة |
| `setup` | `Function` | اختياري | خطاف وقت التثبيت |

## مثال

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

## خطافات دورة الحياة

| الخطاف | النوع | التوقيع | وقت الاستدعاء |
|-------|------|---------|-------------|
| `config:resolved` | waterfall | `(config, ctx) => config` | بعد تحميل الإعدادات |
| `data:loaded` | seq | `(_, ctx) => void` | بعد تحميل مجموعة البيانات |
| `data:validated` | seq | `(_, ctx) => void` | بعد التحقق من صحة البيانات |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | بعد جمع المسارات |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | قبل إصدار API |
| `render:before` | waterfall | `(html, ctx) => html` | قبل تقديم كل صفحة |
| `emit` | seq | `(_, ctx) => void` | بعد كتابة جميع الملفات |
| `build:done` | seq | `(_, ctx) => void` | بعد اكتمال البناء |

## إضافة مع خيارات

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
      // حقن مقتطف التحليلات قبل </head>
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## استخدام إضافة

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'My Site' }),
  ],
});
```

## اختبار العقد

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] إذا كان صحيحًا
```

## النشر

1. سمِّ حزمتك `mineproj-plugin-*` أو `@mineproj/plugin-*`
2. أضف `"keywords": ["mineproj-plugin"]` إلى ملف package.json
3. قم بتشغيل `runPluginContract` للتحقق من الصحة
4. انشر على npm
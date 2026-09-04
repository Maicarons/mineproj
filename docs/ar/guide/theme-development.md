# تطوير السمة

سمات mineproj هي حزم npm تتحكم في مظهر وشعور موقعك.

## عقد السمة

السمة هي كائن بالخصائص التالية:

| الخاصية | النوع | مطلوب | الوصف |
|---------|------|------|-------------|
| `name` | `string` | ✅ | اسم فريد للسمة |
| `layouts` | `Record<string, Component>` | ✅ | تخطيطات لكل نوع مسار |
| `components` | `Record<string, Component>` | اختياري | مكونات قابلة لإعادة الاستخدام |
| `slots` | `string[]` | اختياري | نقاط إدخال مسماة |
| `configSchema` | `ZodSchema` | اختياري | مخطط لـ themeConfig |
| `locales` | `Record<string, Record<string, string>>` | اختياري | قواميس ترجمة واجهة المستخدم |
| `styles` | `string[]` | اختياري | نصوص CSS تُدرج في رأس كل صفحة |
| `headScripts` | `string[]` | اختياري | نصوص برمجية مضمنة تُحقن في رأس الصفحة |
| `islands` | `Record<string, Component>` | اختياري | مكونات تفاعلية تُرطّب على العميل |
| `extends` | `Theme \| string` | اختياري | سمة أصل للوراثة منها |

## مثال

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

## استخدام سمة محلية

أنشئ ملف `.mineproj/theme/index.mts`:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

ثم اضبط `theme: '.mineproj/theme'` في إعداداتك.

## التخطيطات

أنواع التخطيطات السبعة المطلوبة:

| التخطيط | المسار | الغرض |
|-------|-------|---------|
| `home` | `/` | الصفحة الرئيسية مع قسم البطل، المشاريع المميزة، شبكة |
| `list` | `/projects/` | شبكة مشاريع قابلة للتصفية |
| `detail` | `/projects/<slug>/` | تفاصيل المشروع مع شريط جانبي |
| `tag` | `/tags/<name>/` | مشاريع مصفاة حسب الوسم |
| `collection` | `/collections/<slug>/` | مجموعة منسقة |
| `about` | `/about/` | الملف الشخصي للمؤلف |
| `notFound` | `404.html` | صفحة 404 مخصصة |

## الجزر (Islands)

يتم تمييز المكونات التفاعلية كجزر:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

سجلها في السمة:

```ts
const theme = defineTheme({
  name: 'my-theme',
  layouts: { ... },
  islands: { 'my-counter': MyCounter },
  islandsImport: 'my-theme/islands',
});
```

## اختبار العقد

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] إذا كان صحيحًا
```

## النشر

1. سمِّ حزمتك `mineproj-theme-*` أو `@scope/mineproj-theme-*`
2. أضف `"keywords": ["mineproj-theme"]` إلى ملف package.json
3. قم بتشغيل `runThemeContract` للتحقق من الصحة
4. انشر على npm
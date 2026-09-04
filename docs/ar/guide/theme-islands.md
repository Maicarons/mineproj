# جزر السمة (Theme Islands)

الجزر هي مكونات React تفاعلية يتم تقديمها مسبقًا على الخادم وترطيبها على العميل. تمنحك هذه البنية تفاعلية غنية دون شحن حزمة JavaScript كاملة إلى كل صفحة.

## كيفية عمل الجزر

1. **وقت البناء**: تقوم السمة بتقديم الجزر كـ HTML مع خصائص مسلسلة
2. **وقت التجميع**: تقوم عملية Vite منفصلة بتجميع كود الجزيرة فقط في `@mp/islands.js`
3. **وقت التشغيل**: يقوم العميل بتحميل `@mp/islands.js` ويرطب كل جزيرة باستخدام سمة `data-mp-island` الخاصة بها

## تعريف الجزر

في تعريف السمة الخاصة بك:

```ts
export default defineTheme({
  name: '@mineproj/my-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## مكونات الجزر

يتم تسجيل مكونات الجزر في سجل جزر السمة:

```tsx
// src/islands.tsx
import { ThemeToggle } from './components/ThemeToggle';
import { SearchPalette } from './components/SearchPalette';
import { LibraryExplorer } from './components/LibraryExplorer';

export default {
  'theme-toggle': ThemeToggle,
  'search-palette': SearchPalette,
  'library-explorer': LibraryExplorer,
};
```

## التقديم من الخادم

أثناء SSR، يتم تقديم الجزر على النحو التالي:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- HTML المقدم من الخادم -->
  <button>Toggle theme</button>
</div>
```

## ترطيب العميل

يقوم نظام تشغيل الجزر (`@mineproj/client`) بالعثور على جميع عناصر `[data-mp-island]` وترطيبها:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## التحميل الشرطي

يتم تحميل الجزر فقط على الصفحات التي تستخدمها. تتحقق خط الأنابيب من أي الجزر موجودة في كل صفحة وتقوم بتضمين الحزمة فقط عند الحاجة.

## الرجوع الاحتياطي بدون JavaScript

الصفحات التي لا تحتوي على جزر لا تقوم بتحميل حزمة الجزر على الإطلاق. هذا يعني أن صفحات المحتوى الثابت لا تحتوي على أي JavaScript.
# البدء

مرحبًا بك في mineproj! سيساعدك هذا الدليل في إنشاء أول موقع محفظة مشاريع لك.

## المتطلبات الأساسية

- **Node.js** 22 أو أحدث
- **pnpm** 10 (قم بالتثبيت عبر `npm install -g pnpm`)

## إنشاء موقع جديد

أسرع طريقة للبدء هي باستخدام أداة السقالات:

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

افتح `http://localhost:5173` في متصفحك لمشاهدة موقعك.

## هيكل المشروع

```
my-portfolio/
├─ mineproj.config.ts      # إعدادات الموقع
├─ data/
│  ├─ projects/             # بيانات المشاريع (JSON + Markdown)
│  │  └─ my-project/
│  │     ├─ index.json      # بيانات وصفية للمشروع
│  │     └─ body.md         # محتوى المشروع
│  ├─ profile.json          # ملفك الشخصي
│  └─ tags.json             # تعريفات الوسوم
├─ public/                  # الأصول الثابتة (صور، PDF، إلخ)
└─ dist/                    # مخرجات البناء (مولدة)
```

## إضافة مشروع

أنشئ دليلًا جديدًا تحت `data/projects/`:

```bash
mineproj new my-project
```

سيؤدي هذا إلى إنشاء `data/projects/my-project/index.json` و `data/projects/my-project/body.md`. قم بتعديل ملف JSON لتعيين البيانات الوصفية للمشروع.

## البناء للإنتاج

```bash
pnpm build
```

المخرجات تذهب إلى `dist/`. يمكنك معاينتها محليًا:

```bash
pnpm preview
```

## الخطوات التالية

- [دليل الإعدادات](./configuration) — مرجع كامل للإعدادات
- [نموذج البيانات](./data-model) — فهم مخطط المشروع
- [تطوير السمة](./theme-development) — تخصيص المظهر والشعور
- [تطوير الإضافة](./plugin-development) — توسيع الوظائف
- [النشر](./deploying) — نشر موقعك إلى الإنتاج
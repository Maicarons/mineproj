# مرجع CLI

توفر واجهة سطر الأوامر `mineproj` جميع الأوامر لبناء وتطوير وإدارة موقعك.

## الاستخدام

```bash
mineproj <command> [options]
```

## الأوامر

### `dev`

بدء خادم التطوير.

```bash
mineproj dev [--port <n>] [--host <host>] [--open] [--editor]
```

### `build`

بناء الموقع الثابت.

```bash
mineproj build [--outDir <dir>]
```

### `preview`

معاينة الموقع المبني.

```bash
mineproj preview [--port <n>] [--host <host>]
```

### `check`

التحقق من صحة ملفات الإعدادات والبيانات.

```bash
mineproj check [--i18n]
```

### `new <slug>`

إنشاء هيكل مشروع جديد.

```bash
mineproj new my-project
```

### `audit`

تقييم الموقع المبني من حيث SEO، AI، إمكانية الوصول، والأداء.

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

تشخيص البيئة والإعدادات وحالة المشروع.

```bash
mineproj doctor
```

### `info`

عرض تشخيصات الإعدادات والسمة والإضافات المحلولة.

```bash
mineproj info
```

### `theme:eject`

نسخ السمة الحالية إلى `.mineproj/theme/` للتخصيص.

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

إنشاء هيكل للغة جديدة.

```bash
mineproj i18n:init en
```

### `i18n:extract`

استخراج المفاتيح غير المترجمة لكل لغة.

```bash
mineproj i18n:extract
```

### `editor:export`

تصدير مسودات المحرر كتصحيحات JSON.

```bash
mineproj editor:export
```

### `migrate`

ترحيل إصدار المخطط والنسخ الاحتياطي.

```bash
mineproj migrate
```

## الخيارات العامة

| الخيار | الوصف |
|--------|-------------|
| `--root <dir>` | دليل جذر الموقع |
| `--config <path>` | مسار ملف الإعدادات الصريح |
| `--outDir <dir>` | تجاوز دليل المخرجات |
| `--port <n>` | منفذ خادم التطوير/المعاينة |
| `--host <host>` | مضيف خادم التطوير/المعاينة |
| `--open` | فتح المتصفح بعد البدء |
| `--editor` | تمكين المحرر المرئي (التطوير فقط) |
| `--fail-under <n>` | الحد الأدنى لدرجة التدقيق (الافتراضي 85) |
| `-h, --help` | عرض المساعدة |
| `-v, --version` | عرض الإصدار |
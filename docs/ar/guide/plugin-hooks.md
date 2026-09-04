# خطافات دورة حياة الإضافة

توثق هذه الصفحة كل خطاف من خطافات دورة الحياة بالتفصيل.

## `config:resolved` (waterfall)

يُستدعى بعد حل الإعدادات بالكامل. يستقبل كائن الإعدادات ويمكنه تعديله.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (modified)';
  return config;
}
```

## `data:loaded` (seq)

يُستدعى بعد تحميل جميع البيانات. لا يستقبل شيئًا ولكن السياق يحتوي على مجموعة البيانات الكاملة.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Loaded ${dataset.projects.length} projects`);
}
```

## `data:validated` (seq)

يُستدعى بعد التحقق من صحة البيانات. استخدم هذا لمنطق التحقق المخصص.

```ts
'data:validated': async (_, ctx) => {
  // تحقق مخصص
}
```

## `assets:process` (seq)

يُستدعى قبل معالجة الأصول. استخدم هذا لتعديل أو نسخ الأصول.

```ts
'assets:process': async (_, ctx) => {
  // معالجة الأصول
}
```

## `routes:collect` (waterfall)

يُستدعى أثناء جمع المسارات. يمكن إضافة أو إزالة أو تعديل المسارات.

```ts
'routes:collect': async (routes) => {
  routes.push({
    path: '/custom/',
    layout: 'detail',
    title: 'Custom Page',
  });
  return routes;
}
```

## `api:endpoints` (waterfall)

يُستدعى قبل توليد نقاط نهاية API. يمكن إضافة نقاط نهاية مخصصة.

```ts
'api:endpoints': async (endpoints) => {
  endpoints.push({
    path: 'custom.json',
    generate: async (ctx) => ({ data: 'custom' }),
  });
  return endpoints;
}
```

## `render:before` (waterfall)

يُستدعى قبل تقديم كل صفحة. يستقبل سلسلة HTML ويمكنه تعديلها. هذا هو الخطاف الأساسي لحقن المحتوى في `<head>`.

```ts
'render:before': async (html, ctx) => {
  const { route } = ctx;
  return html.replace(
    '</head>',
    `<meta name="custom" content="${route.slug}">\n</head>`
  );
}
```

## `emit` (seq)

يُستدعى أثناء مرحلة الإصدار. استخدم هذا لكتابة ملفات إضافية إلى دليل المخرجات.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'value' }));
}
```

## `build:done` (seq)

يُستدعى بعد اكتمال البناء. استخدم هذا للتنظيف أو الإشعارات أو التقارير.

```ts
'build:done': async () => {
  console.log('Build finished!');
}
```
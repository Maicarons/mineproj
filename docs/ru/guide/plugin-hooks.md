# Хуки жизненного цикла плагинов

На этой странице документирован каждый хук жизненного цикла в деталях.

## `config:resolved` (waterfall)

Вызывается после полного разрешения конфигурации. Получает объект конфигурации и может его изменять.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (изменено)';
  return config;
}
```

## `data:loaded` (seq)

Вызывается после загрузки всех данных. Ничего не получает, но контекст содержит полный набор данных.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Загружено ${dataset.projects.length} проектов`);
}
```

## `data:validated` (seq)

Вызывается после проверки данных. Используйте это для пользовательской логики валидации.

```ts
'data:validated': async (_, ctx) => {
  // Пользовательская валидация
}
```

## `assets:process` (seq)

Вызывается перед обработкой ресурсов. Используйте это для изменения или копирования ресурсов.

```ts
'assets:process': async (_, ctx) => {
  // Обработка ресурсов
}
```

## `routes:collect` (waterfall)

Вызывается во время сбора маршрутов. Может добавлять, удалять или изменять маршруты.

```ts
'routes:collect': async (routes) => {
  routes.push({
    path: '/custom/',
    layout: 'detail',
    title: 'Пользовательская страница',
  });
  return routes;
}
```

## `api:endpoints` (waterfall)

Вызывается перед генерацией конечных точек API. Может добавлять пользовательские конечные точки.

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

Вызывается перед рендерингом каждой страницы. Получает HTML-строку и может её изменять. Это основной хук для внедрения содержимого в `<head>`.

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

Вызывается во время фазы эмиссии. Используйте это для записи дополнительных файлов в выходную директорию.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'value' }));
}
```

## `build:done` (seq)

Вызывается после завершения сборки. Используйте это для очистки, уведомлений или отчётов.

```ts
'build:done': async () => {
  console.log('Сборка завершена!');
}
```
# Plugin Lifecycle Hooks

This page documents each lifecycle hook in detail.

## `config:resolved` (waterfall)

Called after the configuration is fully resolved. Receives the config object and can modify it.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (modified)';
  return config;
}
```

## `data:loaded` (seq)

Called after all data is loaded. Receives nothing but the context has the full dataset.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Loaded ${dataset.projects.length} projects`);
}
```

## `data:validated` (seq)

Called after data validation. Use this for custom validation logic.

```ts
'data:validated': async (_, ctx) => {
  // Custom validation
}
```

## `assets:process` (seq)

Called before asset processing. Use this to modify or copy assets.

```ts
'assets:process': async (_, ctx) => {
  // Process assets
}
```

## `routes:collect` (waterfall)

Called during route collection. Can add, remove, or modify routes.

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

Called before API endpoint generation. Can add custom endpoints.

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

Called before each page is rendered. Receives the HTML string and can modify it. This is the primary hook for injecting content into `<head>`.

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

Called during the emit phase. Use this to write additional files to the output directory.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'value' }));
}
```

## `build:done` (seq)

Called after the build completes. Use this for cleanup, notifications, or reporting.

```ts
'build:done': async () => {
  console.log('Build finished!');
}
```
# Hooks del Ciclo de Vida de Plugins

Esta página documenta cada hook del ciclo de vida en detalle.

## `config:resolved` (waterfall)

Se llama después de que la configuración se ha resuelto completamente. Recibe el objeto de configuración y puede modificarlo.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (modificado)';
  return config;
}
```

## `data:loaded` (seq)

Se llama después de que todos los datos se han cargado. No recibe nada, pero el contexto tiene el conjunto de datos completo.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Cargados ${dataset.projects.length} proyectos`);
}
```

## `data:validated` (seq)

Se llama después de la validación de datos. Úsalo para lógica de validación personalizada.

```ts
'data:validated': async (_, ctx) => {
  // Validación personalizada
}
```

## `assets:process` (seq)

Se llama antes del procesamiento de activos. Úsalo para modificar o copiar activos.

```ts
'assets:process': async (_, ctx) => {
  // Procesar activos
}
```

## `routes:collect` (waterfall)

Se llama durante la recopilación de rutas. Puede añadir, eliminar o modificar rutas.

```ts
'routes:collect': async (routes) => {
  routes.push({
    path: '/custom/',
    layout: 'detail',
    title: 'Página Personalizada',
  });
  return routes;
}
```

## `api:endpoints` (waterfall)

Se llama antes de la generación de endpoints de API. Puede añadir endpoints personalizados.

```ts
'api:endpoints': async (endpoints) => {
  endpoints.push({
    path: 'custom.json',
    generate: async (ctx) => ({ data: 'personalizado' }),
  });
  return endpoints;
}
```

## `render:before` (waterfall)

Se llama antes de renderizar cada página. Recibe la cadena HTML y puede modificarla. Este es el hook principal para inyectar contenido en `<head>`.

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

Se llama durante la fase de emisión. Úsalo para escribir archivos adicionales en el directorio de salida.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'valor' }));
}
```

## `build:done` (seq)

Se llama después de que la compilación se completa. Úsalo para limpieza, notificaciones o informes.

```ts
'build:done': async () => {
  console.log('¡Compilación finalizada!');
}
```
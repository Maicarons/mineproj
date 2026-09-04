# Hooks de Ciclo de Vida de Plugins

Esta página documenta cada hook de ciclo de vida em detalhes.

## `config:resolved` (waterfall)

Chamado após a configuração ser totalmente resolvida. Recebe o objeto de configuração e pode modificá-lo.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (modificado)';
  return config;
}
```

## `data:loaded` (seq)

Chamado após todos os dados serem carregados. Não recebe nada, mas o contexto tem o conjunto completo de dados.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Carregados ${dataset.projects.length} projetos`);
}
```

## `data:validated` (seq)

Chamado após a validação dos dados. Use para lógica de validação personalizada.

```ts
'data:validated': async (_, ctx) => {
  // Validação personalizada
}
```

## `assets:process` (seq)

Chamado antes do processamento de ativos. Use para modificar ou copiar ativos.

```ts
'assets:process': async (_, ctx) => {
  // Processar ativos
}
```

## `routes:collect` (waterfall)

Chamado durante a coleta de rotas. Pode adicionar, remover ou modificar rotas.

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

Chamado antes da geração de endpoints da API. Pode adicionar endpoints personalizados.

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

Chamado antes de cada página ser renderizada. Recebe a string HTML e pode modificá-la. Este é o hook principal para injetar conteúdo no `<head>`.

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

Chamado durante a fase de emissão. Use para escrever arquivos adicionais no diretório de saída.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'valor' }));
}
```

## `build:done` (seq)

Chamado após a conclusão da build. Use para limpeza, notificações ou relatórios.

```ts
'build:done': async () => {
  console.log('Build finalizada!');
}
```
# Hooks de Cycle de Vie des Plugins

Cette page documente chaque hook de cycle de vie en détail.

## `config:resolved` (waterfall)

Appelé après que la configuration est entièrement résolue. Reçoit l'objet de configuration et peut le modifier.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (modifié)';
  return config;
}
```

## `data:loaded` (seq)

Appelé après que toutes les données sont chargées. Ne reçoit rien mais le contexte contient l'ensemble complet des données.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Chargé ${dataset.projects.length} projets`);
}
```

## `data:validated` (seq)

Appelé après la validation des données. Utilisez ceci pour une logique de validation personnalisée.

```ts
'data:validated': async (_, ctx) => {
  // Validation personnalisée
}
```

## `assets:process` (seq)

Appelé avant le traitement des assets. Utilisez ceci pour modifier ou copier des assets.

```ts
'assets:process': async (_, ctx) => {
  // Traiter les assets
}
```

## `routes:collect` (waterfall)

Appelé lors de la collecte des routes. Peut ajouter, supprimer ou modifier des routes.

```ts
'routes:collect': async (routes) => {
  routes.push({
    path: '/personnalise/',
    layout: 'detail',
    title: 'Page Personnalisée',
  });
  return routes;
}
```

## `api:endpoints` (waterfall)

Appelé avant la génération des points de terminaison API. Peut ajouter des points de terminaison personnalisés.

```ts
'api:endpoints': async (endpoints) => {
  endpoints.push({
    path: 'personnalise.json',
    generate: async (ctx) => ({ data: 'personnalisé' }),
  });
  return endpoints;
}
```

## `render:before` (waterfall)

Appelé avant le rendu de chaque page. Reçoit la chaîne HTML et peut la modifier. C'est le hook principal pour injecter du contenu dans `<head>`.

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

Appelé pendant la phase d'émission. Utilisez ceci pour écrire des fichiers supplémentaires dans le répertoire de sortie.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('personnalise/data.json', JSON.stringify({ key: 'value' }));
}
```

## `build:done` (seq)

Appelé après la fin de la construction. Utilisez ceci pour le nettoyage, les notifications ou les rapports.

```ts
'build:done': async () => {
  console.log('Construction terminée !');
}
```
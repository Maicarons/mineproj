# Plugin Development

mineproj plugins extend the build pipeline with hooks and components.

## Plugin Contract

A plugin is an object with:

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Unique plugin name |
| `hooks` | `Record<string, Function>` | Optional | Lifecycle hook handlers |
| `vite` | `VitePlugin[]` | Optional | Vite plugins to inject |
| `components` | `Record<string, Component>` | Optional | Components to register |
| `optionsSchema` | `ZodSchema` | Optional | Schema for plugin options |
| `setup` | `Function` | Optional | Install-time hook |

## Example

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('Build complete!');
    },
  },
});
```

## Lifecycle Hooks

| Hook | Type | Signature | Called When |
|---|---|---|---|
| `config:resolved` | waterfall | `(config, ctx) => config` | After config is loaded |
| `data:loaded` | seq | `(_, ctx) => void` | After dataset loads |
| `data:validated` | seq | `(_, ctx) => void` | After data validation |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | After routes are collected |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | Before API emission |
| `render:before` | waterfall | `(html, ctx) => html` | Before each page render |
| `emit` | seq | `(_, ctx) => void` | After all files are written |
| `build:done` | seq | `(_, ctx) => void` | After build completes |

## Plugin with Options

```ts
import { z } from 'zod';
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: '@mineproj/plugin-analytics',
  optionsSchema: z.object({
    provider: z.enum(['umami', 'plausible', 'ga']),
    id: z.string(),
  }),
  hooks: {
    'render:before': (html, ctx) => {
      // Inject analytics snippet before </head>
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## Using a Plugin

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'My Site' }),
  ],
});
```

## Contract Testing

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] if valid
```

## Publishing

1. Name your package `mineproj-plugin-*` or `@mineproj/plugin-*`
2. Add `"keywords": ["mineproj-plugin"]` to package.json
3. Run `runPluginContract` to validate
4. Publish to npm
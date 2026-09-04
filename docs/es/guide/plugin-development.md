# Desarrollo de Plugins

Los plugins de mineproj extienden el pipeline de compilación con hooks y componentes.

## Contrato del Plugin

Un plugin es un objeto con:

| Propiedad | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | `string` | ✅ | Nombre único del plugin |
| `hooks` | `Record<string, Function>` | Opcional | Manejadores de hooks del ciclo de vida |
| `vite` | `VitePlugin[]` | Opcional | Plugins de Vite a inyectar |
| `components` | `Record<string, Component>` | Opcional | Componentes a registrar |
| `optionsSchema` | `ZodSchema` | Opcional | Esquema para opciones del plugin |
| `setup` | `Function` | Opcional | Hook de instalación |

## Ejemplo

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('¡Compilación completada!');
    },
  },
});
```

## Hooks del Ciclo de Vida

| Hook | Tipo | Firma | Cuándo se Llama |
|---|---|---|---|
| `config:resolved` | waterfall | `(config, ctx) => config` | Después de cargar la configuración |
| `data:loaded` | seq | `(_, ctx) => void` | Después de cargar el conjunto de datos |
| `data:validated` | seq | `(_, ctx) => void` | Después de la validación de datos |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | Después de recopilar las rutas |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | Antes de la emisión de la API |
| `render:before` | waterfall | `(html, ctx) => html` | Antes de renderizar cada página |
| `emit` | seq | `(_, ctx) => void` | Después de escribir todos los archivos |
| `build:done` | seq | `(_, ctx) => void` | Después de completar la compilación |

## Plugin con Opciones

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
      // Inyectar fragmento de analytics antes de </head>
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## Usar un Plugin

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'Mi Sitio' }),
  ],
});
```

## Pruebas de Contrato

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] si es válido
```

## Publicación

1. Nombra tu paquete `mineproj-plugin-*` o `@mineproj/plugin-*`
2. Añade `"keywords": ["mineproj-plugin"]` a package.json
3. Ejecuta `runPluginContract` para validar
4. Publica en npm
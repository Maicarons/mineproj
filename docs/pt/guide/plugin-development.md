# Desenvolvimento de Plugins

Os plugins do mineproj estendem o pipeline de build com hooks e componentes.

## Contrato do Plugin

Um plugin é um objeto com:

| Propriedade | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | `string` | ✅ | Nome único do plugin |
| `hooks` | `Record<string, Function>` | Opcional | Manipuladores de hooks de ciclo de vida |
| `vite` | `VitePlugin[]` | Opcional | Plugins Vite para injetar |
| `components` | `Record<string, Component>` | Opcional | Componentes para registrar |
| `optionsSchema` | `ZodSchema` | Opcional | Esquema para opções do plugin |
| `setup` | `Function` | Opcional | Hook de instalação |

## Exemplo

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('Build concluída!');
    },
  },
});
```

## Hooks de Ciclo de Vida

| Hook | Tipo | Assinatura | Chamado Quando |
|---|---|---|---|
| `config:resolved` | waterfall | `(config, ctx) => config` | Após a configuração ser carregada |
| `data:loaded` | seq | `(_, ctx) => void` | Após o carregamento dos dados |
| `data:validated` | seq | `(_, ctx) => void` | Após a validação dos dados |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | Após a coleta de rotas |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | Antes da emissão da API |
| `render:before` | waterfall | `(html, ctx) => html` | Antes da renderização de cada página |
| `emit` | seq | `(_, ctx) => void` | Após todos os arquivos serem escritos |
| `build:done` | seq | `(_, ctx) => void` | Após a conclusão da build |

## Plugin com Opções

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
      // Injetar snippet de analytics antes de </head>
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## Usando um Plugin

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'Meu Site' }),
  ],
});
```

## Teste de Contrato

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(meuPlugin);
console.log(result.errors); // [] se válido
```

## Publicação

1. Nomeie seu pacote `mineproj-plugin-*` ou `@mineproj/plugin-*`
2. Adicione `"keywords": ["mineproj-plugin"]` ao package.json
3. Execute `runPluginContract` para validar
4. Publique no npm
# Desenvolvimento de Temas

Os temas do mineproj são pacotes npm que controlam a aparência do seu site.

## Contrato do Tema

Um tema é um objeto com as seguintes propriedades:

| Propriedade | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | `string` | ✅ | Nome único do tema |
| `layouts` | `Record<string, Component>` | ✅ | Layouts para cada tipo de rota |
| `components` | `Record<string, Component>` | Opcional | Componentes reutilizáveis |
| `slots` | `string[]` | Opcional | Pontos de inserção nomeados |
| `configSchema` | `ZodSchema` | Opcional | Esquema para themeConfig |
| `locales` | `Record<string, Record<string, string>>` | Opcional | Dicionários de tradução da interface |
| `styles` | `string[]` | Opcional | Strings CSS inline no cabeçalho de cada página |
| `headScripts` | `string[]` | Opcional | Scripts inline injetados no cabeçalho da página |
| `islands` | `Record<string, Component>` | Opcional | Componentes interativos hidratados no cliente |
| `extends` | `Theme \| string` | Opcional | Tema pai do qual herdar |

## Exemplo

```ts
import { defineTheme } from '@mineproj/core';

const theme = defineTheme({
  name: 'meu-tema',
  layouts: {
    home: ({ data, config }) => (
      <main>
        <h1>{config.title}</h1>
        <ul>
          {data.projects.map(p => <li key={p.slug}>{p.name}</li>)}
        </ul>
      </main>
    ),
  },
  styles: [`:root { --mp-color-accent: #ff5500; }`],
});

export default theme;
```

## Usando um tema local

Crie `.mineproj/theme/index.mts`:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

Em seguida, defina `theme: '.mineproj/theme'` na sua configuração.

## Layouts

Os sete tipos de layout obrigatórios:

| Layout | Rota | Propósito |
|--------|------|-----------|
| `home` | `/` | Página inicial com hero, projetos em destaque, grade |
| `list` | `/projects/` | Grade de projetos filtrável |
| `detail` | `/projects/<slug>/` | Detalhe do projeto com barra lateral |
| `tag` | `/tags/<name>/` | Projetos filtrados por tag |
| `collection` | `/collections/<slug>/` | Coleção curada |
| `about` | `/about/` | Perfil do autor |
| `notFound` | `404.html` | Página 404 personalizada |

## Islands

Componentes interativos são marcados como islands:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Registre no tema:

```ts
const theme = defineTheme({
  name: 'meu-tema',
  layouts: { ... },
  islands: { 'meu-contador': MyCounter },
  islandsImport: 'meu-tema/islands',
});
```

## Teste de Contrato

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(meuTema, { requireAllLayouts: true });
console.log(result.errors); // [] se válido
```

## Publicação

1. Nomeie seu pacote `mineproj-theme-*` ou `@scope/mineproj-theme-*`
2. Adicione `"keywords": ["mineproj-theme"]` ao package.json
3. Execute `runThemeContract` para validar
4. Publique no npm
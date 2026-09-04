# Theme Development

mineproj themes are npm packages that control the look and feel of your site.

## Theme Contract

A theme is an object with the following properties:

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Unique theme name |
| `layouts` | `Record<string, Component>` | ✅ | Layouts for each route type |
| `components` | `Record<string, Component>` | Optional | Reusable components |
| `slots` | `string[]` | Optional | Named insertion points |
| `configSchema` | `ZodSchema` | Optional | Schema for themeConfig |
| `locales` | `Record<string, Record<string, string>>` | Optional | UI translation dictionaries |
| `styles` | `string[]` | Optional | CSS strings inlined into every page head |
| `headScripts` | `string[]` | Optional | Inline scripts injected into page head |
| `islands` | `Record<string, Component>` | Optional | Interactive components hydrated on the client |
| `extends` | `Theme \| string` | Optional | Parent theme to inherit from |

## Example

```ts
import { defineTheme } from '@mineproj/core';

const theme = defineTheme({
  name: 'my-theme',
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

## Using a local theme

Create `.mineproj/theme/index.mts`:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

Then set `theme: '.mineproj/theme'` in your config.

## Layouts

The seven required layout types:

| Layout | Route | Purpose |
|---|---|---|
| `home` | `/` | Landing page with hero, featured projects, grid |
| `list` | `/projects/` | Filterable project grid |
| `detail` | `/projects/<slug>/` | Project detail with sidebar |
| `tag` | `/tags/<name>/` | Projects filtered by tag |
| `collection` | `/collections/<slug>/` | Curated collection |
| `about` | `/about/` | Author profile |
| `notFound` | `404.html` | Custom 404 page |

## Islands

Interactive components are marked as islands:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Register in theme:

```ts
const theme = defineTheme({
  name: 'my-theme',
  layouts: { ... },
  islands: { 'my-counter': MyCounter },
  islandsImport: 'my-theme/islands',
});
```

## Contract Testing

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] if valid
```

## Publishing

1. Name your package `mineproj-theme-*` or `@scope/mineproj-theme-*`
2. Add `"keywords": ["mineproj-theme"]` to package.json
3. Run `runThemeContract` to validate
4. Publish to npm
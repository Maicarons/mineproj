# mineproj Themes

Official and community themes for mineproj sites.

## Official Themes

| Theme | Package | Description |
|---|---|---|
| **Classic** | `@mineproj/theme-classic` | Default theme — neutral,大众风格, light/dark, 12px radius, 1280px content width. Clean, readable, professional. |
| **Gallery** | `@mineproj/theme-gallery` | Optional dark immersive gallery — 0px radius, dense layout, deep blue palette. One-line config swap with Classic. |

## Using a Theme

```ts
// mineproj.config.ts
export default defineConfig({
  theme: 'classic',           // shorthand → @mineproj/theme-classic
  // theme: 'gallery',         // → @mineproj/theme-gallery
  // theme: 'mineproj-theme-nebula',  // community package
  // theme: '.mineproj/theme', // local theme directory
  themeConfig: { accent: '#2563EB', palette: 'slate' },
});
```

## Creating a Theme

```bash
pnpm create @mineproj/create-theme my-theme
```

A theme is a package exporting via `defineTheme()`:
- `layouts` (home, list, detail, tag, collection, about, notFound)
- `components` (ProjectCard, Prose, etc.)
- `slots` (nav-end, prose-top, etc.)
- `configSchema` (Zod schema for themeConfig)
- `locales` (UI translation dictionaries)
- `styles` (CSS token strings)
- `islands` (interactive component map)
- `extends` (parent theme to inherit from)

## Publishing

1. Name your package `mineproj-theme-*` or `@scope/mineproj-theme-*`
2. Add `"keywords": ["mineproj-theme"]` to package.json
3. Run `runThemeContract(theme)` to validate
4. Publish to npm

## Contract Testing

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] if valid
```

## PR Template

See [CONTRIBUTING.md](../CONTRIBUTING.md) for theme submission guidelines.
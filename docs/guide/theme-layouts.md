# Theme Layouts & Slots

## Layouts

mineproj requires 7 core layouts. Each layout is a React component that receives `LayoutProps`.

### Home Layout

The homepage. Displays featured projects, recent projects, and profile info.

### List Layout

Shows a filtered/sorted grid of projects. Used by `/projects/` route.

### Detail Layout

The individual project page at `/projects/<slug>/`. Shows full project details, body content, screenshots, videos, PDFs, and playable demos.

### Tag Layout

Lists projects filtered by a tag at `/tags/<tag>/`.

### Collection Layout

Lists projects in a collection. Works similarly to the tag layout.

### About Layout

The about page at `/about/`. Shows profile information.

### Not Found Layout

The 404 page. Shown when a route doesn't match.

## Slots

Slots are extensibility points where plugins can inject components:

```ts
// In a plugin
export default definePlugin({
  name: 'my-plugin',
  hooks: {
    setup: (ctx) => {
      ctx.registerSlot('header', MyHeaderComponent);
    },
  },
});
```

Built-in slots typically include: `header`, `footer`, `sidebar`, `editor-shell`.

## Fallback Behavior

If a theme doesn't provide a layout, mineproj falls back to the default theme's layout and emits a warning. This ensures the site always builds, even with an incomplete theme.

## Component Registry

The component registry resolves components in this order:
1. Theme components
2. Plugin components
3. User overrides (later wins)

Unknown component overrides trigger a warning.
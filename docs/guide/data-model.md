# Data Model

mineproj uses a simple, file-based data model. All content is stored as JSON + Markdown files in the `data/` directory.

## Project

Each project lives in `data/projects/<slug>/index.json`:

```json
{
  "slug": "my-project",
  "name": "My Project",
  "tagline": "A short, punchy description",
  "summary": "A longer summary for cards, SEO, and feeds (160+ chars recommended)",
  "description": "Optional inline Markdown description (alternative to bodyFile)",
  "bodyFile": "body.md",
  "cover": "cover.png",
  "icon": "icon.svg",
  "category": "web",
  "tags": ["web", "tool"],
  "status": "released",
  "createdAt": "2026-01-15T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z",
  "releasedAt": "2026-02-01T00:00:00.000Z",
  "license": "MIT",
  "role": "Creator & Developer",
  "links": [
    { "url": "https://github.com/me/my-project", "type": "repo" },
    { "url": "https://my-project.example.com", "type": "homepage" },
    { "url": "https://npmjs.com/package/my-project", "type": "npm" }
  ],
  "techStack": ["TypeScript", "React", "Node.js"],
  "platforms": ["web", "linux", "macos", "windows"],
  "languages": ["en", "zh-CN"],
  "highlights": ["First feature", "Second feature"],
  "screenshots": [
    { "src": "screenshot-1.png", "alt": "Main view" }
  ],
  "videos": [
    { "src": "demo.mp4", "type": "video/mp4", "poster": "poster.png" }
  ],
  "docs": [
    { "file": "manual.pdf", "title": "User Manual", "type": "pdf" }
  ],
  "playable": {
    "type": "iframe",
    "entry": "/demos/my-project/",
    "sandbox": "allow-scripts allow-forms"
  },
  "seo": {
    "description": "Custom SEO description",
    "ogImage": "og-custom.png",
    "noindex": false
  },
  "faq": [
    { "q": "What is this?", "a": "A project." }
  ],
  "changelog": [
    { "version": "1.0.0", "date": "2026-02-01", "notes": "Initial release" }
  ],
  "featured": true,
  "weight": 10,
  "hidden": false,
  "accentColor": "#ff6600",
  "i18n": {
    "en": {
      "name": "My Project (English)",
      "tagline": "English tagline",
      "summary": "English summary",
      "description": "English description"
    }
  }
}
```

## Profile

`data/profile.json`:

```json
{
  "name": "Your Name",
  "avatar": "avatar.png",
  "bio": "A short bio",
  "url": "https://example.com",
  "email": "hello@example.com",
  "location": "City, Country",
  "social": {
    "github": "your-github-handle",
    "twitter": "@your-handle"
  }
}
```

## Tags

`data/tags.json` (optional):

```json
{
  "web": { "label": "Web", "description": "Web projects" },
  "cli": { "label": "CLI", "description": "Command-line tools" }
}
```

## Collections

Projects can be organized into collections. A collection is defined by grouping projects with the same tag. The `tags/galley/` route automatically lists all projects with a given tag.

## i18n Overrides

For each locale beyond the default, create `index.<locale>.json`:

```json
{
  "name": "Translated Name",
  "tagline": "Translated tagline",
  "bodyFile": "body.en.md"
}
```

Or define inline overrides in the `i18n` field of the main `index.json`.
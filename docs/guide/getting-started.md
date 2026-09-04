# Getting Started

Welcome to mineproj! This guide will help you create your first project portfolio site.

## Prerequisites

- **Node.js** 22 or later
- **pnpm** 10 (install via `npm install -g pnpm`)

## Create a New Site

The fastest way to start is with the scaffolding tool:

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to see your site.

## Project Structure

```
my-portfolio/
├─ mineproj.config.ts      # Site configuration
├─ data/
│  ├─ projects/             # Project data (JSON + Markdown)
│  │  └─ my-project/
│  │     ├─ index.json      # Project metadata
│  │     └─ body.md         # Project body content
│  ├─ profile.json          # Your profile
│  └─ tags.json             # Tag definitions
├─ public/                  # Static assets (images, PDFs, etc.)
└─ dist/                    # Build output (generated)
```

## Adding a Project

Create a new directory under `data/projects/`:

```bash
mineproj new my-project
```

This creates `data/projects/my-project/index.json` and `data/projects/my-project/body.md`. Edit the JSON file to set the project's metadata.

## Building for Production

```bash
pnpm build
```

Output goes to `dist/`. Preview it locally:

```bash
pnpm preview
```

## Next Steps

- [Configuration Guide](./configuration) — full configuration reference
- [Data Model](./data-model) — understand the project schema
- [Theme Development](./theme-development) — customize the look and feel
- [Plugin Development](./plugin-development) — extend functionality
- [Deploying](./deploying) — deploy your site to production
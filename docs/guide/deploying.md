# Deploying a mineproj site

mineproj generates a fully static `dist/` directory — deploy it anywhere static files are served.

## GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: node packages/cli/dist/cli.js build --root .
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: './dist' }
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Cloudflare Pages

```bash
# Build command
node packages/cli/dist/cli.js build --root .

# Output directory
dist/

# Environment variables (optional)
NODE_VERSION=22
```

## Netlify

```toml
# netlify.toml
[build]
  command = "node packages/cli/dist/cli.js build --root ."
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

## Vercel

```json
// vercel.json
{
  "buildCommand": "node packages/cli/dist/cli.js build --root .",
  "outputDirectory": "dist",
  "framework": null
}
```

## Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/mysite/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /404.html;
    }
}
```

## Static Hosting Checklist

- [ ] Set `site.url` in `mineproj.config.ts` for canonical URLs
- [ ] Run `mineproj audit` and ensure score ≥ 85
- [ ] Verify `dist/api/v1/projects.json` is accessible
- [ ] Check that `dist/404.html` is served for 404 errors
- [ ] Set up a custom domain and HTTPS
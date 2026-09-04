# Deploying a mineproj Site

mineproj generates a fully static `dist/` directory — deploy it anywhere static files are served.

## GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
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
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Cloudflare Pages

- **Build command:** `pnpm build`
- **Build output:** `dist`
- **Environment:** `NODE_VERSION=22`

## Netlify

- **Build command:** `pnpm build`
- **Publish directory:** `dist`

## Vercel

- **Framework preset:** Other
- **Build command:** `pnpm build`
- **Output directory:** `dist`

## Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/mysite;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Post-Deployment Checklist

- [ ] Site loads and is fully navigable
- [ ] `sitemap.xml` is accessible
- [ ] `robots.txt` is accessible
- [ ] `llms.txt` is accessible
- [ ] OG images render correctly
- [ ] Lighthouse audit score ≥ 85
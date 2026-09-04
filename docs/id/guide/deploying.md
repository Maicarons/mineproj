# Menyebarkan Situs mineproj

mineproj menghasilkan direktori `dist/` yang sepenuhnya statis — sebarkan di mana pun file statis dapat dilayani.

## GitHub Pages

Buat `.github/workflows/deploy.yml`:

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

- **Perintah build:** `pnpm build`
- **Keluaran build:** `dist`
- **Lingkungan:** `NODE_VERSION=22`

## Netlify

- **Perintah build:** `pnpm build`
- **Direktori publikasi:** `dist`

## Vercel

- **Praset framework:** Other
- **Perintah build:** `pnpm build`
- **Direktori keluaran:** `dist`

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

## Daftar Periksa Pasca-Penyebaran

- [ ] Situs dimuat dan dapat dinavigasi sepenuhnya
- [ ] `sitemap.xml` dapat diakses
- [ ] `robots.txt` dapat diakses
- [ ] `llms.txt` dapat diakses
- [ ] Gambar OG ditampilkan dengan benar
- [ ] Skor audit Lighthouse >= 85
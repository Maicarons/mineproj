# Despliegue de un Sitio mineproj

mineproj genera un directorio `dist/` completamente estático — despliégalo en cualquier lugar donde se sirvan archivos estáticos.

## GitHub Pages

Crea `.github/workflows/deploy.yml`:

```yaml
name: Desplegar en GitHub Pages
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

- **Comando de compilación:** `pnpm build`
- **Salida de compilación:** `dist`
- **Entorno:** `NODE_VERSION=22`

## Netlify

- **Comando de compilación:** `pnpm build`
- **Directorio de publicación:** `dist`

## Vercel

- **Preajuste de framework:** Otro
- **Comando de compilación:** `pnpm build`
- **Directorio de salida:** `dist`

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

## Lista de Verificación Post-Despliegue

- [ ] El sitio carga y es completamente navegable
- [ ] `sitemap.xml` es accesible
- [ ] `robots.txt` es accesible
- [ ] `llms.txt` es accesible
- [ ] Las imágenes OG se renderizan correctamente
- [ ] Puntuación de auditoría Lighthouse >= 85
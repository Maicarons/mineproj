# Déploiement d'un Site mineproj

mineproj génère un répertoire `dist/` entièrement statique — déployez-le partout où des fichiers statiques sont servis.

## GitHub Pages

Créez `.github/workflows/deploy.yml` :

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

- **Commande de build :** `pnpm build`
- **Sortie du build :** `dist`
- **Environnement :** `NODE_VERSION=22`

## Netlify

- **Commande de build :** `pnpm build`
- **Répertoire de publication :** `dist`

## Vercel

- **Préréglage framework :** Autre
- **Commande de build :** `pnpm build`
- **Répertoire de sortie :** `dist`

## Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/monsite;
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

## Liste de Vérification Post-Déploiement

- [ ] Le site se charge et est entièrement navigable
- [ ] `sitemap.xml` est accessible
- [ ] `robots.txt` est accessible
- [ ] `llms.txt` est accessible
- [ ] Les images OG s'affichent correctement
- [ ] Score d'audit Lighthouse ≥ 85
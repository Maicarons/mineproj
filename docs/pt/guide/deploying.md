# Implantação de um Site mineproj

O mineproj gera um diretório `dist/` totalmente estático — implante em qualquer lugar onde arquivos estáticos sejam servidos.

## GitHub Pages

Crie `.github/workflows/deploy.yml`:

```yaml
name: Implantar no GitHub Pages
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

- **Comando de build:** `pnpm build`
- **Saída da build:** `dist`
- **Ambiente:** `NODE_VERSION=22`

## Netlify

- **Comando de build:** `pnpm build`
- **Diretório de publicação:** `dist`

## Vercel

- **Predefinição de framework:** Other
- **Comando de build:** `pnpm build`
- **Diretório de saída:** `dist`

## Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/meusite;
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

## Checklist Pós-Implantação

- [ ] Site carrega e é totalmente navegável
- [ ] `sitemap.xml` está acessível
- [ ] `robots.txt` está acessível
- [ ] `llms.txt` está acessível
- [ ] Imagens OG são renderizadas corretamente
- [ ] Pontuação no Lighthouse >= 85
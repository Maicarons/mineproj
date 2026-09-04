# Развёртывание сайта mineproj

mineproj генерирует полностью статическую директорию `dist/` — размещайте её где угодно, где обслуживаются статические файлы.

## GitHub Pages

Создайте `.github/workflows/deploy.yml`:

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

- **Команда сборки:** `pnpm build`
- **Результат сборки:** `dist`
- **Окружение:** `NODE_VERSION=22`

## Netlify

- **Команда сборки:** `pnpm build`
- **Директория публикации:** `dist`

## Vercel

- **Пресет фреймворка:** Other
- **Команда сборки:** `pnpm build`
- **Директория вывода:** `dist`

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

## Контрольный список после развёртывания

- [ ] Сайт загружается и полностью доступен для навигации
- [ ] `sitemap.xml` доступен
- [ ] `robots.txt` доступен
- [ ] `llms.txt` доступен
- [ ] OG-изображения отображаются корректно
- [ ] Оценка Lighthouse аудита >= 85
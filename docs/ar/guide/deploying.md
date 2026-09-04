# نشر موقع mineproj

يقوم mineproj بإنشاء دليل `dist/` ثابت بالكامل — انشره في أي مكان يتم فيه خدمة الملفات الثابتة.

## GitHub Pages

أنشئ ملف `.github/workflows/deploy.yml`:

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

- **أمر البناء:** `pnpm build`
- **مخرجات البناء:** `dist`
- **البيئة:** `NODE_VERSION=22`

## Netlify

- **أمر البناء:** `pnpm build`
- **دليل النشر:** `dist`

## Vercel

- **إطار العمل المسبق:** Other
- **أمر البناء:** `pnpm build`
- **دليل المخرجات:** `dist`

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

## قائمة التحقق بعد النشر

- [ ] الموقع يُحمّل ويمكن التنقل فيه بالكامل
- [ ] `sitemap.xml` يمكن الوصول إليه
- [ ] `robots.txt` يمكن الوصول إليه
- [ ] `llms.txt` يمكن الوصول إليه
- [ ] صور OG تظهر بشكل صحيح
- [ ] درجة تدقيق Lighthouse ≥ 85
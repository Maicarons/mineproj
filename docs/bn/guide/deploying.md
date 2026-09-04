# একটি mineproj সাইট ডিপ্লয় করা

mineproj একটি সম্পূর্ণ স্ট্যাটিক `dist/` ডিরেক্টরি জেনারেট করে — যেখানেই স্ট্যাটিক ফাইল সার্ভ করা হয় সেখানেই ডিপ্লয় করুন।

## GitHub Pages

`.github/workflows/deploy.yml` তৈরি করুন:

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

- **বিল্ড কমান্ড:** `pnpm build`
- **বিল্ড আউটপুট:** `dist`
- **এনভায়রনমেন্ট:** `NODE_VERSION=22`

## Netlify

- **বিল্ড কমান্ড:** `pnpm build`
- **প্রকাশ ডিরেক্টরি:** `dist`

## Vercel

- **ফ্রেমওয়ার্ক প্রিসেট:** Other
- **বিল্ড কমান্ড:** `pnpm build`
- **আউটপুট ডিরেক্টরি:** `dist`

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

## ডিপ্লয়মেন্ট-পরবর্তী চেকলিস্ট

- [ ] সাইট লোড হয় এবং সম্পূর্ণ নেভিগেবল
- [ ] `sitemap.xml` অ্যাক্সেসযোগ্য
- [ ] `robots.txt` অ্যাক্সেসযোগ্য
- [ ] `llms.txt` অ্যাক্সেসযোগ্য
- [ ] OG ইমেজ সঠিকভাবে রেন্ডার হয়
- [ ] Lighthouse অডিট স্কোর ≥ 85
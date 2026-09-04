# mineproj साइट डिप्लॉय करना

mineproj एक पूरी तरह से स्थिर `dist/` निर्देशिका जनरेट करता है — इसे कहीं भी डिप्लॉय करें जहाँ स्थिर फ़ाइलें सर्व की जाती हैं।

## GitHub Pages

`.github/workflows/deploy.yml` बनाएँ:

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

## Cloudflare Pages / Netlify / Vercel

बिल्ड कमांड: `pnpm build`, आउटपुट निर्देशिका: `dist`
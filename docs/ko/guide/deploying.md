# mineproj 사이트 배포하기

mineproj는 완전히 정적인 `dist/` 디렉터리를 생성합니다 -- 정적 파일을 제공하는 모든 곳에 배포할 수 있습니다.

## GitHub Pages

`.github/workflows/deploy.yml` 파일을 생성하세요:

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

- **빌드 명령:** `pnpm build`
- **빌드 출력:** `dist`
- **환경:** `NODE_VERSION=22`

## Netlify

- **빌드 명령:** `pnpm build`
- **게시 디렉터리:** `dist`

## Vercel

- **프레임워크 프리셋:** Other
- **빌드 명령:** `pnpm build`
- **출력 디렉터리:** `dist`

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

## 배포 후 체크리스트

- [ ] 사이트가 로드되고 완전히 탐색 가능한가
- [ ] `sitemap.xml`에 접근 가능한가
- [ ] `robots.txt`에 접근 가능한가
- [ ] `llms.txt`에 접근 가능한가
- [ ] OG 이미지가 올바르게 렌더링되는가
- [ ] Lighthouse 감사 점수가 85점 이상인가

# 部署指南

mineproj 生成纯静态 `dist/` 目录，可部署到任何静态托管服务。

## GitHub Pages

```yaml
# .github/workflows/deploy.yml
- run: pnpm build
- uses: actions/upload-pages-artifact@v3
  with:
    path: dist
```

## Netlify / Vercel / Cloudflare

构建命令：`pnpm build`
输出目录：`dist`
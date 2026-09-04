# 配置

mineproj 通过项目根目录下的 `mineproj.config.ts` 文件进行配置。

## 站点配置

```ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: '我的作品集',
    description: '我的作品展示',
    url: 'https://example.com',
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
  },
});
```

## 主题配置

```ts
export default defineConfig({
  theme: 'classic',
  themeConfig: {
    accent: '#2563EB',
    palette: 'neutral',
    colorMode: 'system',
  },
});
```

## 插件配置

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }],
  ],
});
```
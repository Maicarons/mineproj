# 主题开发

mineproj 主题是定义站点视觉外观的 npm 包。

## 创建主题

```bash
npx create-theme my-theme
cd my-theme
pnpm install
```

## 主题结构

```ts
import { defineTheme } from '@mineproj/core';

export default defineTheme({
  name: '@mineproj/my-theme',
  layouts: {
    home: () => import('./layouts/Home'),
    list: () => import('./layouts/List'),
    detail: () => import('./layouts/Detail'),
  },
  slots: ['header', 'footer'],
  islands: ['theme-toggle'],
});
```
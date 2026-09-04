# 插件开发

mineproj 插件通过生命周期钩子扩展构建流水线。

## 创建插件

```bash
npx create-plugin my-plugin
cd my-plugin
pnpm install
```

## 插件结构

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: '@mineproj/my-plugin',
  hooks: {
    'render:before': async (html) => html,
    'build:done': async () => console.log('构建完成！'),
  },
});
```
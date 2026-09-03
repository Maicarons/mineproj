---
name: create-project
description: 为一个使用者脚手架一个新站点。讲解 mineproj.config.ts、content/ 目录约定、本地预览与静态部署，供 AI 协助使用者初始化并填充自己的项目库。
---

# 脚手架一个新站点（create-project）

本技能面向「用 mineproj 建自己作品集」的使用者。mineproj 是生成器，使用者只需提供配置 + 内容数据，无需写 React/Vite。

## 1. 初始化

```bash
# 在空目录初始化一个使用者站点
npx @mineproj/cli init my-site
cd my-site
```

生成的最小结构：

```
my-site/
├─ mineproj.config.ts     # 站点级配置（主题、插件、i18n、SEO）
├─ content/
│  └─ projects/
│     └─ <project-id>/
│        ├─ index.json          # 主语言项目数据
│        ├─ index.<locale>.json # 可选：其他语言字段覆盖
│        ├─ body.<locale>.md    # 可选：长文介绍
│        ├─ images/             # 截图/封面
│        └─ docs/               # 可选：PDF/幻灯片附件
└─ package.json
```

## 2. mineproj.config.ts 关键字段

```ts
import { defineConfig } from '@mineproj/core'

export default defineConfig({
  site: {
    title: 'My Works',
    description: '…',
    url: 'https://example.com',
    defaultLocale: 'zh-CN',
    availableLocales: ['zh-CN', 'en'],
  },
  theme: '@mineproj/theme-classic',   // 或自定义主题包名
  themeConfig: { colorMode: 'light', radius: 'md' },
  plugins: [
    '@mineproj/plugin-search',
    ['@mineproj/plugin-pdf', { lazy: true }],
  ],
})
```

## 3. 本地预览 / 构建 / 部署

```bash
npx @mineproj/cli dev        # http://localhost:5173 带 HMR
npx @mineproj/cli build      # 产出 dist/ 纯静态目录
npx @mineproj/cli preview    # 预览构建产物
```

`dist/` 可直接托管到任意静态服务器或 GitHub Pages；无需后端。`dist/api/v1/*.json` 即为模拟 API 端点。

## 4. AI 协助要点

- 帮使用者把现有作品信息整理成 `content/projects/<id>/index.json`（字段见 [content-authoring](./content-authoring/SKILL.md)）。
- 校验 JSON 是否符合 Zod schema（运行 `cli validate` 或对照 `docs/plan/` §5 数据模型）。
- 提醒使用者：截图放 `images/`、PDF 放 `docs/`、长文放 `body.<locale>.md`。
- 多语言站点：除 `index.json` 外，再建 `index.<locale>.json` 仅覆盖差异字段。

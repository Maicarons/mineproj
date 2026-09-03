---
name: content-authoring
description: 用 JSON + Markdown 创作项目内容。讲解 content/projects/<id>/ 目录约定、Zod 数据模型字段、i18n 字段覆盖与回退、Markdown/PDF/图片约定。
---

# 内容创作（content-authoring）

内容是纯数据，由 CLI 在构建期加载并校验（Zod schema 见 `docs/plan/` §5）。非技术协作者也可用 [可视化编辑器](./visual-editor/SKILL.md) 填写。

## 1. 目录约定（每个项目一个文件夹）

```
content/projects/<project-id>/
├─ index.json            # 主语言（defaultLocale）数据
├─ index.<locale>.json   # 可选：其他语言仅覆盖差异字段
├─ body.<locale>.md      # 可选：长文介绍（Markdown，Shiki 构建期高亮）
├─ images/               # 截图、封面，建议提供 thumb + full
└─ docs/                 # 可选：PDF/幻灯片附件
```

## 2. index.json 关键字段

```jsonc
{
  "id": "papex",
  "name": "Papex",
  "tagline": "学术文献平台",
  "summary": "一句话简介",
  "createdAt": "2026-08-01",
  "updatedAt": "2026-09-01",
  "cover": "images/cover.png",
  "screenshots": ["images/01.png", "images/02.png"],
  "links": [
    { "label": "源码", "url": "https://github.com/...", "kind": "repo" },
    { "label": "在线试用", "url": "https://...", "kind": "demo" }
  ],
  "tags": ["web", "react"],
  "highlights": ["特性一", "特性二"],
  "playable": { "type": "iframe", "src": "https://...", "sandbox": "allow-scripts" },
  "docs": [
    { "title": "设计文档", "file": "docs/design.pdf", "kind": "pdf", "preview": "viewer" }
  ]
}
```

> **iframe 安全红线**：`allow-scripts` 与 `allow-same-origin` **绝不可同时**授予不可信内容；可玩 Demo 默认只给最小权限。

## 3. i18n 字段覆盖与回退

- 回退链：`locale → fallbackLocale → defaultLocale`。
- `index.<locale>.json` **只写差异字段**（对象深度合并、数组整体替换）。
- 长文用 `body.<locale>.md`；缺某语言时回退到 `defaultLocale` 的同名文件。
- 切换语言不得产生 404：内核为每个 locale 生成独立路由并互设 `hreflang`。

## 4. Markdown / 富媒体约定

- 正文用 GFM；代码块由 Shiki 在**构建期**高亮（零运行时），支持明暗双主题 CSS 变量。
- PDF：放进 `docs/`，声明 `preview: 'viewer' | 'iframe' | 'cover'`；阅读器三级降级（pdf.js → 原生 iframe → 封面+下载）。
- 图片：灯箱组件负责缩放/平移/键盘导航，作者只需提供路径。

## 5. AI 协助要点

- 帮使用者把信息整理成合规 `index.json`；运行校验确认无多余/缺漏字段。
- 提醒多语言站点补齐 `index.<locale>.json` 与 `body.<locale>.md`。
- 不要替使用者编造 `links` 里的 URL；缺失则留空或标注待填。

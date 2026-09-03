---
name: mineproj-overview
description: mineproj 项目总览与 AI 接手任务的第一入口。讲解仓库布局、核心约定、命令与里程碑，告诉 AI 如何在遵守契约与提交纪律的前提下推进工作。
---

# mineproj 项目总览（面向 AI）

## 这是什么

mineproj 是一款 **Apache-2.0 许可**的、**纯前端部署**的个人项目展示静态站点生成器：

- JSON + Markdown 驱动，零后端；构建产物是一份纯静态目录，同时输出可直接 `fetch()` 的静态 API（`/api/v1/*.json`）。
- 主题与插件皆为 npm 包；默认主题 `@mineproj/theme-classic` 自身也是 npm 包，与第三方主题走完全相同的解析路径（dogfooding，防止契约腐化）。
- SEO/AI 友好（JSON-LD、sitemap、robots 放行 AI 爬虫、llms.txt、Markdown 镜像页、AGENTS.md、`audit --seo --ai`）。
- 内置**可视化编辑器**（M9）：把「手写 JSON」变成「可视化填表 + 实时预览」。
- i18n 一等公民：路由前缀 + 字段级覆盖 + Markdown 分语言 + 回退链 + `hreflang`。

## 仓库布局

```
mineproj/
├─ packages/            # pnpm workspace：内核、CLI、默认主题、插件
│  ├─ core/             # @mineproj/core  —— 配置解析/数据加载/路由生成/主题解析/插件钩子/产物发射
│  ├─ cli/              # @mineproj/cli   —— dev/build/audit 命令
│  ├─ theme-classic/    # @mineproj/theme-classic（默认主题，契约验证器）
│  ├─ theme-gallery/    # @mineproj/theme-gallery（可选官方主题）
│  └─ plugin-*/         # 官方插件（搜索、RSS、PWA、PDF、lightbox…）
├─ content/             # 使用者数据（JSON + Markdown + 资源），由 CLI 消费
├─ docs/                # VitePress 文档站（产品技术方案 + 开发计划 + 指南）
├─ skills/              # 本目录：面向 AI 的项目使用说明
├─ .github/             # 工作流、Issue/PR 模板、CODEOWNERS
├─ scripts/             # 编码校验等辅助脚本
└─ README.md / LICENSE / NOTICE / CONTRIBUTING …
```

## 核心约定（AI 必读）

1. **契约先于实现**：任何跨包接口（内核↔主题、内核↔插件、站点↔API）先写 TypeScript 类型 + Zod schema + 契约测试骨架，再写实现。
2. **默认主题即契约验证器**：`@mineproj/theme-classic` 必须始终能跑通；任何内核改动不得破坏它。
3. **一条任务 = 一次提交**（R1）；commit message 用**英文**（规避本机 Bash 传中文的编码风险），格式 `type(scope): summary`。
4. **能透传就不自研**（R4）：Vite 生态已有的能力一律写成「透传 Vite 插件」的薄封装。
5. **不引用任何商业产品的设计规范、商标或品牌资产**。
6. **i18n 不硬编码**：UI 文案走主题 `locales` 字典；内容文案走字段覆盖 + Markdown 分语言；禁止在代码里写死面向用户的字符串。

## 命令（packages 落地后）

```bash
pnpm install
pnpm build            # 构建所有包
pnpm test             # 单元 + 契约测试
pnpm --filter @mineproj/cli dev        # 本地预览使用者站点
pnpm --filter @mineproj/cli audit --seo --ai   # SEO/AI 自检打分
```

## 接手任务流程

1. 读 `docs/plan/`（产品技术方案）与 `docs/plan/development`（开发计划），定位对应里程碑 `M*`。
2. 确认该里程碑的 DoD（完成定义）与 WBS 项（`M*-NN`）。
3. 先写契约（类型 + schema + 契约测试骨架），再实现。
4. 实现后跑测试与 `audit`，通过后按 R1 提交。

## 关联技能

- 搭新站点 → [create-project](./create-project/SKILL.md)
- 写主题 → [author-theme](./author-theme/SKILL.md)
- 写插件 → [author-plugin](./author-plugin/SKILL.md)
- 写内容 → [content-authoring](./content-authoring/SKILL.md)
- 用编辑器 → [visual-editor](./visual-editor/SKILL.md)

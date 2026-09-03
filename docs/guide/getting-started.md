# 快速开始

**mineproj** 是一款 **Apache-2.0 许可**的纯前端个人项目展示静态站点生成器。本文介绍仓库结构与文档站本地运行方式。

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `packages/` | 各 npm 包（内核、默认主题、插件等），采用 pnpm workspace |
| `docs/` | 本文档站（VitePress），其中 `plan/` 存放产品技术方案与开发计划 |
| `skills/` | 面向 AI 的技能说明，告诉 AI 如何理解并使用本项目 |
| `.github/` | GitHub 工作流、Issue/PR 模板、CODEOWNERS 等治理文件 |
| `scripts/` | 编码校验等辅助脚本 |

## 本地运行文档站

```bash
cd docs
npm install
npm run docs:dev      # 开发预览，默认 http://localhost:5173
npm run docs:build    # 产出 docs/.vitepress/dist
npm run docs:preview  # 预览构建产物
```

> 部署到 GitHub Pages 时，基路径默认为 `/mineproj/`，可用环境变量 `DOCS_BASE` 覆盖（如本地 `DOCS_BASE=/ npm run docs:dev`）。

## 下一步

- 阅读 [产品技术方案](/plan/) 了解「做什么、为什么这么做」
- 阅读 [开发计划](/plan/development) 了解「按什么顺序做、每步做到什么程度算完成」

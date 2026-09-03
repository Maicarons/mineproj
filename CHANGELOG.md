# 变更日志（CHANGELOG）

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 约定，
版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

> 本项目当前处于**规划阶段**，尚未发布正式版本。以下记录文档与脚手架的演进。

## [未发布]

### 新增
- 产品技术方案 `docs/plan/index.md`（v1.1）：默认主题 `@mineproj/theme-classic`、Markdown 内容管线、富媒体预览、i18n 一等公民。
- 开发计划 `docs/plan/development.md`（v1.2）：里程碑 M0–M9（125+ 项 WBS），新增内容管线与富媒体（M4）、i18n（M5）、可视化编辑器（M9）。
- VitePress 文档站 `docs/`：首页、快速开始指南、计划文档搬迁。
- `skills/` 目录：面向 AI 的项目使用说明（总览 / 建站 / 主题 / 插件 / 内容 / 可视化编辑器）。
- 标准 GitHub 开源结构：LICENSE（Apache-2.0）、NOTICE、CONTRIBUTING、CODE_OF_CONDUCT、SECURITY、AGENTS、`.github/` 治理文件、pnpm workspace 与 tsconfig 基线。
- `scripts/check-encoding.py`：UTF-8 + LF 编码校验，防止中文 GBK 混入。

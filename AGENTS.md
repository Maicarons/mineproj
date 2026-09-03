# AGENTS.md

本文件供 **AI 编码助手 / 自动化 Agent** 接手本仓库时阅读，以确保遵循既定约定。

## 仓库概要

mineproj 是一款 Apache-2.0 许可的纯前端个人项目展示静态站点生成器。详见 [`docs/plan/index.md`](docs/plan/index.md)（做什么）与 [`docs/plan/development.md`](docs/plan/development.md)（怎么做）。

## 接手任务的标准流程

1. **先读计划**：定位对应里程碑 `M*` 与其 WBS 项 `M*-NN`，确认 DoD。
2. **契约先于实现**：跨包接口先写 TS 类型 + Zod schema + 契约测试骨架。
3. **默认主题即契约验证器**：改动内核后必须保证 `@mineproj/theme-classic` 仍可跑通。
4. **一条任务 = 一次提交**，commit message 用**英文**，格式 `type(scope): summary`。
5. 实现后跑测试 / lint / `audit --seo --ai`，再提交。

## 硬约束（违反即视为 bug）

- **不引用任何商业产品的设计规范、商标或品牌资产**。只借鉴信息架构/浏览范式，不照搬皮肤。
- **i18n 不硬编码**：UI 文案走主题 `locales`；内容文案走字段覆盖 + Markdown 分语言。
- **iframe 沙箱**：`allow-scripts` 与 `allow-same-origin` 不同时授予不可信内容。
- **可视化编辑器边界**：仅操作 `content/` 数据，不改 `packages/`；保存前 Zod 校验；不删资产。

## 编码与文件

- 所有文本使用 **UTF-8 + LF**。提交前运行 `python scripts/check-encoding.py <files>` 校验。
- 本仓库有「Bash 传中文字面量不可靠」的历史坑：含中文的脚本一律用 `\u` 转义，判定依据为 `decode('utf-8')` 不抛错。
- 包管理用 **pnpm workspace**（`pnpm-workspace.yaml` 含 `packages/*` 与 `docs`）。

## 面向 AI 的技能

`skills/` 目录提供了更细的场景化说明（建站 / 主题 / 插件 / 内容 / 可视化编辑器），复杂任务优先查阅对应 `SKILL.md`。

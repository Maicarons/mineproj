# 安全策略（SECURITY）

## 支持版本

| 版本 | 状态 |
| --- | --- |
| 规划阶段（main 分支） | 仅接受安全反馈，尚无正式发布版本 |

mineproj 当前处于规划与实现早期，尚未发布稳定版本。安全修复会直接进入 `main` 分支。

## 报告漏洞

**请勿通过公开 Issue 报告安全漏洞。**

请通过以下方式私下告知维护者：

- GitHub Security Advisories（仓库 → Security → Report a vulnerability）
- 或发送邮件至维护者（见仓库 README 主页的联系方式）

请在报告中尽量包含：

1. 受影响的组件 / 包（如 `@mineproj/core`、`@mineproj/cli`、某个插件）
2. 复现步骤与环境（Node 版本、OS、浏览器）
3. 潜在影响评估

我们会在 **7 个工作日内**确认收到，并协商修复与披露时间线。

## 安全设计要点（供审查参考）

- **iframe 沙箱红线**：`allow-scripts` 与 `allow-same-origin` **绝不可同时**授予不可信内容；可玩 Demo 默认只给最小权限。
- **可视化编辑器的边界**：仅操作 `content/` 下的数据，不修改 `packages/` 或配置；保存前先 Zod 校验；禁止批量删除资产。
- **依赖供应链**：所有依赖经 `pnpm audit` 与 CI 检查；新增依赖需在 PR 中说明理由。

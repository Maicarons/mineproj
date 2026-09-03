# 参与贡献（CONTRIBUTING）

感谢你考虑为 **mineproj** 做贡献。本项目采用 Apache-2.0 许可，并遵循以下协作约定（亦见 `docs/plan/development.md` 的「开发原则与协作约定」）。

## 开发流程

1. **先读计划**：开工前阅读 [产品技术方案](docs/plan/index.md) 与 [开发计划](docs/plan/development.md)，定位对应里程碑 `M*` 与其 WBS 项（`M*-NN`）。
2. **契约先于实现**：任何跨包接口（内核↔主题、内核↔插件、站点↔API）先写 TypeScript 类型 + Zod schema + 契约测试骨架，再写实现。
3. **默认主题即契约验证器**：`@mineproj/theme-classic` 必须始终能跑通；任何内核改动不得破坏它。
4. **能透传就不自研**：Vite 生态已有能力一律写成「透传 Vite 插件」的薄封装。

## 提交纪律

- **一条任务 = 一次提交**（R1）。WBS 中每个 `M*-NN` 完成后立即 commit，不攒批。
- **commit message 用英文**，格式：

  ```
  type(scope): summary

  body（可选，解释为什么）
  ```

  常用 `type`：`feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `build`。
  `scope` 为受影响的包或模块，如 `core` / `cli` / `theme-classic` / `plugin-pdf`。

- 提交前确保：单元/契约测试通过、`pnpm lint` 通过、文档变更同步更新。

## 编码与合规

- **不引用任何商业产品的设计规范、商标或品牌资产**；可视化/视觉灵感只借鉴「信息架构与浏览范式」，不照搬皮肤。
- 所有用户可见文案可 i18n：UI 文案走主题 `locales` 字典，内容文案走字段覆盖 + Markdown 分语言；禁止在代码里写死面向用户的字符串。
- 中文字符串使用 UTF-8；提交前运行 `python scripts/check-encoding.py` 校验（或 `pnpm check:encoding`）。

## 提交流程

1. Fork 并在独立分支开发。
2. 确保 PR 描述关联对应 Issue / 里程碑，并说明 DoD（完成定义）如何满足。
3. 通过 CI（构建 + 测试 + lint + 编码校验）后即可请求 review。

## 行为准则

参与本仓库即视为同意 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

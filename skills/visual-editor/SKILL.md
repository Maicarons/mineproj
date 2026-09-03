---
name: visual-editor
description: 使用与扩展 mineproj 可视化编辑器（M9）。讲解其定位、运行形态、安全边界、与 JSON 数据模型的双向同步，以及如何新增字段类型。
---

# 可视化编辑器（visual-editor）

可视化编辑器是 mineproj 的**内容创作辅助工具**（里程碑 M9），目标是把「手写 JSON」变成「可视化填表 + 实时预览」，让非技术协作者也能维护内容。对应 `docs/plan/` §21（产品技术方案）与 M9（开发计划）。

## 1. 定位与运行形态

- **不是**网站构建器，而是**内容数据编辑器**：输出仍是 `content/projects/<id>/index.json` 等纯数据文件。
- 可独立运行（`mineproj editor`），也可作为主题详情页的一个「编辑此项目」入口内嵌。
- 左栏表单、右栏实时预览；预览复用默认主题的 `ProjectDetail` 组件，保证「所见即所得」与站点一致。

## 2. 安全边界（硬约束）

1. **只读加载、显式保存**：打开即解析现有 JSON 到内存；任何改动只在用户点「保存」时落盘，且**先 Zod 校验再写**。
2. **不删文件**：编辑器禁止删除 `images/`、`docs/` 等资产目录；移除截图只从 JSON 引用里去掉，磁盘文件由使用者另行管理。
3. **预览隔离**：可玩 Demo 的预览走与站点相同的 iframe 沙箱策略（见 [content-authoring](./content-authoring/SKILL.md) 红线），编辑器自身不提升权限。
4. **不触碰内核/主题源码**：编辑器只操作 `content/` 下的数据，不修改 `packages/` 或配置。

## 3. 与数据模型的双向同步

- 表单字段由 `index.json` 的 Zod schema **自动生成**（schema → 表单控件映射），新增字段无需改编辑器代码。
- 保存时生成标准 `index.json`；多语言则按回退链拆写 `index.<locale>.json`（仅差异）。
- 导入：粘贴 JSON / 拖入现有项目文件夹即可回填表单。
- 导出：写回磁盘 + 一键 `mineproj validate` 校验 + 可选 `mineproj build` 预览。

## 4. 扩展：新增字段类型

映射规则集中在编辑器的 schema→control 注册表：

```ts
registerControl('markdown', {
  render: (field, value, onChange) => <MarkdownField .../>,
  validate: (v) => typeof v === 'string',
})
```

新增一种字段类型 = 在注册表加一条映射 + 一个控件组件；数据层无需改动（仍由 Zod schema 驱动）。

## 5. AI 协助要点

- 协助实现时严格守住 §2 安全边界；任何「自动删除/批量重命名资产」的需求都改为「仅改引用 + 提示使用者」。
- 预览必须与站点默认主题视觉一致，避免两套渲染逻辑分叉。
- 把编辑器产出的数据回灌到 [content-authoring](./content-authoring/SKILL.md) 的目录约定，确保可被 CLI 正常消费。

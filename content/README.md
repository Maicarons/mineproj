# content/

本目录存放**使用者数据**（由 `@mineproj/cli` 在构建期加载）。每个项目一个文件夹：

```
content/projects/<project-id>/
├─ index.json            # 主语言数据（必填）
├─ index.<locale>.json   # 可选：其他语言仅覆盖差异字段
├─ body.<locale>.md      # 可选：长文介绍
├─ images/               # 截图、封面
└─ docs/                 # 可选：PDF/幻灯片附件
```

字段定义见 `docs/plan/index.md` §5 数据模型，以及 `skills/content-authoring/SKILL.md`。

`hello-mineproj/` 是一个最小可用示例，可被可视化编辑器读取、被 CLI 校验。

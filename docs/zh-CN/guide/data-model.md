# 数据模型

mineproj 使用简单的文件型数据模型。所有内容以 JSON + Markdown 格式存储在 `data/` 目录下。

## 项目 (Project)

每个项目位于 `data/projects/<slug>/index.json`：

```json
{
  "slug": "my-project",
  "name": "我的项目",
  "tagline": "简短描述",
  "summary": "用于卡片和 SEO 的较长摘要",
  "tags": ["web", "tool"],
  "status": "released",
  "links": [
    { "url": "https://github.com/me/my-project", "type": "repo" }
  ]
}
```

## 个人资料 (Profile)

`data/profile.json`：

```json
{
  "name": "您的姓名",
  "bio": "简短介绍",
  "url": "https://example.com"
}
```
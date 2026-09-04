# 快速开始

欢迎使用 mineproj！本指南将帮助您创建第一个项目展示站点。

## 环境要求

- **Node.js** 22 或更高版本
- **pnpm** 10（通过 `npm install -g pnpm` 安装）

## 创建新站点

最快的方式是使用脚手架工具：

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

打开本地地址 `localhost:5173` 查看您的站点。

## 项目结构

```
my-portfolio/
├─ mineproj.config.ts      # 站点配置
├─ data/
│  ├─ projects/             # 项目数据（JSON + Markdown）
│  │  └─ my-project/
│  │     ├─ index.json      # 项目元数据
│  │     └─ body.md         # 项目正文
│  ├─ profile.json          # 个人资料
│  └─ tags.json             # 标签定义
├─ public/                  # 静态资源
└─ dist/                    # 构建输出
```

## 添加项目

在 `data/projects/` 下创建新目录：

```bash
mineproj new my-project
```

## 构建生产版本

```bash
pnpm build
```

输出到 `dist/` 目录。
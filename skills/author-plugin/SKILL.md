---
name: author-plugin
description: 编写 mineproj 插件。讲解插件契约、四种钩子语义（seq/waterfall/parallel/first）、以及「透传 Vite 插件」的双形态原则。
---

# 编写插件（author-plugin）

插件系统采用 **「mineproj 生命周期钩子 + 原生 Vite 插件透传」双形态**，直接复用整个 Vite/Rollup/unplugin 生态。

## 1. 插件契约

```ts
export interface MineprojPlugin {
  name: string
  enforce?: 'pre' | 'post'        // 相对其他插件的执行顺序
  hooks?: {
    'config:resolved'?: (cfg) => void | cfg
    'data:loaded'?: (data) => void | data      // 序列/瀑布/并行/短路见下
    'routes:generated'?: (routes) => void | routes
    'render:page'?: (page) => void | page       // 注入插槽内容、修改 HTML
    'build:emit'?: (ctx) => void | Promise<void>
  }
  vite?: (ctx) => UserConfig | Plugin    // 可直接返回 Vite 配置或 Vite 插件
  components?: Record<string, ComponentType>
  optionsSchema?: ZodSchema              // 插件自身配置校验
}
```

## 2. 钩子四种语义

内核按插件声明的语义调度同一钩子上的多个处理器：

| 语义 | 行为 | 典型用途 |
| --- | --- | --- |
| `seq` | 依次执行，互不干扰 | 日志、埋点 |
| `waterfall` | 上一处理结果流入下一个 | 数据转换流水线 |
| `parallel` | 并发执行，结果合并 | 多源数据聚合 |
| `first` | 第一个返回非空即短路 | 自定义路由优先匹配 |

未声明语义时默认 `seq`。

## 3. 「能透传就不自研」（R4）

遇到 Vite 生态已有能力（PWA、图标、自动导入、压缩、图片优化…），写成薄封装直接透传，不要在 mineproj 内核里重造：

```ts
import viteCompression from 'vite-plugin-compression'
export default definePlugin({
  name: '@mineproj/plugin-gzip',
  vite: () => viteCompression({ algorithm: 'gzip' }),
})
```

`plugins` 数组同时接受 mineproj 插件对象与裸 Vite 插件——后者按 `vite` 形态透传。

## 4. 官方插件清单（参考）

`@mineproj/plugin-search`（MiniSearch 分语言索引）、`@mineproj/plugin-pdf`（pdf.js 懒加载 + 三级降级）、`@mineproj/plugin-lightbox`（自研图片灯箱）、`@mineproj/plugin-rss`、`@mineproj/plugin-pwa`、`@mineproj/plugin-sitemap`（兼产 `llms.txt`）。

## 5. AI 协助要点

- 先确认该能力是否已有 Vite 插件可透传；有则薄封装，无则考虑写入 `hooks`。
- 插件配置必须带 `optionsSchema`，CLI 在加载期即校验，失败早退并给出明确错误。
- 钩子里拿到的数据已是 Zod 校验后的结构；不要重新发明校验。
- 插件不得破坏默认主题；在 `docs/plan/development` 的 WBS 里登记为对应 `M*-NN` 任务。

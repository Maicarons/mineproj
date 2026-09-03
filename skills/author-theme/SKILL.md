---
name: author-theme
description: 编写并发布一个 mineproj 主题 npm 包。讲解主题契约、设计令牌 --mp-*、明暗双模式、无闪烁切换、以及「默认主题即契约验证器」的 dogfooding 规则。
---

# 编写主题（author-theme）

主题是 **npm 包**，与默认主题 `@mineproj/theme-classic` 走完全相同的解析路径。

## 1. 主题契约

一个主题包导出如下结构（详见 `docs/plan/` §8）：

```ts
export interface ThemePackage {
  name: string
  version: string
  layouts: Record<string, ComponentType>   // home / project-list / project-detail …
  components: Record<string, ComponentType> // Card / FilterBar / Prose / Toc / Lightbox / PdfViewer / ThemeToggle / LangSwitch …
  slots: string[]                           // nav-end / prose-top / prose-bottom …
  configSchema: ZodSchema                   // 主题级可配置项（colorMode/radius/lightbox/pdf/markdown…）
  locales?: Record<string, Record<string, string>> // UI 文案字典（i18n，禁止硬编码）
  vite?: (ctx) => UserConfig
  setup?: (ctx) => void
}
```

可通过 `extends` 继承另一主题并覆盖局部。

## 2. 设计令牌（CSS 变量，禁止硬编码颜色）

所有视觉必须在 `:root` 下用 `--mp-*` 令牌表达，深色模式仅换值、不改名：

```css
:root {
  --mp-color-bg: #FAFAFA;  --mp-color-surface: #FFFFFF;
  --mp-color-border: #E4E4E7; --mp-color-text: #09090B;
  --mp-color-muted: #52525B; --mp-color-accent: #2563EB;
  --mp-radius-sm: 6px; --mp-radius-md: 12px; --mp-radius-full: 999px;
  --mp-content-width: 1280px; --mp-grid-gutter: 24px;
  --mp-font-sans: 'Inter', system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --mp-duration: 200ms;
}
:root[data-theme='dark'] {
  --mp-color-bg: #0B0C0E; --mp-color-surface: #151719;
  --mp-color-border: #27272A; --mp-color-text: #F8FAFC;
  --mp-color-accent: #60A5FA;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; }
}
```

## 3. 无闪烁主题切换

在 `<head>` 内联约 300 字节同步脚本，于首帧前写 `documentElement.dataset.theme`（读 localStorage / `prefers-color-scheme`）。**禁止**用会闪烁的异步脚本或 CSS 动画过渡 `data-theme`。

## 4. 发布与 dogfooding 规则

- 包名建议 `@mineproj/theme-<name>` 或用户域名的 scoped 名。
- **默认主题即契约验证器（R3）**：`@mineproj/theme-classic` 必须始终能跑通；你新增的内核能力要先让 classic 用上且不破坏它，再考虑自定义主题。
- UI 文案一律走 `locales` 字典，由内核按 `defaultLocale → fallbackLocale` 注入；组件内 `ctx.t('card.view')` 取词，禁止写死中/英字符串。
- 性能预算：内容页 0KB JS、首页 ≤ 30KB gzip；主题不得引入会击穿预算的运行时依赖。

## 5. AI 协助要点

- 新增组件时同步更新 `components` 导出与 `configSchema`。
- 改令牌后跑对比：明暗两套视觉基线截图，确认对比度 ≥ 4.5:1、触控目标 ≥ 44×44px。
- 任何品牌皮肤（如沉浸式画廊风）只作为**可选**主题，不进入默认主题，且不得引用商业设计规范。

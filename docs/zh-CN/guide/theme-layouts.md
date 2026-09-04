# 主题布局与插槽

## 布局

mineproj 需要 7 个核心布局：主页（home）、列表（list）、详情（detail）、标签（tag）、合集（collection）、关于（about）和 404（notFound）。

每个布局是一个 React 组件，接收 `LayoutProps`。

## 插槽

插槽是插件可以注入组件的扩展点。主题声明插槽，插件向其贡献组件。

内置插槽包括：`header`、`footer`、`sidebar`、`editor-shell`。
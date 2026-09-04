# 主题 Islands

Islands 是在服务端预渲染并在客户端水合的交互式 React 组件。

## 声明 Islands

```ts
export default defineTheme({
  islands: ['theme-toggle', 'search-palette'],
});
```

## 工作原理

1. 构建时：主题将 Islands 渲染为带有序列化属性的 HTML
2. 打包时：独立的 Vite 进程将 Island 代码打包到 `@mp/islands.js`
3. 运行时：客户端加载 `@mp/islands.js` 并通过 `data-mp-island` 属性水合每个 Island
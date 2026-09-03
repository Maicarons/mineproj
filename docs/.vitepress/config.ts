import { defineConfig } from 'vitepress'

// 文档站部署基路径：GitHub Pages 项目站点通常为 /<repo>/。
// 本地预览可用 DOCS_BASE=/ 覆盖（例如：DOCS_BASE=/ npm run docs:dev）。
const base = process.env.DOCS_BASE ?? '/mineproj/'

// 注：如需中英双语，可在此追加 `locales` 配置（root 为 zh-CN，en 为 en-US），
// 并为每个 locale 提供对应的 themeConfig.nav / sidebar。产品本身的 i18n 方案见
// 《产品技术方案》§13。
export default defineConfig({
  base,
  title: 'mineproj',
  description: 'Apache-2.0 许可的纯前端个人项目展示静态站点生成器',
  lastUpdated: true,
  cleanUrls: true,
  appearance: 'toggle',
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    nav: [
      { text: '产品技术方案', link: '/plan/' },
      { text: '开发计划', link: '/plan/development' },
      { text: '指南', link: '/guide/getting-started' },
    ],
    sidebar: {
      '/plan/': [
        {
          text: '计划与方案',
          items: [
            { text: '产品技术方案', link: '/plan/' },
            { text: '开发计划', link: '/plan/development' },
          ],
        },
      ],
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Maicarons/mineproj' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 mineproj contributors',
    },
    editLink: {
      pattern: 'https://github.com/Maicarons/mineproj/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    docFooter: { prev: false, next: true },
    outline: { label: '本页目录' },
    lastUpdated: { text: '最后更新于' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})

import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE ?? '/mineproj/'

export default defineConfig({
  base,
  title: 'mineproj',
  description: 'Apache-2.0 licensed static site generator for personal project portfolios',
  lastUpdated: true,
  cleanUrls: true,
  appearance: 'toggle',
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Theme Dev', link: '/guide/theme-development' },
      { text: 'Plugin Dev', link: '/guide/plugin-development' },
      { text: 'API', link: '/guide/api-reference' },
      { text: 'Deploy', link: '/guide/deploying' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Quick Start', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Data Model', link: '/guide/data-model' },
            { text: 'Deploying', link: '/guide/deploying' },
          ],
        },
        {
          text: 'Theme Development',
          items: [
            { text: 'Theme Basics', link: '/guide/theme-development' },
            { text: 'Layouts & Slots', link: '/guide/theme-layouts' },
            { text: 'Islands', link: '/guide/theme-islands' },
          ],
        },
        {
          text: 'Plugin Development',
          items: [
            { text: 'Plugin Basics', link: '/guide/plugin-development' },
            { text: 'Lifecycle Hooks', link: '/guide/plugin-hooks' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'API Reference', link: '/guide/api-reference' },
            { text: 'CLI Reference', link: '/guide/cli-reference' },
            { text: 'Configuration Reference', link: '/guide/configuration' },
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
      text: 'Edit this page on GitHub',
    },
    docFooter: { prev: 'Previous', next: 'Next' },
    outline: { label: 'On this page' },
    lastUpdated: { text: 'Last updated' },
    returnToTopLabel: 'Back to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Appearance',
    lightModeSwitchTitle: 'Switch to light mode',
    darkModeSwitchTitle: 'Switch to dark mode',
  },
})
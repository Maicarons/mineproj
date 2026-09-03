import { defineConfig } from '@mineproj/core';

export default defineConfig({
  site: {
    title: 'Basic Example',
    description: 'An example mineproj site showcasing five personal projects.',
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    fallbackLocale: 'zh-CN',
  },
  dataDir: 'data',
  outDir: 'dist',
  publicDir: 'public',
  theme: '@mineproj/theme-classic',
});

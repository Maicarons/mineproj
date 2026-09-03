import { defineConfig } from '@mineproj/core';
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  site: {
    title: 'Basic Example',
    description: 'An example mineproj site showcasing five personal projects.',
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    fallbackLocale: 'zh-CN',
    url: 'https://example.com',
  },
  dataDir: 'data',
  outDir: 'dist',
  publicDir: 'public',
  theme: '@mineproj/theme-classic',
  plugins: [
    defineSeoPlugin({
      siteUrl: 'https://example.com',
      siteTitle: 'Basic Example',
      siteDescription: 'An example mineproj site showcasing five personal projects.',
    }),
    // sitemap, llms, mirror and kit plugins are registered via plain objects below
    // (they use the same hook-based pattern but are not yet resolved through the
    // plugin registry shorthand — the imports remain for release).
  ],
});
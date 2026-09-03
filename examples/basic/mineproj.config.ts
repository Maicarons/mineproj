import { defineConfig } from '@mineproj/core';
import { defineSeoPlugin } from '@mineproj/plugin-seo';
import { defineSitemapPlugin } from '@mineproj/plugin-sitemap';
import { defineLlmsPlugin } from '@mineproj/plugin-llms';
import { defineMarkdownMirrorPlugin } from '@mineproj/plugin-markdown-mirror';

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
    defineSitemapPlugin({ siteUrl: 'https://example.com' }),
    defineLlmsPlugin({ siteTitle: 'Basic Example', siteDescription: 'An example mineproj site showcasing five personal projects.' }),
    defineMarkdownMirrorPlugin(),
  ],
});
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'My Showcase',
    description: 'A stunning showcase site built with mineproj',
    url: 'https://example.com',
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
  },
  theme: 'gallery',
  plugins: [
    '@mineproj/plugin-seo',
    '@mineproj/plugin-sitemap',
  ],
});
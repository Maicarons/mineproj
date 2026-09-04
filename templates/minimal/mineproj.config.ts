import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'My Minimal Site',
    description: 'A minimal mineproj site.',
  },
  dataDir: 'data',
  outDir: 'dist',
  publicDir: 'public',
  theme: '@mineproj/theme-classic',
});
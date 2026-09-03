import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  dts: false,
  clean: true,
  external: ['react', 'react-dom', '@mineproj/core'],
})

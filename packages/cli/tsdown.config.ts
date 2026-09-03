import { defineConfig } from 'tsdown';
export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  outDir: 'dist',
  dts: false,
  clean: true,
  // Workspace packages ship TS sources; bundle them into the CLI binary.
  noExternal: [/^@mineproj\//],
  // jiti must stay external: it lazily requires files from its own dist directory.
  external: ['jiti', 'react', 'react-dom', 'react/jsx-runtime'],
});

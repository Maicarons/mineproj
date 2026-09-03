import { defineConfig } from 'tsdown';
export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  outDir: 'dist',
  dts: false,
  clean: true,
  // Workspace packages ship TS sources; bundle them into the CLI binary.
  noExternal: [/^@mineproj\//],
});

// ESLint flat config (ESLint 9+).
// Intentionally minimal: this is a planning/early-M0 repo. TypeScript files are
// ignored here (no @typescript-eslint parser wired yet); they are covered by
// `tsc`/build once real source lands. The goal is a green `pnpm lint` now.
export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.vitepress/**',
      '**/*.ts',
      '**/*.tsx',
      '**/*.vue',
      '**/*.mjs',
    ],
  },
]

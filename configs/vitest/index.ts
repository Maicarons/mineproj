import { defineConfig } from 'vitest/config';

export interface CreateVitestConfigOptions {
  environment?: 'node' | 'jsdom' | 'happy-dom';
  include?: string[];
  passWithNoTests?: boolean;
}

/**
 * Shared Vitest preset for mineproj workspace packages.
 * Packages create a `vitest.config.ts` that returns `createVitestConfig(...)`.
 */
export function createVitestConfig(options: CreateVitestConfigOptions = {}) {
  const {
    environment = 'node',
    include = ['src/**/*.test.ts'],
    passWithNoTests = true,
  } = options;

  return defineConfig({
    test: {
      environment,
      include,
      passWithNoTests,
      testTimeout: 30_000,
    },
  });
}

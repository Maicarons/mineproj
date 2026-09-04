import { defineConfig } from 'vitest/config';

export interface CreateVitestConfigOptions {
  environment?: 'node' | 'jsdom' | 'happy-dom';
  include?: string[];
  passWithNoTests?: boolean;
  coverage?: boolean;
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
    coverage = false,
  } = options;

  return defineConfig({
    test: {
      environment,
      include,
      passWithNoTests,
      testTimeout: 30_000,
    },
    ...(coverage
      ? {
          coverage: {
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
          },
        }
      : {}),
  });
}

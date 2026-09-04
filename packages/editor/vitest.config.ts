import { createVitestConfig } from '@mineproj/vitest';

export default createVitestConfig({
  include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
});
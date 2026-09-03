import { createVitestConfig } from '@mineproj/vitest';

export default createVitestConfig({
  environment: 'jsdom',
  include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
  webServer: {
    command: 'node ../../packages/cli/dist/cli.js preview --root ../../examples/basic --port 4173 --host 127.0.0.1 2>&1',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    cwd: process.cwd(),
  },
});

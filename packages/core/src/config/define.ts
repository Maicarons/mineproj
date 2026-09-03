import type { MineprojUserConfig } from './schema';

/**
 * Identity helper for `mineproj.config.ts`. Purely a typed entry point —
 * validation and defaults happen in `loadConfig`.
 */
export function defineConfig(config: MineprojUserConfig): MineprojUserConfig {
  return config;
}

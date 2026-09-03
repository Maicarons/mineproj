import { z } from 'zod';
import { siteConfigSchema } from '@mineproj/schema';

/**
 * User-facing mineproj config (`mineproj.config.ts`).
 * Input type: what users write. Resolved type: defaults filled in.
 */
export const mineprojConfigSchema = z.object({
  site: siteConfigSchema,
  /** Directory containing `profile.json`, `projects/`, etc. */
  dataDir: z.string().default('data'),
  /** Build output directory. */
  outDir: z.string().default('dist'),
  /** Directory copied verbatim into the build output root. */
  publicDir: z.string().default('public'),
  /** Theme package name or shorthand. */
  theme: z.string().default('@mineproj/theme-classic'),
  /** Free-form theme configuration, validated by the theme's own schema. */
  themeConfig: z.record(z.string(), z.unknown()).default({}),
  /** Plugin list: mineproj plugins and/or bare Vite plugins. */
  plugins: z.array(z.unknown()).default([]),
});

export type MineprojUserConfig = z.input<typeof mineprojConfigSchema>;
export type ResolvedMineprojConfig = z.output<typeof mineprojConfigSchema>;

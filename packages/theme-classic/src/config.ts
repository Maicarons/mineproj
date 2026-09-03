import { z } from 'zod';

/**
 * Theme config schema (M3-14). Users set these in `themeConfig`; the kernel
 * validates them against this schema during the build and the resolved
 * values are exposed to layouts via `props.themeConfig`.
 */
export const classicConfigSchema = z.object({
  /** Accent color; dark-mode variants derive automatically. */
  accent: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).default('#2563EB'),
  colorMode: z.enum(['light', 'dark', 'system']).default('system'),
  density: z.enum(['compact', 'comfortable']).default('comfortable'),
  contentWidth: z.union([z.literal(1200), z.literal(1280), z.literal(1440), z.literal('full')]).default(1280),
  palette: z.enum(['neutral', 'slate', 'warm', 'showcase']).default('neutral'),
  cardStyle: z.enum(['grid', 'wide', 'list', 'immersive']).default('grid'),
  heroMode: z.enum(['hero', 'grid', 'none']).default('grid'),
  radius: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
});

export type ClassicThemeConfig = z.infer<typeof classicConfigSchema>;

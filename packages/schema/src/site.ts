import { z } from 'zod';

/**
 * Site-level configuration (mineproj.config.ts `site` field).
 */
export const siteConfigSchema = z.object({
  /** Site title. */
  title: z.string().min(1),
  /** Site description (SEO meta description default source). */
  description: z.string().optional(),
  /** Canonical base URL, e.g. `https://example.com`. */
  url: z.url().optional(),
  /** Author info key into `data/profile.json`; inline object also allowed. */
  defaultLocale: z.string().default('zh-CN'),
  /** Enabled locales; first entry must equal `defaultLocale` (validated at use sites). */
  locales: z.array(z.string()).default(['zh-CN']),
  /** Locale to fall back to when a translation is missing. */
  fallbackLocale: z.string().optional(),
  /** Site-wide keywords (SEO). */
  keywords: z.array(z.string()).default([]),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

import { z } from 'zod';

/**
 * Site-level configuration (mineproj.config.ts `site` field).
 * i18n fields validated per M5-01: locales must contain the default locale
 * and the fallback locale must be an enabled locale.
 */
export const siteConfigSchema = z
  .object({
    /** Site title. */
    title: z.string().min(1),
    /** Site description (SEO meta description default source). */
    description: z.string().optional(),
    /** Canonical base URL, e.g. `https://example.com`. */
    url: z.url().optional(),
    /** Author info key into `data/profile.json`; inline object also allowed. */
    defaultLocale: z.string().default('zh-CN'),
    /** Enabled locales; must contain `defaultLocale`. */
    locales: z.array(z.string()).default(['zh-CN']),
    /** Locale to fall back to when a translation is missing. */
    fallbackLocale: z.string().optional(),
    /** When true the default locale is also served under `/<locale>/` prefixes. */
    prefixAll: z.boolean().default(false),
    /** Site-wide keywords (SEO). */
    keywords: z.array(z.string()).default([]),
  })
  .refine((s) => s.locales.includes(s.defaultLocale), {
    message: 'site.locales must contain site.defaultLocale',
    path: ['locales'],
  })
  .refine((s) => s.fallbackLocale === undefined || s.locales.includes(s.fallbackLocale), {
    message: 'site.fallbackLocale must be one of site.locales',
    path: ['fallbackLocale'],
  });

export type SiteConfig = z.infer<typeof siteConfigSchema>;

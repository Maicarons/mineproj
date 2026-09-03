// @mineproj/core — M0 scaffold entry.
// The real contracts (config schema, data model, plugin hooks, route/artifact
// emission) are designed in later M0 tasks; this file is a minimal, buildable
// surface so the workspace is green and dogfoodable.

export const VERSION = '0.0.0' as const

export interface SiteConfig {
  title: string
  description?: string
  url?: string
  defaultLocale?: string
  availableLocales?: string[]
}

export interface MineprojConfig {
  site: SiteConfig
  theme?: string
  themeConfig?: Record<string, unknown>
  plugins?: unknown[]
}

/** Identity helper: returns the config unchanged (typed entry point). */
export function defineConfig(config: MineprojConfig): MineprojConfig {
  return config
}

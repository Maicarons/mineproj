export interface ThemePackage {
  name: string
  version?: string
  layouts?: Record<string, unknown>
  components?: Record<string, unknown>
  slots?: string[]
  locales?: Record<string, Record<string, string>>
}

// Minimal scaffold of the default theme. Real layouts/components land in M3.
const theme: ThemePackage = {
  name: '@mineproj/theme-classic',
  layouts: {},
  components: {},
  slots: ['nav-end', 'prose-top', 'prose-bottom'],
}

export default theme

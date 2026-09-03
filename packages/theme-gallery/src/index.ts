export interface ThemePackage {
  name: string
  version?: string
  layouts?: Record<string, unknown>
  components?: Record<string, unknown>
  slots?: string[]
  locales?: Record<string, Record<string, string>>
}

// Minimal scaffold of the optional official "gallery" theme (no commercial branding).
const theme: ThemePackage = {
  name: '@mineproj/theme-gallery',
  layouts: {},
  components: {},
  slots: ['nav-end', 'prose-top', 'prose-bottom'],
}

export default theme

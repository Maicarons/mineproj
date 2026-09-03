/** Theme reference shorthands, split out to avoid import cycles. */

export const DEFAULT_THEME = '@mineproj/theme-classic';

export const SHORTHANDS: Record<string, string> = {
  classic: '@mineproj/theme-classic',
  gallery: '@mineproj/theme-gallery',
};

export function expandThemeReference(reference: string): string {
  return SHORTHANDS[reference] ?? reference;
}

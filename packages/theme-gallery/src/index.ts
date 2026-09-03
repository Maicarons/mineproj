import { defineTheme } from '@mineproj/core';

/**
 * @mineproj/theme-gallery — optional official theme: dark immersive gallery.
 * Extends the classic theme contract (same layouts, components, slots) but
 * overrides the design tokens for a showcase-style presentation.
 * Switching between classic and gallery is a one-line config change.
 */

const galleryTokens = `/* Gallery theme overrides — dark immersive showcase palette */
:root:not([data-palette]) {
  --mp-color-bg: #1B2838;
  --mp-color-surface: #0F1C25;
  --mp-color-surface-alt: #16222E;
  --mp-color-border: #2A3F51;
  --mp-color-text: #C7D5E0;
  --mp-color-muted: #8FA3B0;
  --mp-color-accent: #67C1F5;
  --mp-radius-card: 0px;
  --mp-shadow-1: none;
  --mp-shadow-2: none;
}
`;

const theme = defineTheme({
  name: '@mineproj/theme-gallery',
  version: '0.1.0',
  extends: '@mineproj/theme-classic',
  layouts: {},
  styles: [galleryTokens],
});

export default theme;
export { theme };
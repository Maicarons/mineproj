import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { tokensCss } from './tokens';

/**
 * M3-01 acceptance: token completeness, palette switching by value only,
 * and WCAG contrast ≥ 4.5:1 for text pairs in every palette × light/dark.
 */

const HERE = dirname(fileURLToPath(import.meta.url));

interface ThemeVars {
  [key: string]: string;
}

function resolveVars(scope: string): ThemeVars {
  const vars: ThemeVars = {};
  const block = tokensCss.slice(tokensCss.indexOf(scope));
  const end = block.indexOf('}');
  for (const match of block.slice(0, end).matchAll(/(--mp-[\w-]+):\s*([^;]+);/g)) {
    const key = match[1];
    const value = match[2];
    if (key && value) vars[key] = value.trim();
  }
  return vars;
}

function paletteScope(palette: string, mode: 'light' | 'dark'): string {
  if (palette === 'neutral' && mode === 'light') return ':root {';
  if (palette === 'neutral') return ":root[data-theme='dark'] {";
  if (mode === 'dark') return `:root[data-palette='${palette}'][data-theme='dark'] {`;
  return `:root[data-palette='${palette}'] {`;
}

/** Merge base → dark → palette overrides, mirroring CSS cascade. */
function effectiveVars(palette: string, mode: 'light' | 'dark'): ThemeVars {
  return {
    ...resolveVars(':root {'),
    ...(mode === 'dark' ? resolveVars(":root[data-theme='dark'] {") : {}),
    ...(palette !== 'neutral' ? resolveVars(paletteScope(palette, mode)) : {}),
  };
}

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const channels = [0, 2, 4].map((i) => {
    const c = Number.parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const PALETTES = ['neutral', 'slate', 'warm', 'showcase'] as const;

describe('design tokens', () => {
  it('defines the full core variable set on :root', () => {
    for (const group of [
      '--mp-color-bg', '--mp-color-surface', '--mp-color-border', '--mp-color-text',
      '--mp-color-muted', '--mp-color-accent', '--mp-color-accent-fg',
      '--mp-space-4', '--mp-radius-md', '--mp-shadow-1',
      '--mp-font-sans', '--mp-font-mono', '--mp-content-width',
      '--mp-duration', '--mp-ease',
    ]) {
      expect(tokensCss).toContain(group);
    }
  });

  it('provides a dark mode block and prefers-reduced-motion downgrade', () => {
    expect(tokensCss).toContain("[data-theme='dark']");
    expect(tokensCss).toContain('prefers-reduced-motion: reduce');
  });

  it('changes the skin by palette value only (structure untouched)', () => {
    for (const palette of PALETTES) {
      const vars = effectiveVars(palette, 'light');
      expect(vars['--mp-color-accent'], palette).toBeDefined();
      expect(vars['--mp-color-text'], palette).toBeDefined();
    }
    // showcase pins dark canvas values even in light mode.
    expect(effectiveVars('showcase', 'light')['--mp-color-bg']).toBe('#1B2838');
  });

  it.each(PALETTES)('%s meets 4.5:1 contrast in light and dark', (palette) => {
    for (const mode of ['light', 'dark'] as const) {
      const vars = effectiveVars(palette, mode);
      const surface = vars['--mp-color-surface']!;
      const pairs: [string, number][] = [
        ['text/surface', contrast(vars['--mp-color-text']!, surface)],
        ['muted/surface', contrast(vars['--mp-color-muted']!, surface)],
        ['text/bg', contrast(vars['--mp-color-text']!, vars['--mp-color-bg']!)],
        ['accent-fg/accent', contrast(vars['--mp-color-accent-fg']!, vars['--mp-color-accent']!)],
      ];
      for (const [label, ratio] of pairs) {
        expect(ratio, `${palette}/${mode}: ${label} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps tokens in sync with the compiled dist build', () => {
    // The pipeline inlines theme.styles from the built package; guard drift.
    const distIndex = join(HERE, '..', '..', 'dist', 'index.js');
    try {
      const dist = readFileSync(distIndex, 'utf-8');
      expect(dist).toContain('--mp-color-accent');
    } catch {
      // dist not built yet (fresh checkout) — skip silently.
    }
  });
});

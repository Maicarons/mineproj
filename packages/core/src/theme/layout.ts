import type { ComponentType } from 'react';
import type { Theme } from './contract';

/**
 * Layout dispatch (M2-07): picks the layout for a route type from the site
 * theme; when the theme does not implement it, the fallback theme's layout
 * is used and a warning is recorded — a mini theme implementing only `home`
 * can still build a full site.
 */

export interface LayoutDispatch {
  Layout: ComponentType<Record<string, unknown>> | undefined;
  usedFallback: boolean;
}

export function dispatchLayout(
  theme: Theme,
  layoutName: string,
  fallbackTheme?: Theme,
): LayoutDispatch {
  const own = theme.layouts[layoutName];
  if (own) return { Layout: own, usedFallback: false };

  if (fallbackTheme && fallbackTheme.layouts[layoutName]) {
    return { Layout: fallbackTheme.layouts[layoutName], usedFallback: true };
  }
  return { Layout: undefined, usedFallback: false };
}

/** Collect warnings for every core layout the theme is missing. */
export function missingLayouts(theme: Theme, coreLayouts: readonly string[]): string[] {
  return coreLayouts.filter((layout) => !theme.layouts[layout]);
}

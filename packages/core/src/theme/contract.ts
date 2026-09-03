import type { ComponentType } from 'react';
import type { ZodType } from 'zod';
import type { PluginSetupContext } from '../plugin/contract';

/**
 * Theme contract (M2-06). A theme is a default-exported object with layouts,
 * an optional component registry, slots, a config schema and locales.
 * `extends` composes themes: the child wins, everything it omits is
 * inherited from the parent.
 */

export interface ThemeViteConfig {
  plugins?: unknown[];
  css?: string[];
}

export interface ThemeSetupContext extends PluginSetupContext {
  /** The theme configuration after schema validation. */
  themeConfig: Record<string, unknown>;
  logger: {
    log: (message: string) => void;
    warn: (message: string) => void;
  };
}

export interface Theme {
  name: string;
  version?: string;
  /** Layout per route type; required keys are validated at resolution time. */
  layouts: Record<string, ComponentType<Record<string, unknown>>>;
  /** Named component registry, overridable by users and plugins. */
  components?: Record<string, ComponentType<Record<string, unknown>>>;
  /** Slot names the theme renders. */
  slots?: string[];
  /** Zod schema for themeConfig; unknown keys rejected. */
  configSchema?: ZodType;
  /** Locale dictionaries: locale → key → string. */
  locales?: Record<string, Record<string, string>>;
  /** Vite contributions merged into the final build config. */
  vite?: ThemeViteConfig;
  /** Install-time hook. */
  setup?: (ctx: ThemeSetupContext) => void;
  /** Parent theme (inline object or resolvable reference string). */
  extends?: Theme | string;
}

/** Identity helper for theme authors. */
export function defineTheme(theme: Theme): Theme {
  return theme;
}

export function isThemeLike(value: unknown): value is Theme {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Theme).name === 'string' &&
    typeof (value as Theme).layouts === 'object' &&
    (value as Theme).layouts !== null
  );
}

/**
 * Resolve the `extends` chain into one flat theme. The child always wins;
 * maps (layouts, components, slots, locales) are merged key-by-key, scalars
 * are inherited only when the child does not define them. Cycles throw.
 * String parents are resolved through `loadExternal` (which may be async).
 */
export async function resolveThemeExtends(
  theme: Theme,
  loadExternal?: (reference: string) => Theme | Promise<Theme>,
): Promise<Theme> {
  const chain: Theme[] = [];
  const seen = new Set<string>();
  let current: Theme | undefined = theme;

  while (current !== undefined) {
    if (seen.has(current.name)) {
      throw new Error(`Circular theme extends chain at "${current.name}"`);
    }
    seen.add(current.name);
    chain.push(current);
    const parent: Theme['extends'] = current.extends;
    if (parent === undefined) break;
    if (typeof parent === 'string') {
      if (loadExternal === undefined) {
        throw new Error(
          `Theme "${current.name}" extends "${parent}" but string references require resolveTheme()`,
        );
      }
      current = await loadExternal(parent);
    } else if (isThemeLike(parent)) {
      current = parent;
    } else {
      throw new Error(`Invalid extends value in theme "${current.name}"`);
    }
  }
  // Merge from the root ancestor down to the theme itself.
  const ordered = [...chain].reverse();
  const merged: Theme = {
    name: theme.name,
    layouts: {},
  };
  // Apply from the root ancestor down to the theme itself.
  for (const link of ordered) {
    merged.layouts = { ...merged.layouts, ...link.layouts };
    merged.components = { ...(merged.components ?? {}), ...(link.components ?? {}) };
    if (link.slots !== undefined || merged.slots === undefined) {
      merged.slots = [...(merged.slots ?? []), ...(link.slots ?? [])];
    }
    merged.locales = { ...(merged.locales ?? {}), ...(link.locales ?? {}) };
    merged.vite = { ...(merged.vite ?? {}), ...(link.vite ?? {}) };
    if (link.configSchema !== undefined) merged.configSchema = link.configSchema;
    if (link.version !== undefined) merged.version = link.version;
  }
  merged.slots = [...new Set(merged.slots ?? [])];
  return merged;
}

import { CORE_LAYOUTS } from '@mineproj/core';
import { isMineprojPlugin } from '@mineproj/core';

/**
 * Contract test utilities (M2-16/17): any theme or plugin must pass the same
 * assertions in CI. Returns a result object instead of throwing so test
 * frameworks can assert on messages.
 */

export interface ContractResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function ok(): ContractResult {
  return { ok: true, errors: [], warnings: [] };
}

export interface ThemeContractOptions {
  /** Core layouts the theme must implement itself (default: only `home`). */
  requiredLayouts?: string[];
  /** When true, all seven core layouts must be implemented by the theme itself. */
  requireAllLayouts?: boolean;
}

/**
 * Validate a resolved (extends-flattened) theme. A mini theme implementing
 * only `home` passes with warnings for the inherited layouts.
 */
export function runThemeContract(theme: unknown, options: ThemeContractOptions = {}): ContractResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof theme !== 'object' || theme === null) {
    return { ok: false, errors: ['theme must be an object'], warnings };
  }
  const t = theme as Record<string, unknown>;

  if (typeof t.name !== 'string' || t.name.length === 0) {
    errors.push('theme.name must be a non-empty string');
  }

  const layouts = t.layouts;
  if (typeof layouts !== 'object' || layouts === null) {
    errors.push('theme.layouts must be an object');
  } else {
    const names = Object.keys(layouts as object);
    if (names.length === 0) {
      errors.push('theme.layouts must implement at least one layout');
    }
    for (const name of names) {
      if (typeof (layouts as Record<string, unknown>)[name] !== 'function') {
        errors.push(`layout "${name}" must be a component (function)`);
      }
    }
    const implemented = layouts as Record<string, unknown>;
    if (options.requireAllLayouts) {
      for (const layout of CORE_LAYOUTS) {
        if (!(layout in implemented)) {
          errors.push(`core layout "${layout}" is required when requireAllLayouts is set`);
        }
      }
    } else {
      const required = options.requiredLayouts ?? ['home'];
      for (const layout of required) {
        if (!(layout in implemented)) {
          errors.push(`required layout "${layout}" is not implemented`);
        }
      }
      for (const layout of CORE_LAYOUTS) {
        if (!(layout in implemented) && !required.includes(layout)) {
          warnings.push(`layout "${layout}" is not implemented; the fallback theme will be used`);
        }
      }
    }
  }

  if (t.slots !== undefined && !Array.isArray(t.slots)) {
    errors.push('theme.slots must be an array of slot names');
  }

  if (t.locales !== undefined) {
    const locales = t.locales as Record<string, unknown>;
    for (const [locale, dict] of Object.entries(locales)) {
      if (typeof dict !== 'object' || dict === null) {
        errors.push(`locales.${locale} must be an object of key → string`);
      }
    }
  }

  const schema = t.configSchema as { safeParse?: (v: unknown) => unknown } | undefined;
  if (schema !== undefined && typeof schema.safeParse !== 'function') {
    errors.push('theme.configSchema must be a zod-like schema with safeParse()');
  }

  return { ok: errors.length === 0, errors, warnings };
}

/** Validate a plugin object against the mineproj plugin contract. */
export function runPluginContract(plugin: unknown): ContractResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isMineprojPlugin(plugin)) {
    return { ok: false, errors: ['plugin must be a mineproj plugin object (name + hooks/setup)'], warnings };
  }
  const p = plugin as Record<string, unknown>;

  if (typeof p.name !== 'string' || p.name.length === 0) {
    errors.push('plugin.name must be a non-empty string');
  }
  const hooks = p.hooks as Record<string, unknown> | undefined;
  if (hooks !== undefined) {
    for (const [hook, handler] of Object.entries(hooks)) {
      if (typeof handler !== 'function') {
        errors.push(`hook "${hook}" must be a function`);
      }
    }
  }
  if (hooks === undefined && typeof p.setup !== 'function') {
    warnings.push('plugin has neither hooks nor setup — it will not do anything');
  }
  const schema = p.optionsSchema as { safeParse?: (v: unknown) => unknown } | undefined;
  if (schema !== undefined && typeof schema.safeParse !== 'function') {
    errors.push('plugin.optionsSchema must be a zod-like schema with safeParse()');
  }

  return { ok: errors.length === 0, errors, warnings };
}

import { z } from 'zod';
import { PluginCycleError, sortPlugins } from '../hooks';
import { DataError } from '../data/loader';
import {
  isMineprojPlugin,
  normalizePluginEntry,
  resolvePluginShorthand,
  type MineprojPlugin,
  type PluginInput,
} from './contract';

/**
 * Plugin registry (M2-02): normalizes config entries, validates options,
 * topologically sorts mineproj plugins (enforce + before/after with cycle
 * detection) and separates bare Vite plugins for passthrough.
 */

export class PluginRegistry {
  readonly plugins: MineprojPlugin[];
  readonly vitePlugins: unknown[];

  constructor(plugins: MineprojPlugin[], vitePlugins: unknown[]) {
    this.plugins = plugins;
    this.vitePlugins = vitePlugins;
  }

  describe(): { name: string; enforce: string; hooks: string[]; options: unknown }[] {
    return this.plugins.map((p) => ({
      name: p.name,
      enforce: p.enforce ?? 'normal',
      hooks: Object.keys(p.hooks ?? {}),
      options: p.options,
    }));
  }
}

/**
 * Resolve and register the `plugins` config array. Shorthand strings are
 * expanded, options validated against `optionsSchema` when present, and
 * ordering constraints enforced with readable cycle errors.
 */
export function createPluginRegistry(entries: unknown[], logger?: { warn: (m: string) => void }): PluginRegistry {
  const mineproj: MineprojPlugin[] = [];
  const vite: unknown[] = [];

  for (const entry of entries as PluginInput[]) {
    const normalized = normalizePluginEntry(entry);
    if ('vite' in normalized) {
      vite.push(normalized.vite);
      continue;
    }
    let { plugin, options } = normalized;

    // Shorthand resolution also applies to string-provided references that
    // have already been imported by the caller as bare objects with short
    // names. Constraints (before/after) are mapped through the same rule so
    // ordering keeps working after expansion.
    if (typeof plugin.name === 'string' && !plugin.name.startsWith('@') && !plugin.name.startsWith('mineproj-plugin-')) {
      plugin = {
        ...plugin,
        name: resolvePluginShorthand(plugin.name),
        before: plugin.before?.map(resolvePluginShorthand),
        after: plugin.after?.map(resolvePluginShorthand),
      };
    }

    if (plugin.optionsSchema) {
      const result = (plugin.optionsSchema as z.ZodType).safeParse(options ?? {});
      if (!result.success) {
        throw new DataError(
          `Invalid options for plugin ${plugin.name}:\n` +
            result.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n'),
        );
      }
      options = result.data;
    }
    mineproj.push({ ...plugin, options });
  }

  let sorted: MineprojPlugin[];
  try {
    sorted = sortPlugins(mineproj);
  } catch (err) {
    if (err instanceof PluginCycleError) {
      throw new DataError(`Cannot register plugins: ${(err as Error).message}`);
    }
    throw err;
  }

  void logger;
  return new PluginRegistry(sorted, vite);
}

/** Re-export for convenience: is a config entry a bare Vite plugin? */
export { isMineprojPlugin };

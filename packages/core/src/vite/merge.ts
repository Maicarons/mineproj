/**
 * Vite passthrough (M2-13): plugins' `vite[]` arrays and the theme's
 * `vite{}` contributions are merged into the final Vite config. Bare Vite
 * plugins from the ecosystem (PWA, icons, compress…) work without a wrapper.
 */

export interface ViteContribution {
  source: string;
  plugins?: unknown[];
  css?: string[];
}

export interface ViteMergeResult {
  plugins: unknown[];
  css: string[];
  /** Plugin names contributed more than once, with their sources. */
  conflicts: { name: string; sources: string[] }[];
}

function pluginNameOf(plugin: unknown): string | undefined {
  if (typeof plugin === 'object' && plugin !== null && 'name' in plugin) {
    const name = (plugin as { name?: unknown }).name;
    if (typeof name === 'string') return name;
  }
  return undefined;
}

/**
 * Merge contributions in order; later contributions override same-named
 * object plugins (a documented conflict), while duplicates are reported.
 */
export function mergeViteContributions(contributions: ViteContribution[]): ViteMergeResult {
  const plugins: unknown[] = [];
  const css: string[] = [];
  const nameSources = new Map<string, string[]>();
  const seen = new Set<string>();

  for (const contribution of contributions) {
    for (const cssFile of contribution.css ?? []) {
      if (!css.includes(cssFile)) css.push(cssFile);
    }
    for (const plugin of contribution.plugins ?? []) {
      const name = pluginNameOf(plugin);
      if (name !== undefined) {
        const sources = nameSources.get(name) ?? [];
        sources.push(contribution.source);
        nameSources.set(name, sources);
        if (seen.has(name)) {
          // Later contribution replaces the earlier plugin of the same name.
          const index = plugins.findIndex(
            (p) => pluginNameOf(p) === name,
          );
          if (index >= 0) plugins.splice(index, 1);
        }
        seen.add(name);
      }
      plugins.push(plugin);
    }
  }

  const conflicts = [...nameSources.entries()]
    .filter(([, sources]) => sources.length > 1)
    .map(([name, sources]) => ({ name, sources }));

  return { plugins, css, conflicts };
}

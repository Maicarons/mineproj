import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { definePlugin, isMineprojPlugin, normalizePluginEntry, resolvePluginShorthand } from './contract';

describe('isMineprojPlugin', () => {
  it('recognizes plugins by hooks', () => {
    expect(isMineprojPlugin({ name: 'x', hooks: { 'build:done': () => {} } })).toBe(true);
  });

  it('recognizes plugins by setup function', () => {
    expect(isMineprojPlugin({ name: 'x', setup: () => {} })).toBe(true);
  });

  it('recognizes plugins by conventional package names', () => {
    expect(isMineprojPlugin({ name: 'mineproj-plugin-analytics' })).toBe(true);
    expect(isMineprojPlugin({ name: '@mineproj/plugin-seo' })).toBe(true);
  });

  it('treats bare Vite plugins as passthrough', () => {
    expect(isMineprojPlugin({ name: 'vite-plugin-pwa', apply: 'build' })).toBe(false);
    expect(isMineprojPlugin({ name: 'something-else' })).toBe(false);
    expect(isMineprojPlugin('a-string')).toBe(false);
    expect(isMineprojPlugin(null)).toBe(false);
  });
});

describe('resolvePluginShorthand', () => {
  it('expands short names to @mineproj/plugin-*', () => {
    expect(resolvePluginShorthand('seo')).toBe('@mineproj/plugin-seo');
    expect(resolvePluginShorthand('sitemap')).toBe('@mineproj/plugin-sitemap');
  });

  it('passes full names through untouched', () => {
    expect(resolvePluginShorthand('mineproj-plugin-analytics')).toBe('mineproj-plugin-analytics');
    expect(resolvePluginShorthand('@mineproj/plugin-seo')).toBe('@mineproj/plugin-seo');
    expect(resolvePluginShorthand('@scope/plugin-custom')).toBe('@scope/plugin-custom');
  });
});

describe('normalizePluginEntry', () => {
  it('returns plugin + options for tuple form', () => {
    const plugin = definePlugin({ name: '@mineproj/plugin-sitemap' });
    const entry = normalizePluginEntry([plugin, { exclude: ['/drafts/**'] }]);
    expect(entry).toEqual({ plugin, options: { exclude: ['/drafts/**'] } });
  });

  it('returns plugin without options for bare plugin form', () => {
    const plugin = definePlugin({ name: '@mineproj/plugin-seo' });
    expect(normalizePluginEntry(plugin)).toEqual({ plugin, options: undefined });
  });

  it('passes bare Vite plugins through', () => {
    const vitePlugin = { name: 'vite-plugin-x', transform() {} };
    expect(normalizePluginEntry(vitePlugin)).toEqual({ vite: vitePlugin });
  });
});

describe('definePlugin', () => {
  it('is an identity helper preserving the shape', () => {
    const plugin = definePlugin({
      name: 'mineproj-plugin-test',
      optionsSchema: z.object({ width: z.number().default(1200) }),
      hooks: { 'build:done': () => {} },
      components: { Badge: () => null },
    });
    expect(plugin.name).toBe('mineproj-plugin-test');
    expect(plugin.optionsSchema?.safeParse({}).success).toBe(true);
    expect(typeof plugin.hooks?.['build:done']).toBe('function');
  });
});

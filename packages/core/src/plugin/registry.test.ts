import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { definePlugin } from './contract';
import { createPluginRegistry } from './registry';
import { DataError } from '../data/loader';

describe('createPluginRegistry', () => {
  it('sorts plugins by enforce and before/after', () => {
    const registry = createPluginRegistry([
      definePlugin({ name: 'mineproj-plugin-post', enforce: 'post', hooks: {} }),
      definePlugin({ name: 'mineproj-plugin-pre', enforce: 'pre', hooks: {} }),
      definePlugin({ name: 'mineproj-plugin-normal', after: ['mineproj-plugin-pre'], hooks: {} }),
    ]);
    expect(registry.plugins.map((p) => p.name)).toEqual([
      'mineproj-plugin-pre',
      'mineproj-plugin-normal',
      'mineproj-plugin-post',
    ]);
  });

  it('separates bare Vite plugins for passthrough', () => {
    const vitePlugin = { name: 'vite-plugin-pwa' };
    const registry = createPluginRegistry([
      vitePlugin,
      definePlugin({ name: 'mineproj-plugin-x', hooks: {} }),
    ]);
    expect(registry.vitePlugins).toEqual([vitePlugin]);
    expect(registry.plugins.map((p) => p.name)).toEqual(['mineproj-plugin-x']);
  });

  it('expands short plugin names during registration', () => {
    const registry = createPluginRegistry([definePlugin({ name: 'seo', hooks: {} })]);
    expect(registry.plugins[0]?.name).toBe('@mineproj/plugin-seo');
  });

  it('applies defaults from optionsSchema', () => {
    const registry = createPluginRegistry([
      definePlugin({
        name: '@mineproj/plugin-og-image',
        optionsSchema: z.object({ width: z.number().default(1200) }),
        hooks: {},
      }),
    ]);
    expect(registry.plugins[0]?.options).toEqual({ width: 1200 });
  });

  it('rejects invalid options with a readable error', () => {
    expect(() =>
      createPluginRegistry([
        definePlugin({
          name: '@mineproj/plugin-og-image',
          optionsSchema: z.object({ width: z.number() }),
          hooks: {},
        }),
        ['unused'],
      ]).plugins,
    ).toThrow(/Invalid options for plugin @mineproj\/plugin-og-image/);
  });

  it('reports cycle errors across plugins', () => {
    // a before b before c before a — a genuine cycle. Shorthand names are
    // expanded during registration and constraints must follow.
    expect(() =>
      createPluginRegistry([
        definePlugin({ name: 'a-plugin', before: ['b-plugin'], hooks: {} }),
        definePlugin({ name: 'b-plugin', before: ['c-plugin'], hooks: {} }),
        definePlugin({ name: 'c-plugin', before: ['a-plugin'], hooks: {} }),
      ]),
    ).toThrow(DataError);
    expect(() =>
      createPluginRegistry([
        definePlugin({ name: 'a-plugin', before: ['b-plugin'], hooks: {} }),
        definePlugin({ name: 'b-plugin', before: ['c-plugin'], hooks: {} }),
        definePlugin({ name: 'c-plugin', before: ['a-plugin'], hooks: {} }),
      ]),
    ).toThrow(/Circular plugin dependency/);
  });

  it('describes the registry for diagnostics', () => {
    const registry = createPluginRegistry([
      definePlugin({
        name: 'mineproj-plugin-analytics',
        enforce: 'post',
        hooks: { 'build:done': () => {}, emit: () => {} },
        options: undefined,
      }),
    ]);
    const info = registry.describe();
    expect(info).toEqual([
      {
        name: 'mineproj-plugin-analytics',
        enforce: 'post',
        hooks: ['build:done', 'emit'],
        options: undefined,
      },
    ]);
  });
});

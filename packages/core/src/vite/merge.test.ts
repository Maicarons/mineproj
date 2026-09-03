import { describe, expect, it } from 'vitest';
import { mergeViteContributions } from './merge';

describe('mergeViteContributions', () => {
  it('concatenates plugins and css from all contributions', () => {
    const result = mergeViteContributions([
      { source: 'theme', plugins: [{ name: 'a-plugin' }], css: ['tokens.css'] },
      { source: 'plugin:mineproj-plugin-pwa', plugins: [{ name: 'vite-plugin-pwa' }], css: ['pwa.css'] },
    ]);
    expect(result.plugins.map((p) => (p as { name: string }).name)).toEqual(['a-plugin', 'vite-plugin-pwa']);
    expect(result.css).toEqual(['tokens.css', 'pwa.css']);
    expect(result.conflicts).toEqual([]);
  });

  it('deduplicates css entries', () => {
    const result = mergeViteContributions([
      { source: 'a', plugins: [], css: ['shared.css'] },
      { source: 'b', plugins: [], css: ['shared.css', 'extra.css'] },
    ]);
    expect(result.css).toEqual(['shared.css', 'extra.css']);
  });

  it('detects same-named plugin conflicts and reports both sources', () => {
    const pwa = { name: 'vite-plugin-pwa' };
    const result = mergeViteContributions([
      { source: 'theme', plugins: [pwa] },
      { source: 'plugin:mineproj-plugin-analytics', plugins: [{ name: 'vite-plugin-pwa', strategies: ['autoUpdate'] }] },
    ]);
    expect(result.conflicts).toEqual([
      { name: 'vite-plugin-pwa', sources: ['theme', 'plugin:mineproj-plugin-analytics'] },
    ]);
    // Later contribution wins — one instance remains.
    expect(result.plugins).toHaveLength(1);
  });

  it('keeps anonymous plugins without conflict tracking', () => {
    const fnPlugin = function transformer() {};
    const result = mergeViteContributions([
      { source: 'a', plugins: [fnPlugin], css: [] },
      { source: 'b', plugins: [fnPlugin], css: [] },
    ]);
    expect(result.plugins).toHaveLength(2);
    expect(result.conflicts).toEqual([]);
  });
});

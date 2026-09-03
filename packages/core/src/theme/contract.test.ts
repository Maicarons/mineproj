import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { defineTheme, resolveThemeExtends, type Theme } from './contract';

const noop = () => null;

const parentTheme: Theme = defineTheme({
  name: 'parent-theme',
  layouts: { home: noop, list: noop, detail: noop, tag: noop, collection: noop, about: noop, notFound: noop },
  components: { ProjectCard: noop, Footer: noop },
  slots: ['card-badge', 'nav-end'],
  locales: { 'zh-CN': { search: '搜索' } },
  vite: { plugins: [{ name: 'vite-plugin-parent' }] },
  version: '1.0.0',
});

describe('defineTheme', () => {
  it('is an identity helper', () => {
    const theme = defineTheme({ name: 'x', layouts: { home: noop } });
    expect(theme.name).toBe('x');
    expect(typeof theme.layouts.home).toBe('function');
  });
});

describe('resolveThemeExtends', () => {
  it('returns the theme itself when it has no parent', async () => {
    const resolved = await resolveThemeExtends(parentTheme);
    expect(resolved.name).toBe('parent-theme');
    expect(Object.keys(resolved.layouts)).toHaveLength(7);
    expect(resolved.components?.Footer).toBeDefined();
  });

  it('inherits everything the child omits and keeps child overrides', async () => {
    const child: Theme = defineTheme({
      name: 'child-theme',
      extends: parentTheme,
      layouts: { home: function ChildHome() { return null; } },
      components: { ProjectCard: function ChildCard() { return null; } },
    });
    const resolved = await resolveThemeExtends(child);
    expect(resolved.name).toBe('child-theme');
    // Child override wins
    expect(resolved.layouts.home).toBe(child.layouts.home);
    // Parent layouts inherited
    expect(resolved.layouts.detail).toBe(parentTheme.layouts.detail);
    // Components merged: override kept, missing inherited
    expect(resolved.components?.ProjectCard).toBe(child.components?.ProjectCard);
    expect(resolved.components?.Footer).toBe(parentTheme.components?.Footer);
    // Slots and locales inherited
    expect(resolved.slots).toEqual(['card-badge', 'nav-end']);
    expect(resolved.locales?.['zh-CN']?.search).toBe('搜索');
    // Scalars inherited
    expect(resolved.version).toBe('1.0.0');
  });

  it('follows string references through the loader callback', async () => {
    const child: Theme = defineTheme({
      name: 'child-theme',
      extends: '@mineproj/theme-classic',
      layouts: { home: noop },
    });
    const resolved = await resolveThemeExtends(child, async (reference) => {
      expect(reference).toBe('@mineproj/theme-classic');
      return parentTheme;
    });
    expect(resolved.layouts.list).toBe(parentTheme.layouts.list);
  });

  it('resolves multi-level chains with nearest override winning', async () => {
    const grandparent: Theme = defineTheme({
      name: 'grand',
      layouts: { home: noop, list: noop },
      slots: ['footer'],
    });
    const mid: Theme = defineTheme({
      name: 'mid',
      extends: grandparent,
      layouts: { list: function MidList() { return null; } },
      slots: ['nav-end'],
    });
    const resolved = await resolveThemeExtends({ name: 'leaf', extends: mid, layouts: {} });
    expect(resolved.slots).toEqual(['footer', 'nav-end']);
    expect(Object.keys(resolved.layouts).sort()).toEqual(['home', 'list']);
    expect(resolved.layouts.list).toBe(mid.layouts.list);
  });

  it('throws on circular extends chains', async () => {
    const a = { name: 'theme-a', layouts: {} } as unknown as Theme;
    const b: Theme = { name: 'theme-b', layouts: {}, extends: a };
    (a as { extends?: unknown }).extends = b;
    await expect(resolveThemeExtends(a)).rejects.toThrow(/Circular theme extends chain/);
  });

  it('throws when a string parent has no loader', async () => {
    const child: Theme = defineTheme({ name: 'child', layouts: {}, extends: 'somewhere' });
    await expect(resolveThemeExtends(child)).rejects.toThrow(/string references require resolveTheme/);
  });

  it('supports configSchema inheritance', async () => {
    const child: Theme = defineTheme({
      name: 'child',
      extends: { name: 'parent', layouts: { home: noop }, configSchema: z.object({ accent: z.string().default('#000') }) },
      layouts: { home: noop },
    });
    const resolved = await resolveThemeExtends(child);
    expect(resolved.configSchema?.safeParse({}).success).toBe(true);
  });
});

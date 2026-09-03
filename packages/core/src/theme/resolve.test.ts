import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineTheme, type Theme } from './contract';
import { DEFAULT_THEME, resolveTheme, ThemeResolutionError } from './resolve';

let root: string;

const noop = () => null;

function makeTheme(name: string): Theme {
  return {
    name,
    layouts: {
      home: noop,
      list: noop,
      detail: noop,
      tag: noop,
      collection: noop,
      about: noop,
      notFound: noop,
    },
  };
}

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-theme-${Math.random().toString(36).slice(2)}`);
  await mkdir(root, { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('resolveTheme', () => {
  it('falls back to the default theme for undefined references', async () => {
    const theme = await resolveTheme(undefined, { root, loadThemeReference: async () => makeTheme('stub') });
    expect(theme.name).toBe(DEFAULT_THEME);
  });

  it('resolves inline theme objects', async () => {
    const inline = makeTheme('my-inline-theme');
    const theme = await resolveTheme(inline, { root });
    expect(theme.name).toBe('my-inline-theme');
    expect(theme.layouts.home).toBe(noop);
  });

  it('rejects malformed inline objects', async () => {
    await expect(resolveTheme({ name: 'no-layouts' } as unknown as Theme, { root })).rejects.toThrow(
      ThemeResolutionError,
    );
  });

  it('resolves shorthand references through the package loader', async () => {
    const theme = await resolveTheme('classic', {
      root,
      loadThemeReference: async (ref) => {
        expect(ref).toBe('@mineproj/theme-classic');
        return makeTheme('@mineproj/theme-classic');
      },
    });
    expect(theme.name).toBe('@mineproj/theme-classic');
  });

  it('expands the gallery shorthand', async () => {
    const theme = await resolveTheme('gallery', {
      root,
      loadThemeReference: async (ref) => makeTheme(ref),
    });
    expect(theme.name).toBe('@mineproj/theme-gallery');
  });

  it('loads themes from a local .mineproj/theme directory', async () => {
    await mkdir(join(root, '.mineproj', 'theme'), { recursive: true });
    await writeFile(
      join(root, '.mineproj', 'theme', 'index.ts'),
      `import { defineTheme } from '@mineproj/core';
export default defineTheme({
  name: 'my-local-theme',
  layouts: {
    home: () => null,
    list: () => null,
    detail: () => null,
    tag: () => null,
    collection: () => null,
    about: () => null,
    notFound: () => null,
  },
});`,
      'utf-8',
    );
    const theme = await resolveTheme('.mineproj/theme', { root });
    expect(theme.name).toBe('my-local-theme');
  });

  it('loads package themes from node_modules under the site root', async () => {
    const pkgDir = join(root, 'node_modules', 'mineproj-theme-nebula');
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      join(pkgDir, 'package.json'),
      JSON.stringify({ name: 'mineproj-theme-nebula', main: './index.mjs' }),
      'utf-8',
    );
    await writeFile(
      join(pkgDir, 'index.mjs'),
      `export default {
        name: 'mineproj-theme-nebula',
        layouts: { home: () => null, list: () => null, detail: () => null, tag: () => null, collection: () => null, about: () => null, notFound: () => null },
      };`,
      'utf-8',
    );
    const theme = await resolveTheme('mineproj-theme-nebula', { root });
    expect(theme.name).toBe('mineproj-theme-nebula');
  });

  it('applies extends from a loaded package theme via the reference loader', async () => {
    const pkgDir = join(root, 'node_modules', 'mineproj-theme-child');
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      join(pkgDir, 'package.json'),
      JSON.stringify({ name: 'mineproj-theme-child', main: './index.mjs' }),
      'utf-8',
    );
    await writeFile(
      join(pkgDir, 'index.mjs'),
      `export default {
        name: 'mineproj-theme-child',
        extends: '@mineproj/theme-classic',
        layouts: { home: () => null },
      };`,
      'utf-8',
    );
    const theme = await resolveTheme('mineproj-theme-child', {
      root,
      loadThemeReference: async (ref) => makeTheme(ref),
    });
    expect(theme.name).toBe('mineproj-theme-child');
    expect(theme.layouts.list).toBe(noop); // inherited from the stub parent
  });

  it('throws a readable error for unresolvable references', async () => {
    await expect(resolveTheme('not-a-theme', { root })).rejects.toThrow(ThemeResolutionError);
  });
});

describe('theme module interop', () => {
  it('accepts both default and named exports', async () => {
    const dir = join(root, '.mineproj', 'theme');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'index.mjs'),
      `export default { name: 'default-form', layouts: { home: () => null } };`,
      'utf-8',
    );
    const theme = await resolveTheme('.mineproj/theme', { root });
    expect(theme.name).toBe('default-form');
  });
});

void defineTheme;

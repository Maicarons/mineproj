import { describe, expect, it } from 'vitest';
import { defineTheme, type Theme } from './contract';
import { dispatchLayout, missingLayouts } from './layout';

const noop = () => null;

function themeWith(layouts: Record<string, () => null>): Theme {
  return defineTheme({ name: 'mini-theme', layouts });
}

describe('dispatchLayout', () => {
  it('uses the theme layout when present', () => {
    const theme = themeWith({ home: noop });
    const result = dispatchLayout(theme, 'home');
    expect(result.Layout).toBe(noop);
    expect(result.usedFallback).toBe(false);
  });

  it('falls back to the fallback theme and flags it', () => {
    const fallback = defineTheme({
      name: 'full-fallback',
      layouts: { home: noop, list: noop, detail: noop, tag: noop, collection: noop, about: noop, notFound: noop },
    });
    const mini = themeWith({ home: function MiniHome() { return null; } });
    const result = dispatchLayout(mini, 'list', fallback);
    expect(result.Layout).toBe(fallback.layouts.list);
    expect(result.usedFallback).toBe(true);
    // The mini theme's own home is never displaced by the fallback.
    expect(dispatchLayout(mini, 'home', fallback).Layout).toBe(mini.layouts.home);
  });

  it('returns undefined when neither theme implements the layout', () => {
    const result = dispatchLayout(themeWith({ home: noop }), 'detail');
    expect(result.Layout).toBeUndefined();
    expect(result.usedFallback).toBe(false);
  });
});

describe('missingLayouts', () => {
  it('lists the core layouts a mini theme does not implement', () => {
    const missing = missingLayouts(themeWith({ home: noop }), [
      'home',
      'list',
      'detail',
      'tag',
      'collection',
      'about',
      'notFound',
    ]);
    expect(missing).toEqual(['list', 'detail', 'tag', 'collection', 'about', 'notFound']);
  });

  it('returns empty for a complete theme', () => {
    const full = defineTheme({
      name: 'full',
      layouts: { home: noop, list: noop, detail: noop, tag: noop, collection: noop, about: noop, notFound: noop },
    });
    expect(missingLayouts(full, ['home', 'list', 'detail', 'tag', 'collection', 'about', 'notFound'])).toEqual([]);
  });
});

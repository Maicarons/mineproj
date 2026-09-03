import { describe, expect, it, vi } from 'vitest';
import {
  PluginCycleError,
  applyFirst,
  applyParallel,
  applySeq,
  applyWaterfall,
  sortPlugins,
  type MineprojPluginLike,
} from './index';

function plugin(name: string, hookName: string, fn: (v: unknown) => unknown, extra: Partial<MineprojPluginLike> = {}): MineprojPluginLike {
  return { name, hooks: { [hookName]: fn }, ...extra };
}

describe('sortPlugins', () => {
  it('keeps registration order when unconstrained', () => {
    const order = sortPlugins([
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
    ]).map((p) => p.name);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('orders by enforce tier: pre, normal, post', () => {
    const order = sortPlugins([
      { name: 'post1', enforce: 'post' },
      { name: 'normal1' },
      { name: 'pre1', enforce: 'pre' },
      { name: 'post2', enforce: 'post' },
    ]).map((p) => p.name);
    expect(order).toEqual(['pre1', 'normal1', 'post1', 'post2']);
  });

  it('honors before/after constraints within a tier', () => {
    const order = sortPlugins([
      { name: 'a' },
      { name: 'b', after: ['a'] },
      { name: 'c', after: ['b'] },
    ]).map((p) => p.name);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('honors before as the inverse of after', () => {
    const order = sortPlugins([
      { name: 'late', before: ['early'] },
      { name: 'early' },
    ]).map((p) => p.name);
    expect(order).toEqual(['late', 'early']);
  });

  it('ignores unknown names in before/after', () => {
    const order = sortPlugins([
      { name: 'a', after: ['not-registered'] },
      { name: 'b', before: ['also-missing'] },
    ]).map((p) => p.name);
    expect(order).toEqual(['a', 'b']);
  });

  it('detects cycles with a readable chain', () => {
    expect(() =>
      sortPlugins([
        { name: 'a', after: ['c'] },
        { name: 'b', after: ['a'] },
        { name: 'c', after: ['b'] },
      ]),
    ).toThrow(PluginCycleError);
    expect(() =>
      sortPlugins([
        { name: 'a', after: ['c'] },
        { name: 'b', after: ['a'] },
        { name: 'c', after: ['b'] },
      ]),
    ).toThrow(/Circular plugin dependency/);
  });

  it('before/after across tiers do not create false cycles', () => {
    const order = sortPlugins([
      { name: 'post', enforce: 'post', after: ['pre'] },
      { name: 'pre', enforce: 'pre', before: ['post'] },
    ]).map((p) => p.name);
    expect(order).toEqual(['pre', 'post']);
  });
});

describe('applyWaterfall', () => {
  it('chains return values in sorted order', async () => {
    const calls: string[] = [];
    const plugins = [
      plugin('a', 'config:resolved', (v) => {
        calls.push('a');
        return (v as number) + 1;
      }),
      plugin('b', 'config:resolved', (v) => {
        calls.push('b');
        return (v as number) * 10;
      }),
    ];
    const result = await applyWaterfall(plugins, 'config:resolved', 1, {});
    expect(result).toBe(20);
    expect(calls).toEqual(['a', 'b']);
  });

  it('awaits async hooks', async () => {
    const plugins = [
      plugin('a', 'h', async (v) => `${v}-a`),
      plugin('b', 'h', async (v) => `${v}-b`),
    ];
    await expect(applyWaterfall(plugins, 'h', 'x', {})).resolves.toBe('x-a-b');
  });
});

describe('applySeq', () => {
  it('runs every hook in order and ignores return values', async () => {
    const calls: string[] = [];
    const plugins = [
      plugin('a', 'emit', () => {
        calls.push('a');
        return 'ignored';
      }),
      plugin('b', 'emit', () => {
        calls.push('b');
      }),
    ];
    await applySeq(plugins, 'emit', {});
    expect(calls).toEqual(['a', 'b']);
  });
});

describe('applyParallel', () => {
  it('runs all hooks concurrently', async () => {
    const seen: string[] = [];
    let release: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const plugins = [
      plugin('a', 'assets:process', async () => {
        await gate;
        seen.push('a');
      }),
      plugin('b', 'assets:process', async () => {
        seen.push('b');
      }),
    ];
    const promise = applyParallel(plugins, 'assets:process', {});
    expect(seen).toEqual(['b']);
    release!();
    await promise;
    expect(seen).toEqual(['b', 'a']);
  });
});

describe('applyFirst', () => {
  it('returns the first non-undefined value and short-circuits', async () => {
    const laterHook = vi.fn();
    const plugins = [
      plugin('a', 'resolve:page', () => undefined),
      plugin('b', 'resolve:page', () => 'from-b'),
      plugin('c', 'resolve:page', laterHook),
    ];
    const result = await applyFirst(plugins, 'resolve:page', 'default', {});
    expect(result).toBe('from-b');
    expect(laterHook).not.toHaveBeenCalled();
  });

  it('returns the initial value when every hook yields undefined', async () => {
    const plugins = [plugin('a', 'h', () => undefined)];
    await expect(applyFirst(plugins, 'h', 'seed', {})).resolves.toBe('seed');
  });
});

describe('semantics respect plugin ordering', () => {
  it('pre-tier hooks run first even when registered last', async () => {
    const calls: string[] = [];
    const plugins = [
      plugin('normal', 'render:before', () => {
        calls.push('normal');
      }),
      plugin('early', 'render:before', () => {
        calls.push('early');
      }, { enforce: 'pre' }),
    ];
    await applySeq(plugins, 'render:before', {});
    expect(calls).toEqual(['early', 'normal']);
  });

  it('skips plugins without the requested hook', async () => {
    const calls: string[] = [];
    const plugins = [
      plugin('has-hook', 'h', () => {
        calls.push('has-hook');
      }),
      { name: 'no-hooks' },
      { name: 'other-hook', hooks: { other: () => {} } },
    ];
    await applySeq(plugins, 'h', {});
    expect(calls).toEqual(['has-hook']);
  });
});

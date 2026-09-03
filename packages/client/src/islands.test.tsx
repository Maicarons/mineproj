import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { mountIslands } from './islands';

const Counter = () => null;

describe('mountIslands', () => {
  it('mounts every island container via hydration and returns the count', async () => {
    document.body.innerHTML = `
      <div data-mp-island="counter" data-mp-island-props="{&quot;start&quot;:5}"></div>
      <div data-mp-island="clock"></div>
      <p>static content, no island</p>
    `;
    const hydrate = vi.fn().mockResolvedValue(undefined);
    const create = vi.fn();
    const loaders = {
      counter: async () => ({ default: Counter }),
      clock: async () => ({ default: Counter }),
    };
    const mounted = await mountIslands({
      root: document,
      loaders,
      renderer: { hydrate, create },
    });
    expect(mounted).toBe(2);
    expect(hydrate).toHaveBeenCalledTimes(2);
    expect(create).not.toHaveBeenCalled();
  });

  it('falls back to createRoot when hydration fails', async () => {
    document.body.innerHTML = `<div data-mp-island="counter"></div>`;
    const hydrate = vi.fn().mockRejectedValue(new Error('hydration mismatch'));
    const create = vi.fn();
    await mountIslands({
      root: document,
      loaders: { counter: async () => ({ default: Counter }) },
      renderer: { hydrate, create },
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('warns and skips islands without a loader', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = `<div data-mp-island="unknown-island"></div>`;
    const mounted = await mountIslands({
      root: document,
      loaders: {},
      renderer: { hydrate: vi.fn(), create: vi.fn() },
    });
    expect(mounted).toBe(0);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('composes with server-side island markup', async () => {
    const html = renderToString(
      createElement(
        'div',
        {
          'data-mp-island': 'counter',
          'data-mp-island-props': '{"start":9}',
        },
        'SSR content',
      ),
    );
    document.body.innerHTML = html;
    const hydrate = vi.fn().mockResolvedValue(undefined);
    const create = vi.fn();
    await mountIslands({
      root: document,
      loaders: { counter: async () => ({ default: Counter }) },
      renderer: { hydrate, create },
    });
    const firstCall = hydrate.mock.calls[0] as unknown[];
    const element = firstCall[1] as { props: Record<string, unknown> };
    expect(element.props).toEqual({ start: 9 });
  });
});

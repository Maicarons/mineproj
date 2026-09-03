import { describe, expect, it, vi } from 'vitest';
import { createClientRouter } from './router';

function htmlDocument(title: string, mainContent: string): string {
  return `<!doctype html><html><head><title>${title}</title></head><body><main>${mainContent}</main></body></html>`;
}

function mockFetch(routes: Record<string, { status: number; body: string }>): typeof fetch {

  return vi.fn(async (url: RequestInfo | URL) => {
    const key = String(url);
    const route = routes[key] ?? { status: 404, body: 'not found' };
    return {
      ok: route.status === 200,
      status: route.status,
      text: async () => route.body,
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

describe('createClientRouter', () => {
  it('swaps the main content and pushes history without a reload', async () => {
    document.body.innerHTML = '<main><h1>Home</h1></main>';
    document.title = 'Home';
    const fetchImpl = mockFetch({
      '/projects/voxel-tool/': { status: 200, body: htmlDocument('Voxel Tool', '<h1>Voxel Tool</h1>') },
    });
    const router = createClientRouter({ fetchImpl });
    await router.navigateTo('/projects/voxel-tool/');
    expect(document.querySelector('main')?.innerHTML).toContain('Voxel Tool');
    expect(document.title).toBe('Voxel Tool');
    expect(window.history.state).toEqual({});
  });

  it('falls back to the 404 document for missing targets', async () => {
    document.body.innerHTML = '<main><h1>Home</h1></main>';
    const fetchImpl = mockFetch({
      '/404.html': { status: 200, body: htmlDocument('404', '<h1>404 — Not found</h1>') },
    });
    const router = createClientRouter({ fetchImpl });
    await router.navigateTo('/does-not-exist/');
    expect(document.querySelector('main')?.innerHTML).toContain('404');
  });

  it('intercepts internal link clicks and prevents full navigation', async () => {
    document.body.innerHTML = '<main><a href="/other/">go</a></main>';
    const fetchImpl = mockFetch({
      '/other/': { status: 200, body: htmlDocument('Other', '<h1>Other page</h1>') },
    });
    const router = createClientRouter({ fetchImpl });
    router.start();

    const anchor = document.querySelector('a') as HTMLAnchorElement;
    // jsdom anchor origin is about:blank; normalize to pass isInternalLink.
    Object.defineProperty(anchor, 'origin', { value: window.location.origin });
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(document.querySelector('main')?.innerHTML).toContain('Other page');
    });
  });

  it('ignores external links', async () => {
    document.body.innerHTML = '<main><a href="https://example.com/">ext</a></main>';
    const fetchImpl = vi.fn();
    const router = createClientRouter({ fetchImpl: fetchImpl as unknown as typeof fetch });
    router.start();
    const anchor = document.querySelector('a') as HTMLAnchorElement;
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

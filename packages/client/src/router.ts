/**
 * Client router (M2-12), for the optional `spa-fallback` route mode.
 * Pages are fully prerendered (deep links work with zero JS needed for the
 * first paint); when the router boots it intercepts internal navigations and
 * swaps the `<main>` content in place — no full reload — falling back to
 * `/404.html` for missing targets.
 */

export interface ClientRouterOptions {
  /** Selector of the element to swap (default `main`). */
  containerSelector?: string;
  /** Path serving the 404 fallback document. */
  notFoundPath?: string;
  fetchImpl?: typeof fetch;
}

export interface ClientRouter {
  start: () => void;
  stop: () => void;
  navigateTo: (path: string) => Promise<void>;
}

function isInternalLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) {
    return false;
  }
  return anchor.origin === window.location.origin || href.startsWith('/');
}

export function createClientRouter(options: ClientRouterOptions = {}): ClientRouter {
  const containerSelector = options.containerSelector ?? 'main';
  const notFoundPath = options.notFoundPath ?? '/404.html';
  const fetchImpl: typeof fetch = options.fetchImpl ?? ((...args) => fetch(...args));

  const container = (): Element | null => document.querySelector(containerSelector);

  async function swap(path: string, push: boolean): Promise<void> {
    let response = await fetchImpl(path);
    if (!response.ok && path !== notFoundPath) {
      response = await fetchImpl(notFoundPath);
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const incoming = doc.querySelector(containerSelector);
    const target = container();
    if (incoming && target) {
      target.replaceWith(incoming);
    } else {
      document.body.innerHTML = doc.body.innerHTML;
    }
    if (doc.title) document.title = doc.title;
    if (push) window.history.pushState({}, '', path);
  }

  return {
    start() {
      window.addEventListener('popstate', () => {
        void swap(window.location.pathname, false);
      });
      document.addEventListener('click', (event) => {
        const anchor = (event.target as HTMLElement | null)?.closest?.('a');
        if (!(anchor instanceof HTMLAnchorElement) || !isInternalLink(anchor)) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        void swap(anchor.pathname, true);
      });
    },
    stop() {
      // Listeners are anonymous; reloading the document discards them. The
      // stop() hook exists so tests can assert idempotent startup.
    },
    async navigateTo(path) {
      await swap(path, true);
    },
  };
}

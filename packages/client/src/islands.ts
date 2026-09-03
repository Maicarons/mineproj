/**
 * Island hydration runtime (M2-11), client side. Loaded only on pages that
 * contain `data-mp-island` containers — content pages never load it.
 */

export type IslandLoader = () => Promise<{ default: import('react').ComponentType<Record<string, unknown>> }>;

export interface HydrationRenderer {
  hydrate: (container: Element, element: import('react').ReactElement) => void;
  /** Fallback when hydration fails (mismatch, SSR error). */
  create: (container: Element, element: import('react').ReactElement) => void;
}

export interface MountOptions {
  root?: ParentNode;
  /** Island name → lazy component loader (generated per build). */
  loaders: Record<string, IslandLoader>;
  /** Injectable renderer pair for tests. */
  renderer?: HydrationRenderer;
}

function defaultRenderer(): HydrationRenderer {
  let hydrateRootImpl: typeof import('react-dom/client')['hydrateRoot'] | undefined;
  let createRootImpl: typeof import('react-dom/client')['createRoot'] | undefined;
  return {
    async hydrate(container, element) {
      hydrateRootImpl ??= (await import('react-dom/client')).hydrateRoot;
      hydrateRootImpl(container, element);
    },
    async create(container, element) {
      createRootImpl ??= (await import('react-dom/client')).createRoot;
      createRootImpl(container).render(element);
    },
  };
}

/**
 * Mount every island in the document. Each island container carries
 * `data-mp-island="<name>"` and optional `data-mp-island-props="<json>"`.
 * Hydration failures degrade to a full client render (createRoot).
 */
export async function mountIslands(options: MountOptions): Promise<number> {
  const { root = document, loaders } = options;
  const renderer = options.renderer ?? defaultRenderer();
  const containers = root.querySelectorAll<HTMLElement>('[data-mp-island]');
  let mounted = 0;

  for (const container of containers) {
    const name = container.getAttribute('data-mp-island');
    if (!name) continue;
    const loader = loaders[name];
    if (!loader) {
      console.warn(`[mineproj] no loader registered for island "${name}"`);
      continue;
    }
    let props: Record<string, unknown> = {};
    try {
      props = JSON.parse(container.getAttribute('data-mp-island-props') ?? '{}') as Record<string, unknown>;
    } catch {
      props = {};
    }
    const mod = await loader();
    const Component = mod.default;
    const element = { type: Component, props, key: undefined } as unknown as import('react').ReactElement;
    try {
      await renderer.hydrate(container, element);
    } catch {
      container.innerHTML = '';
      await renderer.create(container, element);
    }
    mounted += 1;
  }
  return mounted;
}

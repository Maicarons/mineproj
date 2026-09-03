import MiniSearch from 'minisearch';
import {
  ApiError,
  type Envelope,
  type ProjectQuery,
  type SearchDocument,
  type SearchIndexPayload,
} from './types';

/**
 * `createApiClient` (M1-10): typed fetch client for the `/api/v1` endpoints.
 * Works in any JS runtime (browser, Node, workers) — no React required.
 * Memory cache with stale-while-revalidate semantics, request timeouts and
 * normalized errors.
 */

export type CacheMode = 'stale-while-revalidate' | 'cache-first' | 'no-cache';

export interface CreateApiClientOptions {
  /** Base URL of the API, defaults to `/api/v1`. */
  baseUrl?: string;
  cache?: CacheMode;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  /** Injectable fetch implementation (defaults to globalThis.fetch). */
  fetchImpl?: typeof fetch;
}

export type FetchLike = typeof fetch;

export interface ClientConfig {
  baseUrl: string;
  cache: CacheMode;
  timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

function buildQueryString(query: ProjectQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.tag && query.tag.length > 0) params.set('tag', query.tag.join(','));
  if (query.tagMode) params.set('tagMode', query.tagMode);
  if (query.category) params.set('category', query.category);
  if (query.status) params.set('status', query.status);
  if (query.platform && query.platform.length > 0) params.set('platform', query.platform.join(','));
  if (query.playable !== undefined) params.set('playable', String(query.playable));
  if (query.sort) params.set('sort', query.sort);
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
  if (query.fields && query.fields.length > 0) params.set('fields', query.fields.join(','));
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
}

function timeoutSignal(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

export interface ApiClient {
  config: ClientConfig;
  /** Full GET against any `/api/v1` path with envelope unwrapping. */
  get: <T>(path: string, query?: ProjectQuery) => Promise<T>;
  getProjects: (query?: ProjectQuery) => Promise<Envelope>;
  getProject: (slug: string) => Promise<Envelope>;
  getTags: () => Promise<Envelope>;
  getStats: () => Promise<Envelope>;
  getProfile: () => Promise<Envelope>;
  getManifest: () => Promise<Envelope>;
  getSearchIndex: () => Promise<SearchIndexPayload>;
  /** Prefix + fuzzy search over the rehydrated MiniSearch index. */
  search: (q: string) => Promise<SearchDocument[]>;
  clearCache: () => void;
  /** Number of pending background revalidations (test convenience). */
  pendingRevalidations: () => number;
  /** Waits for all pending background revalidations (test convenience). */
  idle: () => Promise<void>;
}

export function createApiClient(options: CreateApiClientOptions = {}): ApiClient {
  const config: ClientConfig = {
    baseUrl: options.baseUrl ?? '/api/v1',
    cache: options.cache ?? 'stale-while-revalidate',
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
  const fetchImpl: FetchLike = options.fetchImpl ?? ((...args) => fetch(...args));

  const cache = new Map<string, unknown>();
  const revalidations = new Set<Promise<void>>();

  async function rawFetch<T>(path: string): Promise<T> {
    const url = `${config.baseUrl}/${path.replace(/^\/+/, '')}`;
    const { signal, cancel } = timeoutSignal(config.timeoutMs);
    try {
      const response = await fetchImpl(url, { signal });
      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        const err = (payload as { error?: { code?: string; message?: string } }).error;
        throw new ApiError(
          (err?.code as ApiError['code']) ?? 'HTTP',
          err?.message ?? `Request to ${path} failed with status ${response.status}`,
          response.status,
        );
      }
      return payload as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ApiError('TIMEOUT', `Request to ${path} timed out after ${config.timeoutMs}ms`);
      }
      throw new ApiError('NETWORK', `Request to ${path} failed: ${(err as Error).message}`);
    } finally {
      cancel();
    }
  }

  function revalidate<T>(path: string): Promise<void> {
    const promise = rawFetch<T>(path)
      .then((fresh) => {
        cache.set(path, fresh);
      })
      .catch(() => {
        // Stale value stays in place; the next read retries.
      })
      .finally(() => {
        revalidations.delete(promise);
      });
    revalidations.add(promise);
    return promise;
  }

  async function get<T>(path: string): Promise<T> {
    const cached = cache.get(path);
    if (cached !== undefined) {
      if (config.cache === 'stale-while-revalidate') {
        void revalidate<T>(path);
      }
      return cached as T;
    }
    const fresh = await rawFetch<T>(path);
    if (config.cache !== 'no-cache') {
      cache.set(path, fresh);
    }
    return fresh;
  }

  const searchClients = new Map<string, MiniSearch>();

  const client: ApiClient = {
    config,
    get,
    getProjects: (query) => get<Envelope>(`projects${buildQueryString(query ?? {})}`),
    getProject: (slug) => get<Envelope>(`projects/${slug}.json`),
    getTags: () => get<Envelope>('tags.json'),
    getStats: () => get<Envelope>('stats.json'),
    getProfile: () => get<Envelope>('profile.json'),
    getManifest: () => get<Envelope>('manifest.json'),
    getSearchIndex: async () => {
      const envelope = await get<Envelope<SearchIndexPayload>>('search.json');
      return envelope.data;
    },
    async search(q) {
      const payload = await this.getSearchIndex();
      const key = JSON.stringify(payload.index);
      let mini = searchClients.get(key);
      if (!mini) {
        mini = MiniSearch.loadJSON<SearchDocument>(JSON.stringify(payload.index), {
          fields: ['name', 'tagline', 'summary', 'tags'],
          storeFields: ['id'],
        });
        searchClients.set(key, mini);
      }
      return mini
        .search(q)
        .map((hit) => payload.documents.find((d) => d.id === hit.id))
        .filter((d): d is SearchDocument => d !== undefined);
    },
    clearCache: () => {
      cache.clear();
    },
    pendingRevalidations: () => revalidations.size,
    idle: async () => {
      await Promise.all([...revalidations]);
    },
  };

  return client;
}

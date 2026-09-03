import { useEffect, useState } from 'react';
import { createApiClient, type ApiClient } from './api';
import type { ApiError, Envelope, ProjectQuery, SearchDocument } from './types';

/**
 * React hooks (M1-11) over the client SDK: `useProjects`, `useProject`,
 * `useTags`, `useSearch`, `useStats`. Each exposes loading / data / error
 * plus a `reload()` trigger. A module-default client is created lazily so
 * the SDK stays usable without React (M1-10) and hooks stay zero-config.
 */

export interface AsyncResource<T> {
  data: T | undefined;
  loading: boolean;
  error: ApiError | undefined;
  reload: () => void;
}

let defaultClient: ApiClient | null = null;

/** Lazily-created shared client used when no client is passed explicitly. */
export function getDefaultClient(): ApiClient {
  defaultClient ??= createApiClient();
  return defaultClient;
}

export function useAsyncResource<T>(
  fetcher: (client: ApiClient) => Promise<T>,
  deps: unknown[],
  client?: ApiClient,
): AsyncResource<T> {
  const resolved = client ?? getDefaultClient();
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    fetcher(resolved)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: ApiError) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [...deps, resolved, nonce]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}

export function useProjects(query?: ProjectQuery, client?: ApiClient): AsyncResource<Envelope> {
  return useAsyncResource((c) => c.getProjects(query), [JSON.stringify(query ?? {})], client);
}

export function useProject(slug: string, client?: ApiClient): AsyncResource<Envelope> {
  return useAsyncResource((c) => c.getProject(slug), [slug], client);
}

export function useTags(client?: ApiClient): AsyncResource<Envelope> {
  return useAsyncResource((c) => c.getTags(), [], client);
}

export function useStats(client?: ApiClient): AsyncResource<Envelope> {
  return useAsyncResource((c) => c.getStats(), [], client);
}

export function useSearch(q: string, client?: ApiClient): AsyncResource<SearchDocument[]> {
  return useAsyncResource(
    (c) => (q.length > 0 ? c.search(q) : Promise.resolve([])),
    [q],
    client,
  );
}

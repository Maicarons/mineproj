import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './api';
import { ApiError } from './types';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function okEnvelope(data: unknown): Response {
  return jsonResponse(200, {
    apiVersion: 'v1',
    kind: 'ProjectList',
    generatedAt: '2026-01-01T00:00:00.000Z',
    schemaVersion: '1.0.0',
    data,
  });
}

describe('createApiClient', () => {
  it('fetches and unwraps project lists (no React needed)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okEnvelope([{ slug: 'a' }]));
    const client = createApiClient({ baseUrl: '/api/v1', fetchImpl });
    const env = await client.getProjects({ tag: ['web'], sort: 'createdAt:desc' });
    expect(env.data).toEqual([{ slug: 'a' }]);
    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/v1/projects?tag=web&sort=createdAt%3Adesc',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('normalizes error envelopes into ApiError with status', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(404, { apiVersion: 'v1', error: { code: 'NOT_FOUND', message: 'nope' } }));
    const client = createApiClient({ fetchImpl });
    await expect(client.getProject('ghost')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('times out slow requests with a TIMEOUT error', async () => {
    const fetchImpl = vi.fn().mockImplementation(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const e = new Error('aborted');
            e.name = 'AbortError';
            reject(e);
          });
        }),
    );
    const client = createApiClient({ fetchImpl, timeoutMs: 30 });
    await expect(client.getTags()).rejects.toMatchObject({ code: 'TIMEOUT' });
  }, 2000);

  it('wraps network failures as NETWORK errors', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const client = createApiClient({ fetchImpl });
    await expect(client.getStats()).rejects.toMatchObject({ code: 'NETWORK' });
  });

  it('caches repeated reads without refetching (cache-first behavior on hit)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okEnvelope([{ slug: 'a' }]));
    const client = createApiClient({ fetchImpl, cache: 'cache-first' });
    await client.getTags();
    await client.getTags();
    await client.getTags();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('stale-while-revalidate serves cached data and refreshes in background', async () => {
    let counter = 0;
    const fetchImpl = vi.fn().mockImplementation(async () => {
      counter += 1;
      return okEnvelope([{ slug: `v${counter}` }]);
    });
    const client = createApiClient({ fetchImpl, cache: 'stale-while-revalidate' });

    const first = await client.getTags();
    expect((first.data as { slug: string }[])[0]?.slug).toBe('v1');

    // Second read returns the stale value synchronously, refresh happens async.
    const second = await client.getTags();
    expect((second.data as { slug: string }[])[0]?.slug).toBe('v1');
    await client.idle();

    const third = await client.getTags();
    expect((third.data as { slug: string }[])[0]?.slug).toBe('v2');
    // SWR revalidates on every read: initial + refresh + background refresh on read 3.
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('bypasses the cache entirely in no-cache mode', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okEnvelope([]));
    const client = createApiClient({ fetchImpl, cache: 'no-cache' });
    await client.getTags();
    await client.getTags();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(client.pendingRevalidations()).toBe(0);
  });

  it('searches over the rehydrated MiniSearch index', async () => {
    const { default: MiniSearch } = await import('minisearch');
    const documents = [
      { id: 'voxel-tool', name: 'Voxel Tool', tagline: 'editor', summary: 'tiny editor', tags: 'web game' },
      { id: 'csv-wrangler', name: 'CSV Wrangler', tagline: 'cli', summary: 'csv tool', tags: 'cli tool' },
    ];
    const index = new MiniSearch<SearchLike>({
      fields: ['name', 'tagline', 'summary', 'tags'],
      storeFields: ['id'],
    });
    index.addAll(documents);
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { apiVersion: 'v1', kind: 'SearchIndex', data: { index: index.toJSON(), documents } }));
    const client = createApiClient({ fetchImpl });
    const hits = await client.search('voxel');
    expect(hits.map((h) => h.id)).toEqual(['voxel-tool']);
  }, 5000);
});

interface SearchLike {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  tags: string;
}

describe('ApiError', () => {
  it('carries code, message and optional status', () => {
    const err = new ApiError('TIMEOUT', 'too slow');
    expect(err.code).toBe('TIMEOUT');
    expect(err.message).toBe('too slow');
    expect(err.status).toBeUndefined();
  });
});

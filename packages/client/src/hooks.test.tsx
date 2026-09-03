import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from './api';
import { useProjects, useSearch, useTags } from './hooks';

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useProjects', () => {
  it('starts in the loading state', async () => {
    const fetchImpl = vi.fn().mockImplementation(() => new Promise<Response>(() => {}));
    const client = createApiClient({ fetchImpl });
    const { result } = renderHook(() => useProjects({ tag: ['web'] }, client));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('transitions to the success state with data', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okEnvelope([{ slug: 'voxel-tool' }]));
    const client = createApiClient({ fetchImpl });
    const { result } = renderHook(() => useProjects(undefined, client));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeUndefined();
    expect((result.current.data?.data as { slug: string }[])[0]?.slug).toBe('voxel-tool');
  });

  it('transitions to the error state on failure', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(404, { apiVersion: 'v1', error: { code: 'NOT_FOUND', message: 'gone' } }));
    const client = createApiClient({ fetchImpl });
    const { result } = renderHook(() => useProjects(undefined, client));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('reload refetches from the network', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okEnvelope([{ slug: 'a' }]));
    const client = createApiClient({ fetchImpl, cache: 'stale-while-revalidate' });
    const { result } = renderHook(() => useTags(client) && useProjects(undefined, client));
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.reload();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(fetchImpl.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('useSearch', () => {
  it('skips the network for an empty query', async () => {
    const fetchImpl = vi.fn();
    const client = createApiClient({ fetchImpl });
    const { result } = renderHook(() => useSearch('', client));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('returns matching documents', async () => {
    const { default: MiniSearch } = await import('minisearch');
    const documents = [{ id: 'voxel-tool', name: 'Voxel Tool', tagline: 'editor', summary: 'tiny', tags: 'web' }];
    const index = new MiniSearch<(typeof documents)[number]>({
      fields: ['name', 'tagline', 'summary', 'tags'],
      storeFields: ['id'],
    });
    index.addAll(documents);
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { apiVersion: 'v1', kind: 'SearchIndex', data: { index: index.toJSON(), documents } }));
    const client = createApiClient({ fetchImpl });
    const { result } = renderHook(() => useSearch('voxel', client));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.map((d) => d.id)).toEqual(['voxel-tool']);
  }, 5000);
});

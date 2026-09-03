import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { loadDataset, type Dataset } from '../data/loader';
import { resolveApiRequest } from './middleware';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let root: string;
let config: ResolvedMineprojConfig;
let dataset: Dataset;
let ctx: { root: string; config: ResolvedMineprojConfig; dataset: Dataset };

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-mw-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
  await writeFile(
    join(root, 'data', 'projects', 'voxel-tool', 'index.json'),
    JSON.stringify({
      slug: 'voxel-tool',
      name: 'Voxel Tool',
      tagline: 't',
      summary: 'A summary long enough to satisfy schema validation rules.',
      createdAt: '2026-01-01T00:00:00.000Z',
      tags: ['web'],
    }),
    'utf-8',
  );
  await mkdir(join(root, 'data', 'projects', 'other'), { recursive: true });
  await writeFile(
    join(root, 'data', 'projects', 'other', 'index.json'),
    JSON.stringify({
      slug: 'other',
      name: 'Other',
      tagline: 't',
      summary: 'A summary long enough to satisfy schema validation rules.',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: ['cli'],
    }),
    'utf-8',
  );
  config = mineprojConfigSchema.parse({ site: { title: 'MW' } });
  dataset = await loadDataset(root, config);
  ctx = { root, config, dataset };
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('resolveApiRequest', () => {
  it('serves the live query endpoint with filtering and sorting', async () => {
    const result = await resolveApiRequest(ctx, '/projects', new URLSearchParams('tag=web&sort=createdAt:desc'));
    expect(result?.status).toBe(200);
    const body = result?.body as { kind: string; data: { slug: string }[]; total: number };
    expect(body.kind).toBe('ProjectList');
    expect(body.data.map((p) => p.slug)).toEqual(['voxel-tool']);
    expect(body.total).toBe(1);
  });

  it('supports pagination on the live query endpoint', async () => {
    const result = await resolveApiRequest(ctx, '/projects', new URLSearchParams('pageSize=1&page=2'));
    const body = result?.body as { data: { slug: string }[]; total: number; page: number };
    expect(body.data.map((p) => p.slug)).toEqual(['other']);
    expect(body.total).toBe(2);
    expect(body.page).toBe(2);
  });

  it('serves static endpoint definitions', async () => {
    const result = await resolveApiRequest(ctx, '/tags.json', new URLSearchParams());
    const body = result?.body as { kind: string; data: unknown[] };
    expect(body.kind).toBe('TagList');
    expect(body.data).toHaveLength(2);
  });

  it('serves project detail endpoints and 404s unknown slugs', async () => {
    const ok = await resolveApiRequest(ctx, '/projects/voxel-tool.json', new URLSearchParams());
    expect(ok?.status).toBe(200);
    expect(((ok?.body as { data: { slug: string } }).data).slug).toBe('voxel-tool');

    const missing = await resolveApiRequest(ctx, '/projects/nope.json', new URLSearchParams());
    expect(missing?.status).toBe(404);
    const err = (missing?.body as { error: { code: string } }).error;
    expect(err.code).toBe('NOT_FOUND');
  });

  it('404s unknown paths with the error envelope', async () => {
    const result = await resolveApiRequest(ctx, '/does-not-exist', new URLSearchParams());
    expect(result?.status).toBe(404);
    expect(((result?.body as { error: { code: string } }).error).code).toBe('NOT_FOUND');
  });

  it('honors the _delay parameter for latency injection', async () => {
    const start = Date.now();
    await resolveApiRequest(ctx, '/tags.json', new URLSearchParams('_delay=150'));
    expect(Date.now() - start).toBeGreaterThanOrEqual(140);
  });
});

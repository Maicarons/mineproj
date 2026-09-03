import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { loadDataset, type Dataset } from '../data/loader';
import { collectRoutes, CORE_LAYOUTS } from './collect';

let root: string;
let config: ResolvedMineprojConfig;
let dataset: Dataset;

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-routes-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
  await writeFile(
    join(root, 'data', 'projects', 'voxel-tool', 'index.json'),
    JSON.stringify({
      slug: 'voxel-tool',
      name: 'Voxel Tool',
      tagline: 't',
      summary: 'A summary long enough to satisfy schema validation rules.',
      createdAt: '2026-01-01T00:00:00.000Z',
      tags: ['web', 'game'],
    }),
    'utf-8',
  );
  await mkdir(join(root, 'data', 'projects', 'hidden-one'), { recursive: true });
  await writeFile(
    join(root, 'data', 'projects', 'hidden-one', 'index.json'),
    JSON.stringify({
      slug: 'hidden-one',
      name: 'Hidden',
      tagline: 't',
      summary: 'A summary long enough to satisfy schema validation rules.',
      createdAt: '2026-01-01T00:00:00.000Z',
      tags: ['secret'],
      hidden: true,
    }),
    'utf-8',
  );
  await writeFile(
    join(root, 'data', 'collections.json'),
    JSON.stringify([{ slug: 'picks', name: 'Picks', projectSlugs: ['voxel-tool'] }]),
    'utf-8',
  );
  config = mineprojConfigSchema.parse({ site: { title: 'Route Test' } });
  dataset = await loadDataset(root, config);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('collectRoutes', () => {
  it('derives all seven core route types', () => {
    const routes = collectRoutes(dataset, config);
    const layouts = new Set(routes.map((r) => r.layout));
    for (const layout of CORE_LAYOUTS) {
      expect(layouts.has(layout), `missing ${layout}`).toBe(true);
    }
  });

  it('creates home, list, detail, tag, collection, about and 404 routes', () => {
    const paths = collectRoutes(dataset, config).map((r) => r.path);
    expect(paths).toEqual([
      '/',
      '/projects/',
      '/projects/voxel-tool/',
      '/tags/game/',
      '/tags/web/',
      '/collections/picks/',
      '/about/',
      '/404.html',
    ]);
  });

  it('excludes hidden projects from detail and tag routes', () => {
    const routes = collectRoutes(dataset, config);
    expect(routes.find((r) => r.path === '/projects/hidden-one/')).toBeUndefined();
    expect(routes.find((r) => r.path === '/tags/secret/')).toBeUndefined();
  });

  it('carries titles and identifiers', () => {
    const routes = collectRoutes(dataset, config);
    const detail = routes.find((r) => r.slug === 'voxel-tool');
    expect(detail?.title).toBe('Voxel Tool');
    const tag = routes.find((r) => r.tag === 'web');
    expect(tag?.title).toBe('#web');
  });

  it('omits tag and collection routes when data is empty', async () => {
    await rm(join(root, 'data'), { recursive: true, force: true });
    const emptyDataset = await loadDataset(root, config);
    const routes = collectRoutes(emptyDataset, config);
    expect(routes.map((r) => r.path)).toEqual(['/', '/projects/', '/about/', '/404.html']);
  });
});

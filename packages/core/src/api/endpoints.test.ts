import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { loadDataset, type Dataset } from '../data/loader';
import { generateApiEndpoints, endpointDefinitions, envelope, API_VERSION } from './endpoints';
import { emitApiEndpoints } from './emit';
import { readFile } from 'node:fs/promises';

const NOW = '2026-09-03T08:00:00.000Z';

let root: string;
let config: ResolvedMineprojConfig;
let dataset: Dataset;

function projectJson(slug: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    slug,
    name: `Project ${slug}`,
    tagline: `Tagline ${slug}`,
    summary: `Summary for ${slug} which is long enough to pass schema validation.`,
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['web'],
    ...extra,
  });
}

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-api-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
  await mkdir(join(root, 'data', 'projects', 'hidden-one'), { recursive: true });
  await writeFile(join(root, 'data', 'projects', 'voxel-tool', 'index.json'), projectJson('voxel-tool'), 'utf-8');
  await writeFile(
    join(root, 'data', 'projects', 'voxel-tool', 'body.md'),
    '# Voxel\n\n```ts\nlet x = 1;\n```',
    'utf-8',
  );
  await writeFile(
    join(root, 'data', 'projects', 'hidden-one', 'index.json'),
    projectJson('hidden-one', { hidden: true }),
    'utf-8',
  );
  await writeFile(join(root, 'data', 'profile.json'), JSON.stringify({ name: 'Mai' }), 'utf-8');
  await writeFile(join(root, 'data', 'tags.json'), JSON.stringify({ web: {} }), 'utf-8');
  config = mineprojConfigSchema.parse({ site: { title: 'API Test' } });
  dataset = await loadDataset(root, config);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('envelope', () => {
  it('stamps api version, kind, timestamp and schema version', () => {
    const env = envelope('ProjectList', [], NOW);
    expect(env.apiVersion).toBe(API_VERSION);
    expect(env.kind).toBe('ProjectList');
    expect(env.generatedAt).toBe(NOW);
    expect(env.schemaVersion).toBe('1.0.0');
    expect(env.data).toEqual([]);
  });
});

describe('generateApiEndpoints', () => {
  const endpoints = async () => generateApiEndpoints({ root, config, dataset, now: NOW });
  const byPath = async (): Promise<Map<string, unknown>> => {
    const list = await endpoints();
    return new Map(list.map((e) => [e.path, e.body]));
  };

  it('generates every §6.1 endpoint plus per-project details', async () => {
    const paths = (await endpoints()).map((e) => e.path);
    expect(paths).toContain('projects.json');
    expect(paths).toContain('projects/index.json');
    expect(paths).toContain('tags.json');
    expect(paths).toContain('categories.json');
    expect(paths).toContain('collections.json');
    expect(paths).toContain('profile.json');
    expect(paths).toContain('search.json');
    expect(paths).toContain('stats.json');
    expect(paths).toContain('feed.json');
    expect(paths).toContain('manifest.json');
    expect(paths).toContain('projects/voxel-tool.json');
    // Hidden projects stay out of lists but keep a shareable detail endpoint.
    expect(paths).toContain('projects/hidden-one.json');
  });

  it('projects.json carries lite fields and facets', async () => {
    const env = (await byPath()).get('projects.json') as Record<string, unknown>;
    const items = env.data as Record<string, unknown>[];
    expect(items).toHaveLength(1);
    const item = items[0]!;
    expect(Object.keys(item).sort()).toEqual(
      [
        'slug',
        'name',
        'tagline',
        'cover',
        'tags',
        'category',
        'status',
        'createdAt',
        'featured',
        'weight',
        'playable',
      ].sort(),
    );
    expect(env.total).toBe(1);
  });

  it('projects/<slug>.json carries the full record and rendered body', async () => {
    const env = (await byPath()).get('projects/voxel-tool.json') as Record<string, unknown>;
    const data = env.data as Record<string, unknown>;
    expect(data.slug).toBe('voxel-tool');
    expect(data.summary).toContain('Summary for voxel-tool');
    const body = data.body as { markdown: string; html: string };
    expect(body.markdown).toContain('# Voxel');
    expect(body.html).toContain('<h1>Voxel</h1>');
    expect(body.html).toContain('shiki-themes');
  });

  it('tags/categories/stats endpoints contain derived data', async () => {
    const map = await byPath();
    const tags = (map.get('tags.json') as Record<string, unknown>).data as Array<{
      name: string;
      count: number;
    }>;
    expect(tags.map((t) => [t.name, t.count])).toEqual([['web', 2]]);
    const stats = (map.get('stats.json') as Record<string, unknown>).data as Record<string, unknown>;
    expect(stats.total).toBe(2);
    const profile = (map.get('profile.json') as Record<string, unknown>).data as Record<string, unknown>;
    expect(profile.name).toBe('Mai');
  });

  it('manifest.json lists every endpoint and is self-describing', async () => {
    const manifest = (await byPath()).get('manifest.json') as Record<string, unknown>;
    const endpointsList = manifest.endpoints as string[];
    expect(endpointsList).toContain('/v1/projects.json');
    expect(manifest.schemaVersion).toBe('1.0.0');
    const dataModel = manifest.dataModel as Record<string, number | boolean>;
    expect(dataModel.projects).toBe(2);
    expect(dataModel.hasProfile).toBe(true);
  });

  it('search.json is a loadable MiniSearch index', async () => {
    const env = (await byPath()).get('search.json') as { data: { index: unknown; documents: unknown[] } };
    const { default: MiniSearch } = await import('minisearch');
    const index = MiniSearch.loadJSON<Record<string, string>>(
      env.data.index as unknown as Parameters<typeof MiniSearch.loadJSON>[0],
      {
        fields: ['name', 'tagline', 'summary', 'tags'],
        storeFields: ['id'],
      },
    );
    const hits = index.search('voxel');
    expect(hits[0]?.id).toBe('voxel-tool');
    expect(env.data.documents).toHaveLength(1);
  });

  it('feed.json is valid JSON Feed 1.1', async () => {
    const env = (await byPath()).get('feed.json') as { data: { version: string; items: unknown[] } };
    expect(env.data.version).toBe('https://jsonfeed.org/version/1.1');
    expect(env.data.items).toHaveLength(1);
  });

  it('keeps every static endpoint definition unique by path', () => {
    const paths = endpointDefinitions.map((d) => d.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('emitApiEndpoints', () => {
  it('writes every endpoint as parseable JSON under api/v1/', async () => {
    const outDir = join(root, 'dist');
    const list = await generateApiEndpoints({ root, config, dataset, now: NOW });
    await emitApiEndpoints(outDir, list);
    for (const endpoint of list) {
      const raw = await readFile(join(outDir, 'api', 'v1', ...endpoint.path.split('/')), 'utf-8');
      expect(() => JSON.parse(raw)).not.toThrow();
    }
  });
});

import { describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';
import { applyQuery, parseQuery, type QuerySpec } from './query';

function project(slug: string, extra: Record<string, unknown> = {}): Project {
  return projectSchema.parse({
    slug,
    name: `Project ${slug.toUpperCase()}`,
    tagline: `Tagline ${slug}`,
    summary: `Summary for ${slug} which is long enough to pass schema validation.`,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...extra,
  });
}

const projects: Project[] = [
  project('web-game', { tags: ['web', 'game'], category: 'game', status: 'released', createdAt: '2026-05-01T00:00:00.000Z', platforms: ['web'] }),
  project('web-tool', { tags: ['web', 'tool'], category: 'web', status: 'wip', createdAt: '2026-06-01T00:00:00.000Z' }),
  project('cli-tool', { tags: ['cli', 'tool'], category: 'web', status: 'released', createdAt: '2025-01-01T00:00:00.000Z', platforms: ['linux'] }),
  project('orphan', { tags: ['misc'], category: 'other', status: 'archived', createdAt: '2024-01-01T00:00:00.000Z' }),
];

const spec = (over: Partial<QuerySpec> = {}): QuerySpec => ({
  tags: [],
  tagMode: 'or',
  platforms: [],
  sort: 'createdAt:desc',
  page: 1,
  pageSize: 24,
  ...over,
});

describe('parseQuery', () => {
  it('parses filters, sort and pagination from URLSearchParams', () => {
    const params = new URLSearchParams('tag=web,cli&tag=game&q=voxel&category=web&status=wip&platform=linux&playable=true&sort=name:asc&page=2&pageSize=10&fields=slug,name');
    const spec = parseQuery(params);
    expect(spec.tags).toEqual(['web', 'cli', 'game']);
    expect(spec.q).toBe('voxel');
    expect(spec.category).toBe('web');
    expect(spec.status).toBe('wip');
    expect(spec.platforms).toEqual(['linux']);
    expect(spec.playable).toBe(true);
    expect(spec.sort).toBe('name:asc');
    expect(spec.page).toBe(2);
    expect(spec.pageSize).toBe(10);
    expect(spec.fields).toEqual(['slug', 'name']);
  });

  it('falls back to defaults for invalid values', () => {
    const spec = parseQuery(new URLSearchParams('page=0&pageSize=99999&sort=bogus:up&tagMode=xor'));
    expect(spec.page).toBe(1);
    expect(spec.pageSize).toBe(24);
    expect(spec.sort).toBe('createdAt:desc');
    expect(spec.tagMode).toBe('or');
  });

  it('defaults to OR tag mode and drops unknown projection fields', () => {
    const spec = parseQuery(new URLSearchParams('fields=slug,password'));
    expect(spec.fields).toEqual(['slug']);
  });
});

describe('applyQuery - filtering', () => {
  it('filters by a single tag', () => {
    expect(applyQuery(projects, spec({ tags: ['web'] })).items.map((p) => p.slug)).toEqual([
      'web-tool',
      'web-game',
    ]);
  });

  it('OR mode matches any tag, AND mode requires all', () => {
    const or = applyQuery(projects, spec({ tags: ['game', 'cli'] }));
    expect(or.items.map((p) => p.slug)).toEqual(['web-game', 'cli-tool']);
    const and = applyQuery(projects, spec({ tags: ['game', 'cli'], tagMode: 'and' }));
    expect(and.items).toEqual([]);
  });

  it('filters by category, status, platforms and playable', () => {
    expect(applyQuery(projects, spec({ category: 'web' })).items.map((p) => p.slug)).toEqual(['web-tool', 'cli-tool']);
    expect(applyQuery(projects, spec({ status: 'released' })).items.map((p) => p.slug)).toEqual(['web-game', 'cli-tool']);
    expect(applyQuery(projects, spec({ platforms: ['linux'] })).items.map((p) => p.slug)).toEqual(['cli-tool']);
    expect(applyQuery(projects, spec({ playable: true })).items).toEqual([]);
  });

  it('searches q across name, tagline, summary and tags', () => {
    expect(applyQuery(projects, spec({ q: 'GAME' })).items.map((p) => p.slug)).toEqual(['web-game']);
    expect(applyQuery(projects, spec({ q: 'misc' })).items.map((p) => p.slug)).toEqual(['orphan']);
    expect(applyQuery(projects, spec({ q: 'zzz' })).items).toEqual([]);
  });
});

describe('applyQuery - sorting', () => {
  it('sorts by createdAt desc by default', () => {
    expect(applyQuery(projects, spec()).items.map((p) => p.slug)).toEqual([
      'web-tool',
      'web-game',
      'cli-tool',
      'orphan',
    ]);
  });

  it('supports name and weight sorts', () => {
    expect(applyQuery(projects, spec({ sort: 'name:asc' })).items[0]?.slug).toBe('cli-tool');
    const withWeight = [...projects, project('heavy', { weight: 100, createdAt: '2020-01-01T00:00:00.000Z' })];
    expect(applyQuery(withWeight, spec({ sort: 'weight:desc' })).items[0]?.slug).toBe('heavy');
  });
});

describe('applyQuery - pagination', () => {
  it('paginates and reports totals', () => {
    const result = applyQuery(projects, spec({ pageSize: 2, page: 2 }));
    expect(result.items.map((p) => p.slug)).toEqual(['cli-tool', 'orphan']);
    expect(result.total).toBe(4);
    expect(result.totalPages).toBe(2);
  });

  it('returns empty items for out-of-range pages while keeping totals', () => {
    const result = applyQuery(projects, spec({ pageSize: 2, page: 99 }));
    expect(result.items).toEqual([]);
    expect(result.total).toBe(4);
    expect(result.totalPages).toBe(2);
  });

  it('reports at least one total page for empty results', () => {
    const result = applyQuery([], spec());
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.facets.tags).toEqual({});
  });
});

describe('applyQuery - projection and facets', () => {
  it('projects only requested whitelisted fields', () => {
    const result = applyQuery(projects, spec({ fields: ['slug', 'name'] }));
    const item = result.items[0] as unknown as Record<string, unknown>;
    expect(Object.keys(item).sort()).toEqual(['name', 'slug']);
  });

  it('computes facets over the filtered set', () => {
    const result = applyQuery(projects, spec({ tags: ['web'] }));
    expect(result.facets.status).toEqual({ released: 1, wip: 1 });
    expect(result.facets.categories).toEqual({ game: 1, web: 1 });
    expect(result.facets.tags).toEqual({ web: 2, game: 1, tool: 1 });
  });
});

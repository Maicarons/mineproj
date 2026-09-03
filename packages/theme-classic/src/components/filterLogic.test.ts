import { describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';
import {
  applyFilters,
  DEFAULT_FILTER_STATE,
  deriveFacets,
  queryToState,
  stateToQuery,
  toggleInArray,
} from './filterLogic';

function project(slug: string, extra: Record<string, unknown> = {}): Project {
  return projectSchema.parse({
    slug,
    name: `Project ${slug}`,
    tagline: `Tagline for ${slug}`,
    summary: `Summary for ${slug} long enough for schema validation rules.`,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...extra,
  });
}

const projects: Project[] = [
  project('a', { name: 'Alpha', tags: ['web'], category: 'web', createdAt: '2026-05-01T00:00:00.000Z', status: 'released' }),
  project('b', { name: 'Beta', tags: ['cli'], category: 'cli', createdAt: '2026-06-01T00:00:00.000Z', status: 'archived' }),
  project('c', { name: 'Gamma', tags: ['web', 'game'], category: 'web', createdAt: '2026-07-01T00:00:00.000Z', status: 'wip' }),
];

describe('applyFilters (M3-10)', () => {
  it('excludes archived projects by default', () => {
    expect(applyFilters(projects, DEFAULT_FILTER_STATE).map((p) => p.slug)).toEqual(['c', 'a']);
  });

  it('includes archived when the switch is off', () => {
    const result = applyFilters(projects, { ...DEFAULT_FILTER_STATE, excludeArchived: false });
    expect(result).toHaveLength(3);
  });

  it('filters by category, tag (AND), status and free text', () => {
    const state = { ...DEFAULT_FILTER_STATE, categories: ['web'] };
    expect(applyFilters(projects, state).map((p) => p.slug)).toEqual(['c', 'a']);
    const tagAnd = { ...DEFAULT_FILTER_STATE, tags: ['web', 'game'], excludeArchived: false };
    expect(applyFilters(projects, tagAnd).map((p) => p.slug)).toEqual(['c']);
    const status = { ...DEFAULT_FILTER_STATE, status: ['wip'] };
    expect(applyFilters(projects, status).map((p) => p.slug)).toEqual(['c']);
    const q = { ...DEFAULT_FILTER_STATE, q: 'beta', excludeArchived: false };
    expect(applyFilters(projects, q).map((p) => p.slug)).toEqual(['b']);
  });

  it('sorts by newest, oldest, name and updated', () => {
    const s = (sort: Parameters<typeof applyFilters>[1]['sort']): string[] =>
      applyFilters(projects, { ...DEFAULT_FILTER_STATE, excludeArchived: false, sort }).map((p) => p.slug);
    expect(s('newest')).toEqual(['c', 'b', 'a']);
    expect(s('oldest')).toEqual(['a', 'b', 'c']);
    expect(s('name')).toEqual(['a', 'b', 'c']);
  });
});

describe('URL query sync (M3-05)', () => {
  it('omits defaults and round-trips through queryToState', () => {
    const state = { ...DEFAULT_FILTER_STATE, q: 'vox', tags: ['web', 'game'], sort: 'name' as const, excludeArchived: false };
    const qs = stateToQuery(state);
    expect(qs).toBe('?q=vox&tag=web%2Cgame&archived=1&sort=name');
    expect(queryToState(qs)).toEqual(state);
  });

  it('returns an empty query for default state', () => {
    expect(stateToQuery(DEFAULT_FILTER_STATE)).toBe('');
  });

  it('ignores unknown sort values on parse', () => {
    expect(queryToState('?sort=bogus').sort).toBe('newest');
  });
});

describe('facets + toggling', () => {
  it('derives facets with counts, sorted by count then name', () => {
    const facets = deriveFacets(projects);
    expect(facets.categories).toEqual([
      { name: 'web', count: 2 },
      { name: 'cli', count: 1 },
    ]);
    expect(facets.tags).toEqual([
      { name: 'web', count: 2 },
      { name: 'cli', count: 1 },
      { name: 'game', count: 1 },
    ]);
  });

  it('toggles membership without mutating the input', () => {
    const tags = ['web'];
    expect(toggleInArray(tags, 'game')).toEqual(['web', 'game']);
    expect(toggleInArray(tags, 'web')).toEqual([]);
    expect(tags).toEqual(['web']);
  });
});

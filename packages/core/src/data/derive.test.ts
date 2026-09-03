import { describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';
import {
  deriveCategories,
  derivePlatforms,
  deriveStats,
  deriveTags,
  deriveTimeline,
} from './derive';

function project(extra: Record<string, unknown>): Project {
  return projectSchema.parse({
    slug: 'p',
    name: 'P',
    tagline: 't',
    summary: 'A summary long enough to satisfy schema validation rules.',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...extra,
  });
}

const projects: Project[] = [
  project({ slug: 'a', name: 'A', tags: ['web', 'tool'], category: 'web', platforms: ['web'], license: 'MIT', featured: true, playable: { type: 'iframe' }, createdAt: '2026-03-01T00:00:00.000Z' }),
  project({ slug: 'b', name: 'B', tags: ['web', 'game'], category: 'game', platforms: ['web', 'windows'], createdAt: '2025-08-01T00:00:00.000Z', status: 'wip' }),
  project({ slug: 'c', name: 'C', tags: ['cli'], category: 'web', platforms: ['linux'], createdAt: '2026-06-01T00:00:00.000Z' }),
  project({ slug: 'd', name: 'D', tags: ['web', 'tool'], category: undefined, createdAt: '2024-01-01T00:00:00.000Z' }),
];

describe('deriveTags', () => {
  it('counts tags and sorts by count desc then name', () => {
    const tags = deriveTags(projects);
    expect(tags.map((t) => [t.name, t.count])).toEqual([
      ['web', 3],
      ['tool', 2],
      ['cli', 1],
      ['game', 1],
    ]);
  });

  it('never emits empty or missing tags', () => {
    const tags = deriveTags([project({ slug: 'x', name: 'X', tags: [] })]);
    expect(tags).toEqual([]);
  });

  it('deduplicates repeated tags within a single project', () => {
    const tags = deriveTags([project({ slug: 'x', name: 'X', tags: ['web', 'web'] })]);
    expect(tags).toEqual([{ name: 'web', count: 1 }]);
  });

  it('enriches counts from the tag dictionary', () => {
    const tags = deriveTags(projects, [
      { name: 'web', color: '#2563EB', description: 'Web stuff', weight: 0 },
    ]);
    const web = tags.find((t) => t.name === 'web');
    expect(web?.color).toBe('#2563EB');
    expect(web?.description).toBe('Web stuff');
    const game = tags.find((t) => t.name === 'game');
    expect(game?.color).toBeUndefined();
  });
});

describe('deriveCategories', () => {
  it('counts categories and skips projects without one', () => {
    expect(deriveCategories(projects)).toEqual([
      { name: 'web', count: 2 },
      { name: 'game', count: 1 },
    ]);
  });
});

describe('derivePlatforms', () => {
  it('aggregates platform counts', () => {
    expect(derivePlatforms(projects)).toEqual([
      { name: 'web', count: 2 },
      { name: 'linux', count: 1 },
      { name: 'windows', count: 1 },
    ]);
  });
});

describe('deriveTimeline', () => {
  it('groups projects by creation year, newest first', () => {
    expect(deriveTimeline(projects)).toEqual([
      { year: 2026, count: 2 },
      { year: 2025, count: 1 },
      { year: 2024, count: 1 },
    ]);
  });
});

describe('deriveStats', () => {
  it('computes site-wide statistics', () => {
    const stats = deriveStats(projects);
    expect(stats.total).toBe(4);
    expect(stats.byStatus).toEqual({ released: 3, wip: 1 });
    expect(stats.featured).toBe(1);
    expect(stats.playable).toBe(1);
    expect(stats.openSource).toBe(1);
    expect(stats.timeline).toEqual([
      { year: 2026, count: 2 },
      { year: 2025, count: 1 },
      { year: 2024, count: 1 },
    ]);
  });
});

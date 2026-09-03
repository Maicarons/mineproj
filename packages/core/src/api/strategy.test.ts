import { describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';
import { computeHotVariants, canonicalQueryString, isPregeneratedCombo } from './strategy';

function project(slug: string, tags: string[], createdAt: string): Project {
  return projectSchema.parse({
    slug,
    name: `P ${slug}`,
    tagline: 't',
    summary: `A summary for ${slug} long enough to pass schema validation rules.`,
    createdAt,
    tags,
  });
}

const projects: Project[] = [
  project('a', ['web'], '2026-01-01T00:00:00.000Z'),
  project('b', ['web'], '2026-02-01T00:00:00.000Z'),
  project('c', ['cli'], '2026-03-01T00:00:00.000Z'),
];

describe('computeHotVariants', () => {
  it('pregenerates the configured number of pages plus per-tag first pages', () => {
    const variants = computeHotVariants(projects, 2, 2);
    expect(variants.map((v) => v.path)).toEqual([
      'variants/page-1.json',
      'variants/page-2.json',
      'variants/tag-cli.json',
      'variants/tag-web.json',
    ]);
  });

  it('caps pages at the real total', () => {
    const variants = computeHotVariants(projects, 24, 3);
    expect(variants.map((v) => v.path).filter((p) => p.startsWith('variants/page'))).toEqual([
      'variants/page-1.json',
    ]);
  });
});

describe('combo matching', () => {
  const variants = computeHotVariants(projects, 2, 2);

  it('matches a pregenerated combo regardless of parameter order', () => {
    const params = new URLSearchParams('pageSize=2&page=1');
    expect(isPregeneratedCombo(variants, params)).toBe(true);
    const tagParams = new URLSearchParams('tag=web&page=1&pageSize=2');
    expect(isPregeneratedCombo(variants, tagParams)).toBe(true);
  });

  it('rejects combos that were not pregenerated', () => {
    const params = new URLSearchParams('tag=web&page=2&pageSize=2');
    expect(isPregeneratedCombo(variants, params)).toBe(false);
    const sorted = new URLSearchParams('sort=name:asc');
    expect(isPregeneratedCombo(variants, sorted)).toBe(false);
  });

  it('normalizes canonical query strings deterministically', () => {
    expect(canonicalQueryString(new URLSearchParams('tag=web&tag=cli'))).toBe('tag=web%2Ccli&page=1&pageSize=24');
  });
});

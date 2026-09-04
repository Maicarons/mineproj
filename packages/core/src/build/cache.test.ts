import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { buildSite } from '../pipeline';

let root: string;

const config: ResolvedMineprojConfig = mineprojConfigSchema.parse({
  site: { title: 'Cache Test' },
});

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-cache-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects'), { recursive: true });
  for (const slug of ['alpha', 'beta']) {
    await mkdir(join(root, 'data', 'projects', slug), { recursive: true });
    await writeFile(
      join(root, 'data', 'projects', slug, 'index.json'),
      JSON.stringify({
        slug,
        name: `Project ${slug}`,
        tagline: 't',
        summary: `Summary for ${slug}, long enough for schema validation rules.`,
        createdAt: '2026-01-01T00:00:00.000Z',
        tags: ['web'],
      }),
      'utf-8',
    );
  }
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe('incremental build cache', () => {
  it('re-renders everything on the first build', async () => {
    const result = await buildSite(root, config);
    expect(result.pages).toBe(7); // home + list + 2 details + tag + about + 404
    expect(result.revalidated).toBe(0);
  });

  it('skips all pages when nothing changed', async () => {
    await buildSite(root, config);
    const second = await buildSite(root, config);
    expect(second.revalidated).toBe(7);
    // Outputs still exist.
    const { readFile } = await import('node:fs/promises');
    expect(await readFile(join(second.outDir, 'index.html'), 'utf-8')).toContain('Cache Test');
  });

  it('re-renders only affected pages after a data change', async () => {
    await buildSite(root, config);
    await writeFile(
      join(root, 'data', 'projects', 'alpha', 'index.json'),
      JSON.stringify({
        slug: 'alpha',
        name: 'Project alpha CHANGED',
        tagline: 't',
        summary: 'Summary for alpha, long enough for schema validation rules.',
        createdAt: '2026-01-01T00:00:00.000Z',
        tags: ['web'],
      }),
      'utf-8',
    );
    const second = await buildSite(root, config);
    // alpha detail + home + list + tag changed; about + 404 + beta unchanged.
    expect(second.revalidated).toBe(3);
    const { readFile } = await import('node:fs/promises');
    const detail = await readFile(join(second.outDir, 'projects', 'alpha', 'index.html'), 'utf-8');
    expect(detail).toContain('CHANGED');
  });

  it('re-renders everything after a theme config change', async () => {
    await buildSite(root, config);
    const changed = mineprojConfigSchema.parse({
      site: { title: 'Cache Test' },
      themeConfig: { accent: '#FF0000' },
    });
    const second = await buildSite(root, changed);
    expect(second.revalidated).toBe(0);
  });
});

import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { generateApiEndpoints, loadConfig, loadDataset, type ApiEndpoint } from '@mineproj/core';

/**
 * API contract tests (M1-13): every generated endpoint for the example site
 * is compared against a golden file. Response structures are frozen — a diff
 * means a breaking contract change and must be updated explicitly with
 * `pnpm --filter @mineproj/contract-tests update-golden`.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_ROOT = join(HERE, '..', '..', 'examples', 'basic');
const GOLDEN_DIR = join(HERE, 'golden');
const NOW = '2026-09-03T08:00:00.000Z';
const UPDATE = process.env.UPDATE_GOLDEN === '1';

let endpoints: ApiEndpoint[];

beforeAll(async () => {
  const { config } = await loadConfig(EXAMPLE_ROOT);
  const dataset = await loadDataset(EXAMPLE_ROOT, config);
  endpoints = await generateApiEndpoints({
    root: EXAMPLE_ROOT,
    config,
    dataset,
    now: NOW,
  });
});

function goldenPathFor(endpointPath: string): string {
  return join(GOLDEN_DIR, `${endpointPath.replace(/\//g, '__')}`);
}

describe('static api contract', () => {
  it('covers the expected endpoint surface', () => {
    const paths = endpoints.map((e) => e.path).sort();
    expect(paths).toContain('projects.json');
    expect(paths).toContain('manifest.json');
    expect(paths).toContain('projects/atlas-maps.json');
    expect(paths).toContain('projects/csv-wrangler.json');
    expect(paths).toContain('projects/ink-scheduler.json');
    expect(paths).toContain('projects/pixel-pong.json');
    expect(paths).toContain('projects/voxel-tool.json');
  });

  it.each([
    'projects.json',
    'tags.json',
    'categories.json',
    'profile.json',
    'stats.json',
    'feed.json',
    'manifest.json',
    'search.json',
    'projects/voxel-tool.json',
  ])('matches the golden file for %s', async (path) => {
    const endpoint = endpoints.find((e) => e.path === path);
    expect(endpoint, `endpoint ${path} missing`).toBeDefined();
    const goldenFile = goldenPathFor(path);

    if (UPDATE) {
      await mkdir(dirname(goldenFile), { recursive: true });
      await writeFile(goldenFile, JSON.stringify(endpoint?.body, null, 2), 'utf-8');
      return;
    }

    const golden = JSON.parse(await readFile(goldenFile, 'utf-8'));
    expect(endpoint?.body).toEqual(golden);
  });

  it('keeps generatedAt deterministic for contract stability', () => {
    for (const endpoint of endpoints) {
      const body = endpoint.body as { generatedAt?: string };
      if (body.generatedAt !== undefined) {
        expect(body.generatedAt).toBe(NOW);
      }
    }
  });

  it('rewrites every golden file in update mode', async () => {
    if (!UPDATE) return;
    await rm(GOLDEN_DIR, { recursive: true, force: true });
    await mkdir(GOLDEN_DIR, { recursive: true });
    for (const endpoint of endpoints) {
      await writeFile(goldenPathFor(endpoint.path), JSON.stringify(endpoint.body, null, 2), 'utf-8');
    }
    const files = await readdir(GOLDEN_DIR);
    expect(files.length).toBe(endpoints.length);
  });
});

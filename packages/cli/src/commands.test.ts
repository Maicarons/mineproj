import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { main } from './commands';

let root: string;

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-check-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects'), { recursive: true });
  await writeFile(
    join(root, 'mineproj.config.json'),
    JSON.stringify({ site: { title: 'Check Site' } }),
    'utf-8',
  );
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function projectJson(slug: string): string {
  return JSON.stringify({
    slug,
    name: `Project ${slug}`,
    tagline: `Tagline ${slug}`,
    summary: `Summary for ${slug} which is long enough to pass schema validation.`,
    createdAt: '2026-01-01T00:00:00.000Z',
  });
}

describe('check command', () => {
  it('passes on a valid site and reports counts', async () => {
    await writeFile(join(root, 'data', 'projects', 'good.json'), projectJson('good'), 'utf-8');
    const exitCode = await main(['check', '--root', root]);
    expect(exitCode).toBe(0);
  });

  it('exits non-zero with a readable error on invalid project data', async () => {
    await writeFile(
      join(root, 'data', 'projects', 'bad.json'),
      JSON.stringify({ slug: 'bad', name: '', summary: 'too short', createdAt: 'x' }),
      'utf-8',
    );
    const exitCode = await main(['check', '--root', root]);
    expect(exitCode).toBe(1);
  });

  it('exits non-zero when no config exists', async () => {
    const empty = join(root, 'empty');
    await mkdir(empty, { recursive: true });
    const exitCode = await main(['check', '--root', empty]);
    expect(exitCode).toBe(1);
  });

  it('exits non-zero on duplicate slugs', async () => {
    await writeFile(join(root, 'data', 'projects', 'dup.json'), projectJson('dup'), 'utf-8');
    await writeFile(
      join(root, 'data', 'projects.json'),
      JSON.stringify([JSON.parse(projectJson('dup'))]),
      'utf-8',
    );
    const exitCode = await main(['check', '--root', root]);
    expect(exitCode).toBe(1);
  });
});

import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { buildSite, type BuildResult } from '../build';
import { DataError, scanProjects } from './data';
import { escapeHtml, renderIndexHtml } from './render';

let root: string;

const config: ResolvedMineprojConfig = mineprojConfigSchema.parse({
  site: { title: 'My <Projects>', description: 'A showcase site' },
});

function projectJson(slug: string, name: string, weight = 0): string {
  return JSON.stringify({
    slug,
    name,
    tagline: `Tagline of ${name}`,
    summary: `Summary text for ${name} which is long enough to pass validation.`,
    createdAt: '2026-08-01T00:00:00.000Z',
    weight,
  });
}

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-render-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects'), { recursive: true });
  await writeFile(
    join(root, 'mineproj.config.json'),
    JSON.stringify({ site: { title: 'My <Projects>' } }),
    'utf-8',
  );
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('scanProjects', () => {
  it('loads directory-form projects and sorts by weight then date', async () => {
    const base = join(root, 'data', 'projects');
    await mkdir(join(base, 'beta-tool'), { recursive: true });
    await writeFile(join(base, 'beta-tool', 'index.json'), projectJson('beta-tool', 'Beta Tool'), 'utf-8');
    await mkdir(join(base, 'alpha-tool'), { recursive: true });
    await writeFile(
      join(base, 'alpha-tool', 'index.json'),
      projectJson('alpha-tool', 'Alpha Tool', 10),
      'utf-8',
    );
    const projects = await scanProjects(root, 'data');
    expect(projects.map((p) => p.slug)).toEqual(['alpha-tool', 'beta-tool']);
  });

  it('loads one-file-form projects (<slug>.json)', async () => {
    const base = join(root, 'data', 'projects');
    await writeFile(join(base, 'solo.json'), projectJson('solo', 'Solo'), 'utf-8');
    const projects = await scanProjects(root, 'data');
    expect(projects.map((p) => p.slug)).toEqual(['solo']);
  });

  it('loads single-file form (projects.json array)', async () => {
    await rm(join(root, 'data', 'projects'), { recursive: true, force: true });
    await writeFile(
      join(root, 'data', 'projects.json'),
      JSON.stringify([JSON.parse(projectJson('a', 'A')), JSON.parse(projectJson('b', 'B'))]),
      'utf-8',
    );
    const projects = await scanProjects(root, 'data');
    expect(projects).toHaveLength(2);
  });

  it('rejects a slug mismatch with both names in the error', async () => {
    const base = join(root, 'data', 'projects');
    await mkdir(join(base, 'wrong-dir'), { recursive: true });
    await writeFile(join(base, 'wrong-dir', 'index.json'), projectJson('other-slug', 'X'), 'utf-8');
    await expect(scanProjects(root, 'data')).rejects.toThrow(
      /wrong-dir[\s\S]*other-slug/,
    );
  });

  it('reports the file and field path for invalid data', async () => {
    const base = join(root, 'data', 'projects');
    await mkdir(join(base, 'bad'), { recursive: true });
    await writeFile(
      join(base, 'bad', 'index.json'),
      JSON.stringify({ slug: 'bad', name: '', summary: 'not enough', createdAt: 'x' }),
      'utf-8',
    );
    await expect(scanProjects(root, 'data')).rejects.toThrow(DataError);
    try {
      await scanProjects(root, 'data');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain(join('bad', 'index.json'));
      expect(message).toContain('name');
      expect(message).toContain('summary');
    }
  });

  it('returns an empty list when no data exists', async () => {
    await rm(join(root, 'data'), { recursive: true, force: true });
    expect(await scanProjects(root, 'data')).toEqual([]);
  });
});

describe('renderIndexHtml', () => {
  it('escapes HTML-special characters in titles and names', () => {
    const projects = [JSON.parse(projectJson('x', '<script>alert(1)</script>'))] as never[];
    const html = renderIndexHtml(config, projects);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('My &lt;Projects&gt;');
  });

  it('lists project names with links', () => {
    const projects = [JSON.parse(projectJson('voxel-tool', 'Voxel Tool'))] as never[];
    const html = renderIndexHtml(config, projects);
    expect(html).toContain('href="/projects/voxel-tool/"');
    expect(html).toContain('Voxel Tool');
  });
});

describe('buildSite', () => {
  async function seedThreeProjects(): Promise<void> {
    const base = join(root, 'data', 'projects');
    for (const [slug, name, weight] of [
      ['alpha', 'Alpha Project', 5],
      ['beta', 'Beta Project', 0],
      ['gamma', 'Gamma Project', 3],
    ] as const) {
      await mkdir(join(base, slug), { recursive: true });
      await writeFile(join(base, slug, 'index.json'), projectJson(slug, name, weight), 'utf-8');
    }
  }

  it('writes dist/index.html containing all project names', async () => {
    await seedThreeProjects();
    const result: BuildResult = await buildSite(root, config);
    expect(result.pages).toBe(3);
    const html = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    for (const name of ['Alpha Project', 'Beta Project', 'Gamma Project']) {
      expect(html).toContain(name);
    }
  });

  it('cleans the outDir and honors an override', async () => {
    await seedThreeProjects();
    await mkdir(join(root, 'custom-out'), { recursive: true });
    await writeFile(join(root, 'custom-out', 'stale.txt'), 'delete me', 'utf-8');
    const result = await buildSite(root, config, { outDir: 'custom-out' });
    await expect(stat(join(root, 'custom-out', 'stale.txt'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
    expect(result.outDir).toBe(join(root, 'custom-out'));
  });

  it('copies the public directory into the output', async () => {
    await seedThreeProjects();
    await mkdir(join(root, 'public', 'assets'), { recursive: true });
    await writeFile(join(root, 'public', 'favicon.ico'), 'ico', 'utf-8');
    await writeFile(join(root, 'public', 'assets', 'style.css'), 'body{}', 'utf-8');
    const result = await buildSite(root, config);
    expect(await readFile(join(result.outDir, 'favicon.ico'), 'utf-8')).toBe('ico');
    expect(await readFile(join(result.outDir, 'assets', 'style.css'), 'utf-8')).toBe('body{}');
  });

  it('excludes hidden projects from the page count', async () => {
    await seedThreeProjects();
    const base = join(root, 'data', 'projects');
    await mkdir(join(base, 'secret'), { recursive: true });
    await writeFile(
      join(base, 'secret', 'index.json'),
      JSON.stringify({
        slug: 'secret',
        name: 'Secret Project',
        tagline: 'Hidden',
        summary: 'A hidden project that should not appear in listings at all.',
        createdAt: '2026-08-01T00:00:00.000Z',
        hidden: true,
      }),
      'utf-8',
    );
    const result = await buildSite(root, config);
    const html = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    expect(html).not.toContain('Secret Project');
    expect(result.pages).toBe(3);
  });
});

describe('escapeHtml', () => {
  it('escapes all HTML-special characters', () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
  });
});

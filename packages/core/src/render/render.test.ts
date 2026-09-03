import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { buildSite, type BuildResult } from '../build';
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

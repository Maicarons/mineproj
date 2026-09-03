import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from './config/schema';
import { buildSite } from './pipeline';

let root: string;
let config: ResolvedMineprojConfig;

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-m5-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
  await writeFile(
    join(root, 'mineproj.config.json'),
    JSON.stringify({
      site: { title: 'Bilingual', defaultLocale: 'zh-CN', locales: ['zh-CN', 'en'], fallbackLocale: 'zh-CN' },
    }),
    'utf-8',
  );
  await writeFile(
    join(root, 'data', 'projects', 'voxel-tool', 'index.json'),
    JSON.stringify({
      slug: 'voxel-tool',
      name: 'Voxel Tool',
      tagline: '体素编辑器',
      summary: '一个完全运行在浏览器里的体素编辑器，无需安装即可使用。',
      createdAt: '2026-01-15T00:00:00.000Z',
      tags: ['web'],
    }),
    'utf-8',
  );
  await writeFile(
    join(root, 'data', 'projects', 'voxel-tool', 'index.en.json'),
    JSON.stringify({ name: 'Voxel Tool EN', tagline: 'A tiny voxel editor' }),
    'utf-8',
  );
  config = mineprojConfigSchema.parse({
    site: { title: 'Bilingual', defaultLocale: 'zh-CN', locales: ['zh-CN', 'en'], fallbackLocale: 'zh-CN' },
  });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe('M5-06 bilingual pipeline', () => {
  it('emits prefixed en pages beside unprefixed default pages', async () => {
    const result = await buildSite(root, config);
    // home + list + detail + tag + about + 404 = 6 per locale
    expect(result.pages).toBe(12);
    const enHome = await readFile(join(result.outDir, 'en', 'index.html'), 'utf-8');
    expect(enHome).toContain('lang="en"');
    expect(enHome).toContain('Voxel Tool EN');
    const zhHome = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    expect(zhHome).toContain('lang="zh-CN"');
    expect(zhHome).toContain('Voxel Tool');
  });

  it('emits pairwise hreflang alternates including x-default', async () => {
    const result = await buildSite(root, config);
    const enHome = await readFile(join(result.outDir, 'en', 'index.html'), 'utf-8');
    expect(enHome).toContain('hreflang="zh-CN"');
    expect(enHome).toContain('hreflang="en"');
    expect(enHome).toContain('hreflang="x-default"');
    expect(enHome).toContain('href="/projects/voxel-tool/"');
  });

  it('creates the localized 404 fallback so switching never 404s', async () => {
    const result = await buildSite(root, config);
    const en404 = await readFile(join(result.outDir, 'en', '404.html'), 'utf-8');
    expect(en404).toContain('lang="en"');
  });

  it('falls back to the default locale content when no override exists', async () => {
    await mkdir(join(root, 'data', 'projects', 'solo'), { recursive: true });
    await writeFile(
      join(root, 'data', 'projects', 'solo', 'index.json'),
      JSON.stringify({
        slug: 'solo',
        name: 'Solo',
        tagline: 't',
        summary: 'A summary for solo long enough for schema validation rules.',
        createdAt: '2026-02-01T00:00:00.000Z',
      }),
      'utf-8',
    );
    const result = await buildSite(root, config);
    const enSolo = await readFile(join(result.outDir, 'en', 'projects', 'solo', 'index.html'), 'utf-8');
    // No en override → default-locale content still renders (no 404, no blank).
    expect(enSolo).toContain('Solo');
  });
});

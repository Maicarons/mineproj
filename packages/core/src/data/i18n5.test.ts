import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';
import { applyOverride, collectI18nGaps, dirForLocale, localizeProject, resolveLocaleChain } from './i18n';

let root: string;
let project: Project;

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-i18n5-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
  project = projectSchema.parse({
    slug: 'voxel-tool',
    name: 'Voxel Tool',
    tagline: 'A tiny voxel editor',
    summary: 'A tiny voxel editor that runs entirely in the browser with zero install.',
    createdAt: '2026-01-15T00:00:00.000Z',
  });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('M5-01 locale config semantics', () => {
  it('builds the fallback chain locale → fallback → default, deduped', () => {
    expect(resolveLocaleChain('zh-CN', 'en', 'en')).toEqual(['en', 'zh-CN']);
    expect(resolveLocaleChain('zh-CN', undefined, 'zh-CN')).toEqual(['zh-CN']);
    expect(resolveLocaleChain('zh-CN', 'en', 'fr')).toEqual(['fr', 'en', 'zh-CN']);
  });
});

describe('M5-03 i18n gaps', () => {
  it('reports projects without any override for a non-default locale', () => {
    const gaps = collectI18nGaps([project], 'en', 'zh-CN');
    expect(gaps).toEqual([{ slug: 'voxel-tool', locale: 'en', hasInline: false }]);
  });

  it('ignores gaps for the default locale and for translated projects', () => {
    expect(collectI18nGaps([project], 'zh-CN', 'zh-CN')).toEqual([]);
    const translated = applyOverride(project, { name: 'Voxel Tool EN' });
    const withInline = { ...translated, i18n: { en: { name: 'Voxel Tool EN' } } };
    expect(collectI18nGaps([withInline as unknown as Project], 'en', 'zh-CN')).toEqual([]);
  });
});

describe('localizeProject per-locale views (M5-02/04)', () => {
  const sourceFile = 'data/projects/voxel-tool/index.json';

  it('localizes from an index.<locale>.json file', async () => {
    await writeFile(
      join(root, 'data', 'projects', 'voxel-tool', 'index.en.json'),
      JSON.stringify({ name: 'Voxel Tool EN', bodyFile: 'body.en.md' }),
      'utf-8',
    );
    const localized = await localizeProject(root, project, sourceFile, 'en');
    expect(localized.name).toBe('Voxel Tool EN');
    expect(localized.bodyFile).toBe('body.en.md');
    // Default view untouched.
    expect((await localizeProject(root, project, sourceFile, 'zh-CN')).name).toBe('Voxel Tool');
  });
});

describe('M5-12 dir derivation', () => {
  it('derives rtl for ar/he/fa and ltr otherwise', () => {
    expect(dirForLocale('ar')).toBe('rtl');
    expect(dirForLocale('he-IL')).toBe('rtl');
    expect(dirForLocale('fa')).toBe('rtl');
    expect(dirForLocale('zh-CN')).toBe('ltr');
    expect(dirForLocale('en')).toBe('ltr');
  });
});

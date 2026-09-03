import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';
import { applyOverride, deepMerge, loadLocaleOverride, localizeProject, localeOverrideFilePaths } from './i18n';

let root: string;

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-i18n-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function parseProject(extra: Record<string, unknown> = {}): Project {
  return projectSchema.parse({
    slug: 'voxel-tool',
    name: 'Voxel Tool',
    tagline: 'A tiny voxel editor',
    summary: 'A tiny voxel editor that runs entirely in the browser with zero install.',
    createdAt: '2026-01-15T00:00:00.000Z',
    tags: ['web'],
    highlights: ['Fast'],
    seo: { keywords: ['voxel'] },
    ...extra,
  });
}

describe('deepMerge', () => {
  it('replaces arrays wholesale', () => {
    expect(deepMerge({ tags: ['a', 'b'] }, { tags: ['x'] })).toEqual({ tags: ['x'] });
  });

  it('deep-merges nested objects keeping untouched keys', () => {
    const result = deepMerge(
      { seo: { title: 'T', keywords: ['k'] } },
      { seo: { description: 'D' } },
    );
    expect(result).toEqual({ seo: { title: 'T', description: 'D', keywords: ['k'] } });
  });

  it('overrides scalars and returns base for undefined overrides', () => {
    expect(deepMerge('old', 'new')).toBe('new');
    expect(deepMerge('old', undefined)).toBe('old');
    expect(deepMerge({ n: 1 }, { n: 2 })).toEqual({ n: 2 });
  });

  it('adds keys that only exist in the override', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe('applyOverride', () => {
  it('overrides localized fields while keeping the rest', () => {
    const project = parseProject();
    const localized = applyOverride(project, {
      name: 'Voxel Tool EN',
      tagline: 'English tagline',
    });
    expect(localized.name).toBe('Voxel Tool EN');
    expect(localized.summary).toBe(project.summary);
    expect(localized.slug).toBe('voxel-tool');
  });

  it('replaces arrays like highlights as a whole', () => {
    const localized = applyOverride(parseProject(), { highlights: ['One', 'Two'] });
    expect(localized.highlights).toEqual(['One', 'Two']);
  });

  it('deep-merges nested seo objects', () => {
    const localized = applyOverride(parseProject(), { seo: { description: 'English desc' } });
    expect(localized.seo.description).toBe('English desc');
    expect(localized.seo.keywords).toEqual(['voxel']);
  });
});

describe('localizeProject (file + inline priority)', () => {
  const sourceFile = 'data/projects/voxel-tool/index.json';

  it('applies the inline i18n object over root fields', async () => {
    const project = parseProject({
      i18n: { en: { name: 'Inline Name', highlights: ['Inline highlight'] } },
    });
    const localized = await localizeProject(root, project, sourceFile, 'en');
    expect(localized.name).toBe('Inline Name');
    expect(localized.highlights).toEqual(['Inline highlight']);
  });

  it('the external index.<locale>.json file wins over the inline object', async () => {
    await writeFile(
      join(root, 'data', 'projects', 'voxel-tool', 'index.en.json'),
      JSON.stringify({ name: 'File Name' }),
      'utf-8',
    );
    const project = parseProject({ i18n: { en: { name: 'Inline Name' } } });
    const localized = await localizeProject(root, project, sourceFile, 'en');
    expect(localized.name).toBe('File Name');
  });

  it('merges fields from both file and inline sources', async () => {
    await writeFile(
      join(root, 'data', 'projects', 'voxel-tool', 'index.en.json'),
      JSON.stringify({ tagline: 'From file' }),
      'utf-8',
    );
    const project = parseProject({ i18n: { en: { name: 'Inline Name' } } });
    const localized = await localizeProject(root, project, sourceFile, 'en');
    expect(localized.name).toBe('Inline Name');
    expect(localized.tagline).toBe('From file');
  });

  it('returns the original project for the default locale with no overrides', async () => {
    const project = parseProject();
    const localized = await localizeProject(root, project, sourceFile, 'zh-CN');
    expect(localized).toEqual(project);
  });

  it('rejects an invalid override file with field paths', async () => {
    await writeFile(
      join(root, 'data', 'projects', 'voxel-tool', 'index.en.json'),
      JSON.stringify({ summary: 42 }),
      'utf-8',
    );
    const project = parseProject();
    await expect(localizeProject(root, project, sourceFile, 'en')).rejects.toThrow(
      /index\.en\.json[\s\S]*summary/,
    );
  });
});

describe('localeOverrideFilePaths', () => {
  it('uses index.<locale>.json for directory-form projects', () => {
    expect(localeOverrideFilePaths('data/projects/voxel-tool/index.json', 'en')).toEqual([
      'data/projects/voxel-tool/index.en.json',
    ]);
  });

  it('uses <slug>.<locale>.json for one-file-form projects', () => {
    expect(localeOverrideFilePaths('data/projects/voxel-tool.json', 'en')).toEqual([
      'data/projects/voxel-tool.en.json',
      'data/projects/index.en.json',
    ]);
  });
});

describe('loadLocaleOverride', () => {
  it('returns undefined when no override file exists', async () => {
    expect(await loadLocaleOverride(root, 'data/projects/voxel-tool/index.json', 'en')).toBeUndefined();
  });
});

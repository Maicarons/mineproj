import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { DataError, loadCollections, loadDataset, loadProfile, loadProjects, loadTags } from './loader';

let root: string;

const config: ResolvedMineprojConfig = mineprojConfigSchema.parse({
  site: { title: 'Loader Test' },
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
  root = join(tmpdir(), `mineproj-loader-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects'), { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function projectsPath(...parts: string[]): string {
  return join(root, 'data', 'projects', ...parts);
}

describe('loadProjects', () => {
  it('loads directory-form projects (<slug>/index.json)', async () => {
    await mkdir(projectsPath('alpha'), { recursive: true });
    await writeFile(projectsPath('alpha', 'index.json'), projectJson('alpha', 'Alpha'), 'utf-8');
    const { projects, sources } = await loadProjects(root, 'data');
    expect(projects.map((p) => p.slug)).toEqual(['alpha']);
    expect(sources[0]?.file).toBe('data/projects/alpha/index.json');
  });

  it('loads one-file-form projects (<slug>.json)', async () => {
    await writeFile(projectsPath('solo.json'), projectJson('solo', 'Solo'), 'utf-8');
    const { projects } = await loadProjects(root, 'data');
    expect(projects.map((p) => p.slug)).toEqual(['solo']);
  });

  it('loads single-file form (projects.json array)', async () => {
    await rm(join(root, 'data', 'projects'), { recursive: true, force: true });
    await writeFile(
      join(root, 'data', 'projects.json'),
      JSON.stringify([JSON.parse(projectJson('a', 'A')), JSON.parse(projectJson('b', 'B'))]),
      'utf-8',
    );
    const { projects } = await loadProjects(root, 'data');
    expect(projects.map((p) => p.slug)).toEqual(['a', 'b']);
  });

  it('mixes all three forms in one site', async () => {
    await mkdir(projectsPath('dir-project'), { recursive: true });
    await writeFile(projectsPath('dir-project', 'index.json'), projectJson('dir-project', 'Dir'), 'utf-8');
    await writeFile(projectsPath('file-project.json'), projectJson('file-project', 'File'), 'utf-8');
    await writeFile(
      join(root, 'data', 'projects.json'),
      JSON.stringify([JSON.parse(projectJson('inline-project', 'Inline'))]),
      'utf-8',
    );
    const { projects } = await loadProjects(root, 'data');
    expect(projects.map((p) => p.slug).sort()).toEqual(['dir-project', 'file-project', 'inline-project']);
  });

  it('discovers projects in nested directories recursively', async () => {
    await mkdir(projectsPath('2026', 'nested-project'), { recursive: true });
    await writeFile(
      projectsPath('2026', 'nested-project', 'index.json'),
      projectJson('nested-project', 'Nested'),
      'utf-8',
    );
    const { projects } = await loadProjects(root, 'data');
    expect(projects.map((p) => p.slug)).toEqual(['nested-project']);
  });

  it('rejects duplicate slugs naming both file paths', async () => {
    await mkdir(projectsPath('dup'), { recursive: true });
    await writeFile(projectsPath('dup', 'index.json'), projectJson('dup', 'Dup Dir'), 'utf-8');
    await writeFile(projectsPath('dup.json'), projectJson('dup', 'Dup File'), 'utf-8');
    await expect(loadProjects(root, 'data')).rejects.toThrow(DataError);
    try {
      await loadProjects(root, 'data');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('Duplicate project slug "dup"');
      expect(message).toContain('data/projects/dup.json');
      expect(message).toContain('data/projects/dup/index.json');
    }
  });

  it('detects conflicts between the single file and directory forms', async () => {
    await writeFile(projectsPath('clash.json'), projectJson('clash', 'File'), 'utf-8');
    await writeFile(
      join(root, 'data', 'projects.json'),
      JSON.stringify([JSON.parse(projectJson('clash', 'Single'))]),
      'utf-8',
    );
    try {
      await loadProjects(root, 'data');
      expect.unreachable('should have thrown');
    } catch (err) {
      expect((err as Error).message).toContain('data/projects/clash.json');
      expect((err as Error).message).toContain('data/projects.json');
    }
  });

  it('rejects slug mismatch with the file name', async () => {
    await writeFile(projectsPath('other-name.json'), projectJson('declared-slug', 'X'), 'utf-8');
    await expect(loadProjects(root, 'data')).rejects.toThrow(/other-name[\s\S]*declared-slug/);
  });

  it('rejects an invalid slug (uppercase) even if it matches the file name', async () => {
    await writeFile(projectsPath('Bad-Name.json'), projectJson('Bad-Name', 'X'), 'utf-8');
    await expect(loadProjects(root, 'data')).rejects.toThrow(/slug/);
  });

  it('sorts by weight desc then newest first', async () => {
    await mkdir(projectsPath('old-low'), { recursive: true });
    await writeFile(projectsPath('old-low', 'index.json'), projectJson('old-low', 'Old', 0), 'utf-8');
    await mkdir(projectsPath('new-high'), { recursive: true });
    await writeFile(projectsPath('new-high', 'index.json'), projectJson('new-high', 'New', 5), 'utf-8');
    const { projects } = await loadProjects(root, 'data');
    expect(projects.map((p) => p.slug)).toEqual(['new-high', 'old-low']);
  });

  it('returns an empty list when no data exists', async () => {
    await rm(join(root, 'data'), { recursive: true, force: true });
    const { projects } = await loadProjects(root, 'data');
    expect(projects).toEqual([]);
  });
});

describe('loadProfile / loadTags / loadCollections', () => {
  it('returns null for a missing profile', async () => {
    expect(await loadProfile(root, 'data')).toBeNull();
  });

  it('rejects an invalid profile with field paths', async () => {
    await writeFile(join(root, 'data', 'profile.json'), JSON.stringify({ name: '' }), 'utf-8');
    await expect(loadProfile(root, 'data')).rejects.toThrow(/profile\.json[\s\S]*name/);
  });

  it('accepts tags as an array', async () => {
    await writeFile(
      join(root, 'data', 'tags.json'),
      JSON.stringify([{ name: 'web', color: '#2563EB' }]),
      'utf-8',
    );
    expect(await loadTags(root, 'data')).toEqual([{ name: 'web', color: '#2563EB', weight: 0 }]);
  });

  it('accepts tags as a name-keyed dictionary', async () => {
    await writeFile(
      join(root, 'data', 'tags.json'),
      JSON.stringify({ web: { color: '#2563EB', description: 'Web stuff' } }),
      'utf-8',
    );
    const tags = await loadTags(root, 'data');
    expect(tags).toEqual([{ name: 'web', color: '#2563EB', description: 'Web stuff', weight: 0 }]);
  });

  it('rejects an invalid tag', async () => {
    await writeFile(join(root, 'data', 'tags.json'), JSON.stringify([{ name: '' }]), 'utf-8');
    await expect(loadTags(root, 'data')).rejects.toThrow(/tags\.json[\s\S]*name/);
  });

  it('loads collections and returns [] when missing', async () => {
    expect(await loadCollections(root, 'data')).toEqual([]);
    await writeFile(
      join(root, 'data', 'collections.json'),
      JSON.stringify([{ slug: 'picks', name: 'Picks', projectSlugs: ['a'] }]),
      'utf-8',
    );
    const collections = await loadCollections(root, 'data');
    expect(collections).toHaveLength(1);
    expect(collections[0]?.slug).toBe('picks');
  });
});

describe('loadDataset', () => {
  it('assembles the full dataset', async () => {
    await mkdir(projectsPath('voxel-tool'), { recursive: true });
    await writeFile(projectsPath('voxel-tool', 'index.json'), projectJson('voxel-tool', 'Voxel'), 'utf-8');
    await writeFile(
      join(root, 'data', 'profile.json'),
      JSON.stringify({ name: 'Mai' }),
      'utf-8',
    );
    await writeFile(join(root, 'data', 'tags.json'), JSON.stringify({ web: {} }), 'utf-8');
    const dataset = await loadDataset(root, config);
    expect(dataset.projects).toHaveLength(1);
    expect(dataset.profile?.name).toBe('Mai');
    expect(dataset.tags.map((t) => t.name)).toEqual(['web']);
    expect(dataset.collections).toEqual([]);
    expect(dataset.sources).toEqual([{ slug: 'voxel-tool', file: 'data/projects/voxel-tool/index.json' }]);
  });
});

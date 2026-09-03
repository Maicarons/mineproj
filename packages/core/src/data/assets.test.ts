import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from '../config/schema';
import { buildSite } from '../build';
import { readFile } from 'node:fs/promises';
import {
  collectAssetRefs,
  isExternalUrl,
  isLocalRelative,
  isSiteAbsolute,
  processProjectAssets,
  sourceDirOfProjectFile,
} from './assets';

let root: string;

const config: ResolvedMineprojConfig = mineprojConfigSchema.parse({
  site: { title: 'Assets Test' },
});

function baseProject(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: 'voxel-tool',
    name: 'Voxel Tool',
    tagline: 'Tiny voxel editor',
    summary: 'A tiny voxel editor that runs entirely in the browser with zero install.',
    createdAt: '2026-01-15T00:00:00.000Z',
    ...extra,
  };
}

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-assets-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects'), { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('path classification', () => {
  it('classifies external, site-absolute and relative paths', () => {
    expect(isExternalUrl('https://cdn.example.com/a.png')).toBe(true);
    expect(isExternalUrl('//cdn.example.com/a.png')).toBe(true);
    expect(isSiteAbsolute('/demos/x/index.html')).toBe(true);
    expect(isLocalRelative('cover.png')).toBe(true);
    expect(isLocalRelative('gallery/01.png')).toBe(true);
    expect(isLocalRelative('https://x.example.com/a.png')).toBe(false);
    expect(isLocalRelative('/uploads/a.png')).toBe(false);
  });
});

describe('collectAssetRefs', () => {
  it('collects every asset field with its field path', () => {
    const project = {
      ...baseProject({
        cover: 'cover.png',
        icon: 'icon.svg',
        video: { src: 'video/demo.mp4', type: 'video/mp4' },
        screenshots: [{ src: 'gallery/01.png' }, { src: 'gallery/02.png' }],
        docs: [{ title: 'Paper', file: 'docs/paper.pdf' }],
        seo: { ogImage: 'og.png' },
        links: [{ type: 'repo', url: 'https://github.com/x/y', primary: true }],
        playable: { type: 'iframe', entry: '/demos/voxel/index.html' },
      }),
    } as never;
    const refs = collectAssetRefs(project);
    const fields = refs.map((r) => r.field);
    expect(fields).toEqual([
      'cover',
      'icon',
      'seo.ogImage',
      'video.src',
      'screenshots.0.src',
      'screenshots.1.src',
      'docs.0.file',
    ]);
  });

  it('ignores absolute and external asset paths', () => {
    const project = {
      ...baseProject({ cover: 'https://cdn.example.com/cover.png' }),
    } as never;
    expect(collectAssetRefs(project)).toEqual([]);
  });
});

describe('processProjectAssets', () => {
  it('rewrites local relative paths to site URLs and copies files', async () => {
    const dir = join(root, 'data', 'projects', 'voxel-tool');
    await mkdir(join(dir, 'gallery'), { recursive: true });
    await writeFile(join(dir, 'cover.png'), 'png', 'utf-8');
    await writeFile(join(dir, 'gallery', '01.png'), 'shot', 'utf-8');
    const project = baseProject({
      cover: 'cover.png',
      screenshots: [{ src: 'gallery/01.png', alt: 'Main' }],
      links: [{ type: 'repo', url: 'https://github.com/x/y', primary: true }],
    }) as never;

    const copied: string[] = [];
    const result = await processProjectAssets(project, {
      slug: 'voxel-tool',
      sourceDirAbs: dir,
      assetsOutDirAbs: join(root, 'dist', 'projects', 'voxel-tool'),
      urlBase: '/projects/voxel-tool',
      copyFile: async (src, dest) => {
        copied.push(`${src} -> ${dest}`);
      },
    });

    expect(result.cover).toBe('/projects/voxel-tool/cover.png');
    expect(result.screenshots[0]?.src).toBe('/projects/voxel-tool/gallery/01.png');
    expect(copied).toHaveLength(2);
  });

  it('keeps site-absolute and external URLs untouched', async () => {
    const project = baseProject({
      cover: 'https://cdn.example.com/cover.png',
      playable: { type: 'iframe', entry: '/demos/voxel/index.html' },
    }) as never;
    const result = await processProjectAssets(project, {
      slug: 'voxel-tool',
      sourceDirAbs: join(root, 'data', 'projects', 'voxel-tool'),
      assetsOutDirAbs: null,
      urlBase: '/projects/voxel-tool',
    });
    expect(result.cover).toBe('https://cdn.example.com/cover.png');
    expect(result.playable?.entry).toBe('/demos/voxel/index.html');
  });

  it('throws a readable error for missing asset files', async () => {
    const project = baseProject({ cover: 'cover.png' }) as never;
    await expect(
      processProjectAssets(project, {
        slug: 'voxel-tool',
        sourceDirAbs: join(root, 'data', 'projects', 'voxel-tool'),
        assetsOutDirAbs: null,
        urlBase: '/projects/voxel-tool',
      }),
    ).rejects.toThrow(/Missing asset file "cover\.png"[\s\S]*voxel-tool/);
  });
});

describe('sourceDirOfProjectFile', () => {
  it('derives directories from provenance paths', () => {
    expect(sourceDirOfProjectFile('data/projects/voxel-tool/index.json')).toBe('data/projects/voxel-tool');
    expect(sourceDirOfProjectFile('data/projects/one-file.json')).toBe('data/projects');
    expect(sourceDirOfProjectFile('data/projects.json#3')).toBeNull();
  });
});

describe('buildSite integration', () => {
  it('copies colocated assets into dist and rewrites URLs', async () => {
    const dir = join(root, 'data', 'projects', 'voxel-tool');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'index.json'),
      JSON.stringify(baseProject({ cover: 'cover.png' })),
      'utf-8',
    );
    await writeFile(join(dir, 'cover.png'), 'PNGDATA', 'utf-8');
    const result = await buildSite(root, config);
    expect(await readFile(join(result.outDir, 'projects', 'voxel-tool', 'cover.png'), 'utf-8')).toBe(
      'PNGDATA',
    );
  });
});

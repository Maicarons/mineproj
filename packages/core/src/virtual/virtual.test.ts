import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';
import { mineprojConfigSchema } from '../config/schema';
import {
  RESOLVED_CONFIG_ID,
  RESOLVED_DATA_ID,
  RESOLVED_ROUTES_ID,
  VIRTUAL_CONFIG_ID,
  VIRTUAL_DATA_ID,
  VIRTUAL_ROUTES_ID,
  generateConfigModule,
  generateDataModule,
  generateRoutesModule,
  mineprojVirtualPlugin,
  type MineprojDataset,
  type RouteRecord,
} from './index';

const project: Project = projectSchema.parse({
  slug: 'voxel-tool',
  name: 'Voxel Tool',
  tagline: 'Tiny voxel editor',
  summary: 'A tiny voxel editor that runs entirely in the browser with zero install.',
  createdAt: '2026-01-15T00:00:00.000Z',
});

const dataset: MineprojDataset = {
  projects: [project],
  profile: { name: 'Mai' },
  tags: [{ name: 'web' }],
  collections: [],
};

const routes: RouteRecord[] = [
  { path: '/', layout: 'home', title: 'Home' },
  { path: '/projects/voxel-tool/', layout: 'detail', slug: 'voxel-tool' },
];

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'mineproj-virtual-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

/** Materialize generated module code and import it as a real ES module. */
async function importGenerated(code: string): Promise<Record<string, unknown>> {
  const file = join(dir, `mod-${Math.random().toString(36).slice(2)}.mjs`);
  await writeFile(file, code, 'utf-8');
  return import(pathToFileURL(file).href);
}

describe('code generation', () => {
  it('generates a config module equal to the resolved config', async () => {
    const config = mineprojConfigSchema.parse({ site: { title: 'My Site' } });
    const mod = await importGenerated(generateConfigModule(config));
    expect(mod.default).toEqual(config);
  });

  it('escapes quotes and closing tags inside string values', async () => {
    const config = mineprojConfigSchema.parse({
      site: { title: 'Weird "title" </script> ok' },
    });
    const mod = await importGenerated(generateConfigModule(config));
    expect((mod.default as { site: { title: string } }).site.title).toBe('Weird "title" </script> ok');
  });

  it('generates a data module with named exports and a default object', async () => {
    const mod = await importGenerated(generateDataModule(dataset));
    expect(mod.projects).toEqual([project]);
    expect(mod.profile).toEqual({ name: 'Mai' });
    expect(mod.tags).toEqual([{ name: 'web' }]);
    expect(mod.collections).toEqual([]);
    expect(mod.default).toEqual(dataset);
  });

  it('generates a routes module', async () => {
    const mod = await importGenerated(generateRoutesModule(routes));
    expect(mod.routes).toEqual(routes);
    expect(mod.default).toEqual(routes);
  });
});

describe('mineprojVirtualPlugin', () => {
  const plugin = mineprojVirtualPlugin({
    config: mineprojConfigSchema.parse({ site: { title: 'My Site' } }),
    data: dataset,
    routes,
  });

  it('maps virtual ids to resolved \\0-prefixed ids', () => {
    expect(plugin.resolveId(VIRTUAL_CONFIG_ID)).toBe(RESOLVED_CONFIG_ID);
    expect(plugin.resolveId(VIRTUAL_DATA_ID)).toBe(RESOLVED_DATA_ID);
    expect(plugin.resolveId(VIRTUAL_ROUTES_ID)).toBe(RESOLVED_ROUTES_ID);
    expect(plugin.resolveId('some/other/module.ts')).toBeNull();
  });

  it('loads generated code for resolved ids and null otherwise', () => {
    expect(plugin.load(RESOLVED_CONFIG_ID)).toContain('"My Site"');
    expect(plugin.load(RESOLVED_DATA_ID)).toContain('voxel-tool');
    expect(plugin.load(RESOLVED_ROUTES_ID)).toContain('/projects/voxel-tool/');
    expect(plugin.load('/real/file.js')).toBeNull();
  });

  it('keeps hook names aligned with Vite plugin contract', () => {
    expect(plugin.name).toBe('mineproj:virtual-modules');
    expect(plugin.enforce).toBe('pre');
    expect(typeof plugin.resolveId).toBe('function');
    expect(typeof plugin.load).toBe('function');
  });
});

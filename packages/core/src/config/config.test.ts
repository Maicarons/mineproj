import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineConfig } from './define';
import { ConfigNotFoundError, loadConfig } from './load';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'mineproj-config-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('loadConfig', () => {
  it('loads a .json config and merges defaults', async () => {
    const path = join(dir, 'mineproj.config.json');
    await writeFile(path, JSON.stringify({ site: { title: 'My Site' } }), 'utf-8');
    const { config } = await loadConfig(dir);
    expect(config.site.title).toBe('My Site');
    expect(config.site.defaultLocale).toBe('zh-CN');
    expect(config.dataDir).toBe('data');
    expect(config.outDir).toBe('dist');
    expect(config.publicDir).toBe('public');
    expect(config.theme).toBe('@mineproj/theme-classic');
    expect(config.plugins).toEqual([]);
  });

  it('loads a .mjs config with export default', async () => {
    await writeFile(
      join(dir, 'mineproj.config.mjs'),
      `export default { site: { title: 'MJS Site' }, outDir: 'out' }`,
      'utf-8',
    );
    const { config } = await loadConfig(dir);
    expect(config.site.title).toBe('MJS Site');
    expect(config.outDir).toBe('out');
  });

  it('loads a .ts config (transpiled via jiti)', async () => {
    await writeFile(
      join(dir, 'mineproj.config.ts'),
      `export default { site: { title: 'TS Site' } };`,
      'utf-8',
    );
    const { config } = await loadConfig(dir);
    expect(config.site.title).toBe('TS Site');
  });

  it('prefers explicit configPath over discovery order', async () => {
    await writeFile(join(dir, 'mineproj.config.json'), JSON.stringify({ site: { title: 'wrong' } }), 'utf-8');
    const custom = join(dir, 'custom.config.json');
    await writeFile(custom, JSON.stringify({ site: { title: 'right' } }), 'utf-8');
    const { path, config } = await loadConfig(dir, 'custom.config.json');
    expect(path.endsWith('custom.config.json')).toBe(true);
    expect(config.site.title).toBe('right');
  });

  it('reports the file and field path for invalid config values', async () => {
    const path = join(dir, 'mineproj.config.json');
    await writeFile(path, JSON.stringify({ site: { title: '' } }), 'utf-8');
    await expect(loadConfig(dir)).rejects.toThrow(/mineproj\.config\.json[\s\S]*site\.title/);
  });

  it('reports line and column for malformed JSON', async () => {
    const path = join(dir, 'mineproj.config.json');
    await writeFile(path, '{\n  "site": {\n    "title": broken\n  }\n}\n', 'utf-8');
    await expect(loadConfig(dir)).rejects.toThrow(/line 3/);
  });

  it('throws ConfigNotFoundError listing searched files when nothing exists', async () => {
    await expect(loadConfig(dir)).rejects.toThrow(ConfigNotFoundError);
    try {
      await loadConfig(dir);
    } catch (err) {
      expect((err as Error).message).toContain('mineproj.config.ts');
      expect((err as Error).message).toContain('mineproj.config.json');
    }
  });

  it('loads a config whose site block itself is defaulted-correct', async () => {
    await writeFile(
      join(dir, 'mineproj.config.ts'),
      `export default {
        site: { title: 'X', locales: ['zh-CN', 'en'] },
        theme: '@scope/theme-x',
      };`,
      'utf-8',
    );
    const { config } = await loadConfig(dir);
    expect(config.theme).toBe('@scope/theme-x');
    expect(config.site.locales).toEqual(['zh-CN', 'en']);
  });

  it('round-trips a config file written by a test helper', async () => {
    const user = defineConfig({ site: { title: 'Round' } });
    const path = join(dir, 'mineproj.config.json');
    await writeFile(path, JSON.stringify(user), 'utf-8');
    const content = await readFile(path, 'utf-8');
    expect(content).toContain('Round');
  });
});

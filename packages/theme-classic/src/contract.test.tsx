import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildSite, mineprojConfigSchema } from '@mineproj/core';
import { runThemeContract } from '@mineproj/test-utils';
import theme, { classicConfigSchema } from './index';
import { HomeLayout } from './layouts';
import { makeProps } from './layouts.test-utils';

describe('M3-15 theme contract', () => {
  it('passes the full theme contract with all seven layouts', () => {
    const result = runThemeContract(theme, { requireAllLayouts: true });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('validates themeConfig against the classic schema', () => {
    const parsed = classicConfigSchema.safeParse({});
    expect(parsed.success).toBe(true);
    expect(classicConfigSchema.safeParse({ radius: 'huge' }).success).toBe(false);
    expect(classicConfigSchema.parse({}).accent).toBe('#2563EB');
  });
});

describe('component snapshots', () => {
  it('home layout matches the recorded structure', () => {
    const html = renderToString(<HomeLayout {...makeProps()} />);
    expect(html).toMatchSnapshot();
  });
});

describe('pipeline themeConfig validation (M3-14)', () => {
  it('rejects invalid themeConfig with a readable error', async () => {
    const site = join(tmpdir(), `m3-config-${Date.now()}`);
    const fs = await import('node:fs/promises');
    await fs.mkdir(join(site, 'data', 'projects'), { recursive: true });
    await fs.writeFile(
      join(site, 'mineproj.config.json'),
      JSON.stringify({ site: { title: 'T' }, themeConfig: { radius: 'huge' } }),
      'utf-8',
    );
    const config = mineprojConfigSchema.parse({
      site: { title: 'T' },
      themeConfig: { radius: 'huge' },
    });
    try {
      await buildSite(site, config);
      throw new Error('should have thrown');
    } catch (err) {
      expect((err as Error).message).toContain('Invalid themeConfig');
    } finally {
      await rm(site, { recursive: true, force: true });
    }
  });

  it('applies schema defaults to themeConfig during build', async () => {
    const site = join(tmpdir(), `m3-site-ok-${Date.now()}`);
    const fs = await import('node:fs/promises');
    await fs.mkdir(join(site, 'data', 'projects'), { recursive: true });
    await fs.writeFile(
      join(site, 'mineproj.config.json'),
      JSON.stringify({ site: { title: 'T' } }),
      'utf-8',
    );
    const result = await buildSite(site, mineprojConfigSchema.parse({ site: { title: 'T' } }));
    expect(result.theme.name).toBe('@mineproj/theme-classic');
    const html = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    expect(html).toContain('T');
    await rm(site, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
});

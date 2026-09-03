import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mineprojConfigSchema, type ResolvedMineprojConfig } from './config/schema';
import { definePlugin } from './plugin/contract';
import { buildSite } from './pipeline';

let root: string;

const config: ResolvedMineprojConfig = mineprojConfigSchema.parse({
  site: { title: 'Pipeline Test', description: 'Full pipeline' },
});

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-pipe-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects'), { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function seedProjects(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    const slug = `project-${String(i).padStart(3, '0')}`;
    await mkdir(join(root, 'data', 'projects', slug), { recursive: true });
    await writeFile(
      join(root, 'data', 'projects', slug, 'index.json'),
      JSON.stringify({
        slug,
        name: `Project ${i}`,
        tagline: `Tagline ${i}`,
        summary: `Summary text for project number ${i}, long enough for schema validation.`,
        createdAt: '2026-01-15T00:00:00.000Z',
        tags: ['web'],
      }),
      'utf-8',
    );
  }
}

describe('buildSite pipeline', () => {
  it('renders 100 projects into complete HTML documents', async () => {
    await seedProjects(100);
    const result = await buildSite(root, config);
    // home + list + 100 details + 1 tag + about + 404
    expect(result.pages).toBe(105);
    const detail = await readFile(join(result.outDir, 'projects', 'project-042', 'index.html'), 'utf-8');
    expect(detail).toContain('<!doctype html>');
    expect(detail).toContain('Project 42');
    expect(detail).toContain('</html>');
    const home = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    expect(home).toContain('Pipeline Test');
    // Every visible project is linked from the list page.
    const list = await readFile(join(result.outDir, 'projects', 'index.html'), 'utf-8');
    expect(list).toContain('/projects/project-099/');
  });

  it('embeds serialized page state that survives script breakouts', async () => {
    await seedProjects(1);
    const result = await buildSite(root, config);
    const html = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    expect(html).toContain('id="__MP_DATA__"');
    expect(html).toContain('application/json');
    expect(html).not.toContain('</script>"');
  });

  it('fires every lifecycle hook in order and lets them contribute', async () => {
    await seedProjects(2);
    const calls: string[] = [];
    const plugin = definePlugin({
      name: 'mineproj-plugin-lifecycle',
      hooks: {
        'config:resolved': (value) => {
          calls.push('config:resolved');
          return value;
        },
        'data:loaded': () => {
          calls.push('data:loaded');
        },
        'data:validated': () => {
          calls.push('data:validated');
        },
        'routes:collect': (routes) => {
          calls.push('routes:collect');
          return [...(routes as { path: string }[]), { path: '/custom/', layout: 'about', title: 'Custom' }];
        },
        'api:endpoints': (endpoints) => {
          calls.push('api:endpoints');
          return [
            ...(endpoints as { path: string; body: unknown }[]),
            { path: 'hello.json', body: { message: 'hello from plugin' } },
          ];
        },
        'render:before': (html) => {
          calls.push('render:before');
          return (html as string).replace('</head>', '<meta name="plugin" content="ok"></head>');
        },
        'emit': () => {
          calls.push('emit');
        },
        'build:done': () => {
          calls.push('build:done');
        },
      },
    });
    const customConfig = mineprojConfigSchema.parse({
      site: { title: 'Pipeline Test' },
      plugins: [plugin],
    });
    const result = await buildSite(root, customConfig);
    // Each unique hook fires in plan order; render:before fires once per page.
    const firstIndex = (hook: string): number => calls.indexOf(hook);
    expect(calls.filter((c) => c === 'config:resolved')).toHaveLength(1);
    expect(firstIndex('config:resolved')).toBeLessThan(firstIndex('data:loaded'));
    expect(firstIndex('data:loaded')).toBeLessThan(firstIndex('data:validated'));
    expect(firstIndex('data:validated')).toBeLessThan(firstIndex('routes:collect'));
    expect(firstIndex('routes:collect')).toBeLessThan(firstIndex('api:endpoints'));
    expect(firstIndex('api:endpoints')).toBeLessThan(firstIndex('render:before'));
    expect(firstIndex('render:before')).toBeLessThan(firstIndex('emit'));
    expect(firstIndex('emit')).toBeLessThan(firstIndex('build:done'));
    // 7 core routes + 1 plugin route.
    expect(calls.filter((c) => c === 'render:before')).toHaveLength(8);
    // Plugin-added route rendered as HTML.
    const custom = await readFile(join(result.outDir, 'custom', 'index.html'), 'utf-8');
    expect(custom).toContain('Custom');
    // Plugin-added API endpoint emitted.
    const hello = JSON.parse(await readFile(join(result.outDir, 'api', 'v1', 'hello.json'), 'utf-8'));
    expect(hello.message).toBe('hello from plugin');
    // render:before injected the meta tag.
    const home = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    expect(home).toContain('<meta name="plugin" content="ok">');
  });

  it('uses the fallback layout with a warning for mini themes', async () => {
    await seedProjects(1);
    const warn = vi.fn();
    const miniTheme = {
      name: 'mini-theme',
      layouts: {
        home: () => {
          return null;
        },
      },
    };
    const originalWarn = console.warn;
    console.warn = warn;
    try {
      const result = await buildSite(root, config, { theme: miniTheme as never });
      // All pages still rendered through the fallback theme.
      expect(result.pages).toBe(6);
      expect(warn.mock.calls.some(([m]) => String(m).includes('mini-theme'))).toBe(true);
      const home = await readFile(join(result.outDir, 'index.html'), 'utf-8');
      expect(home).toContain('Pipeline Test');
    } finally {
      console.warn = originalWarn;
    }
  });
});

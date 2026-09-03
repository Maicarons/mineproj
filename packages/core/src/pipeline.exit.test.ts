import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mineprojConfigSchema } from './config/schema';
import { definePlugin } from './plugin/contract';
import { buildSite } from './pipeline';

/**
 * M2 exit criteria (plan §5):
 *  1. a ~30-line mini theme (only a `home` layout + a custom color) can take
 *     over the whole site with a one-line config change;
 *  2. a ~20-line plugin registers `dist/api/v1/hello.json` via `api:endpoints`;
 *  3. content pages ship 0 bytes of interactive JS.
 */

let root: string;

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-m2exit-${Math.random().toString(36).slice(2)}`);
  await mkdir(join(root, 'data', 'projects'), { recursive: true });
  await writeFile(
    join(root, 'mineproj.config.json'),
    JSON.stringify({ site: { title: 'Exit Criteria' } }),
    'utf-8',
  );
  await mkdir(join(root, 'data', 'projects', 'alpha'), { recursive: true });
  await writeFile(
    join(root, 'data', 'projects', 'alpha', 'index.json'),
    JSON.stringify({
      slug: 'alpha',
      name: 'Project Alpha',
      tagline: 't',
      summary: 'A summary for alpha, long enough for schema validation rules.',
      createdAt: '2026-01-01T00:00:00.000Z',
    }),
    'utf-8',
  );
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe('M2 exit criteria', () => {
  it('a mini local theme takes over the site with a one-line config change', async () => {
    // The ~30-line theme: .mineproj/theme/index.mts with only a `home` layout.
    await mkdir(join(root, '.mineproj', 'theme'), { recursive: true });
    await writeFile(
      join(root, '.mineproj', 'theme', 'index.mts'),
      `import { createElement as h } from 'react';
import { defineTheme } from '@mineproj/core';
const theme = defineTheme({
  name: 'my-mini-theme',
  layouts: {
    home: ({ config, data }) =>
      h('main', { style: { color: '#ff5500' } },
        h('h1', null, config.title),
        h('ul', null, data.projects.map((p) => h('li', { key: p.slug }, p.name)))),
  },
});
export default theme;
`,
      'utf-8',
    );
    // Make @mineproj/core resolvable from the temporary site.
    const coreDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
    await mkdir(join(root, 'node_modules', '@mineproj'), { recursive: true });
    await symlink(coreDir, join(root, 'node_modules', '@mineproj', 'core'), 'junction');
    const config = mineprojConfigSchema.parse({
      site: { title: 'Exit Criteria' },
      theme: '.mineproj/theme',
    });
    const result = await buildSite(root, config);
    expect(result.theme.name).toBe('my-mini-theme');
    // Home rendered by the mini theme, including the custom color.
    const home = await readFile(join(result.outDir, 'index.html'), 'utf-8');
    expect(home).toContain('#ff5500');
    expect(home).toContain('Project Alpha');
    // Detail page rendered through the theme-classic fallback.
    const detail = await readFile(join(result.outDir, 'projects', 'alpha', 'index.html'), 'utf-8');
    expect(detail).toContain('Project Alpha');
    expect(detail).toContain('2026-01-01');
  });

  it('a ~20-line plugin registers dist/api/v1/hello.json', async () => {
    const plugin = definePlugin({
      name: 'mineproj-plugin-hello',
      hooks: {
        'api:endpoints': (endpoints) => [
          ...(endpoints as { path: string; body: unknown }[]),
          { path: 'hello.json', body: { message: 'hello' } },
        ],
      },
    });
    const config = mineprojConfigSchema.parse({
      site: { title: 'Exit Criteria' },
      plugins: [plugin],
    });
    const result = await buildSite(root, config);
    const hello = JSON.parse(
      await readFile(join(result.outDir, 'api', 'v1', 'hello.json'), 'utf-8'),
    );
    expect(hello.message).toBe('hello');
  });

  it('content pages ship zero inline JS and only the island runtime', async () => {
    const result = await buildSite(root, mineprojConfigSchema.parse({ site: { title: 'Exit Criteria' } }));
    for (const page of ['projects/alpha/index.html', 'about/index.html']) {
      const html = await readFile(join(result.outDir, page), 'utf-8');
      // The only external script allowed is the islands runtime itself.
      const srcScripts = [...html.matchAll(/<script[^>]*src="([^"]*)"/g)].map((m) => m[1]);
      for (const src of srcScripts) {
        expect(src, `${page} unexpected script ${src}`).toBe('/@mp/islands.js');
      }
      // No inline executable scripts (state data is application/json).
      expect(html.match(/<script>/g), `${page} has inline scripts`).toBeNull();
      expect(html).toContain('type="application/json"');
    }
  });
});

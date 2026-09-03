import type { MineprojPlugin, Project } from '@mineproj/core';

/**
 * plugin-llms (M6-04): emits `llms.txt` (grouped link list with one-line
 * descriptions, text/plain), `llms-full.txt` (all project bodies inlined so
 * agents fetch once) and `AGENTS.md` (how to consume the static API).
 */

export interface LlmsOptions {
  siteTitle: string;
  siteDescription?: string;
}

export function buildLlmsTxt(
  siteTitle: string,
  projects: Project[],
  oneLine: (p: Project) => string,
): string {
  const lines: string[] = [`# ${siteTitle}`, ''];
  if (projects.length > 0) {
    lines.push('## Projects', '');
    for (const p of projects) {
      lines.push(`- [${p.name}](/projects/${p.slug}/): ${oneLine(p)}`);
    }
    lines.push('');
  }
  lines.push('## Data', '');
  lines.push('- [Projects API](/api/v1/projects.json): machine-readable project list');
  lines.push('- [API manifest](/api/v1/manifest.json): all endpoints and schema version');
  lines.push('');
  return lines.join('\n');
}

export function buildLlmsFull(projects: Project[]): string {
  const parts: string[] = [];
  for (const p of projects) {
    parts.push(`# ${p.name}`, '', p.summary, '');
    if (p.description) parts.push(p.description, '');
  }
  return parts.join('\n');
}

export function buildAgentsMd(): string {
  return [
    '# AGENTS.md',
    '',
    'This site is a mineproj static project library. Coding agents can consume:',
    '',
    '## Endpoints',
    '- `GET /api/v1/projects.json` — lite project list (slug, name, tagline, cover, tags, status, dates)',
    '- `GET /api/v1/projects/<slug>.json` — full record incl. rendered body HTML + markdown',
    '- `GET /api/v1/tags.json`, `/api/v1/categories.json`, `/api/v1/stats.json` — aggregations',
    '- `GET /api/v1/search.json` — MiniSearch index + documents',
    '- `GET /api/v1/manifest.json` — self-describing endpoint list',
    '',
    '## Conventions',
    '- All data is plain static JSON; no backend required.',
    '- Envelopes carry `apiVersion`, `kind`, `generatedAt`, `schemaVersion` and `data`.',
    '- Markdown mirrors of every page sit next to the HTML as `index.md`.',
    '',
  ].join('\n');
}

export function defineLlmsPlugin(options: LlmsOptions): MineprojPlugin {
  return {
    name: '@mineproj/plugin-llms',
    enforce: 'post',
    async hooks: {
      'emit': (ctx) => {
        const c = ctx as unknown as {
          config: { site: { title: string; description?: string } };
          dataset: { projects: Project[] };
        };
        const visible = c.dataset.projects.filter((p) => !p.hidden);
        await ctx.emit('llms.txt', buildLlmsTxt(c.config.site.title, visible, (p) => p.tagline));
        await ctx.emit('llms-full.txt', buildLlmsFull(visible));
        await ctx.emit('AGENTS.md', buildAgentsMd());
      },
    },
  };
}

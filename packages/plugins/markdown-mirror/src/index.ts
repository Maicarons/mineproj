import type { MineprojPlugin, Project } from '@mineproj/core';

/**
 * plugin-markdown-mirror (M6-05): every rendered page gets a sibling
 * `index.md` with de-noised content (title, summary, body markdown — no
 * nav/footer) and the HTML gains `<link rel="alternate" type="text/markdown">`.
 * The `md-mirror:before` waterfall lets plugins rewrite the markdown.
 */

export interface MirrorPage {
  path: string;
  title?: string;
  project?: Project;
  /** Body markdown produced by the pipeline (default-locale source). */
  markdown?: string;
}

export function mirrorMarkdown(page: MirrorPage): string {
  const lines: string[] = [];
  if (page.title) lines.push(`# ${page.title}`, '');
  if (page.project) {
    lines.push(`**${page.project.name}** — ${page.project.tagline}`, '');
    lines.push(page.project.summary, '');
    for (const tag of page.project.tags) lines.push(`[#${tag}](/tags/${tag}/) `);
    lines.push('', `Created: ${page.project.createdAt.slice(0, 10)}`, '');
  }
  if (page.markdown) lines.push('---', '', page.markdown, '');
  return lines.join('\n');
}

export function defineMarkdownMirrorPlugin(
  options: { beforeMirror?: (markdown: string, page: MirrorPage) => string } = {},
): MineprojPlugin {
  return {
    name: '@mineproj/plugin-markdown-mirror',
    enforce: 'post',
    hooks: {
      'render:before': (html, ctx) => {
        const route = (ctx as { route?: { path: string } }).route;
        if (!route) return html;
        const link = `<link rel="alternate" type="text/markdown" href="${route.path}index.md">`;
        return (html as string).replace('</head>', `${link}\n</head>`);
      },
      'emit': async (_value, ctx) => {
        const c = ctx as unknown as {
          dataset: { projects: Project[] };
          routes?: { path: string; title?: string; slug?: string; locale?: string }[];
          emit: (path: string, content: string) => Promise<void>;
          config: { site: { locales: string[]; defaultLocale: string } };
        };
        for (const route of c.routes ?? []) {
          const project = route.slug ? c.dataset.projects.find((p) => p.slug === route.slug) : undefined;
          const prefix = route.locale && route.locale !== c.config.site.defaultLocale ? `/${route.locale}` : '';
          const mirror: MirrorPage = { path: route.path, title: route.title, project, markdown: project?.description };
          let markdown = mirrorMarkdown(mirror);
          if (options.beforeMirror) markdown = options.beforeMirror(markdown, mirror);
          await ctx.emit(`${prefix}${route.path}index.md`.replace(/^\//, ''), markdown);
        }
      },
    },
  };
}

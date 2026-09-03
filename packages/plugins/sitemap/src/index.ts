import type { MineprojPlugin, RouteRecord, Project } from '@mineproj/core';

/**
 * plugin-sitemap (M6-03): emits `sitemap.xml` with lastmod + hreflang
 * alternates (+ image extension) and a human/AI-friendly `sitemap.md`
 * mirroring the site hierarchy. Covers the per-locale URL sets (M5-07).
 */

export interface SitemapOptions {
  siteUrl: string;
  /** Exclude paths matching these prefixes. */
  exclude?: string[];
}

function xmlEscape(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function buildSitemapXml(
  siteUrl: string,
  routes: RouteRecord[],
  projects: Project[],
  locales: string[],
  defaultLocale: string,
  prefixAll: boolean,
): string {
  const base = siteUrl.replace(/\/+$/, '');
  const entries: string[] = [];
  const seen = new Set<string>();
  for (const route of routes) {
    if (seen.has(route.path)) continue;
    seen.add(route.path);
    if (route.layout === 'notFound') continue;
    const project = route.slug ? projects.find((p) => p.slug === route.slug) : undefined;
    const lastmod = (project?.updatedAt ?? project?.createdAt ?? '').slice(0, 10);
    const alternates = locales
      .map((locale) => {
        const isDefault = locale === defaultLocale;
        const loc = !isDefault || prefixAll ? `/${locale}${route.path === '/' ? '/' : route.path}` : route.path;
        return `<xhtml:link rel="alternate" hreflang="${locale}" href="${base}${xmlEscape(loc)}"/>`;
      })
      .join('');
    entries.push(
      [
        '  <url>',
        `    <loc>${base}${xmlEscape(route.path)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
        alternates,
        project?.cover
          ? `    <image:image><image:loc>${base}${xmlEscape(project.cover)}</image:loc></image:image>`
          : '',
        '  </url>',
      ]
        .filter((line) => line !== '')
        .join('\n'),
    );
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildSitemapMd(routes: RouteRecord[]): string {
  const byLayout = new Map<string, RouteRecord[]>();
  for (const route of routes) {
    const list = byLayout.get(route.layout) ?? [];
    list.push(route);
    byLayout.set(route.layout, list);
  }
  const lines: string[] = ['# Sitemap', ''];
  for (const [layout, list] of byLayout) {
    lines.push(`## ${layout}`);
    lines.push('');
    for (const route of list) {
      lines.push(`- [${route.title ?? route.path}](${route.path})`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function defineSitemapPlugin(options: SitemapOptions): MineprojPlugin {
  return {
    name: '@mineproj/plugin-sitemap',
    enforce: 'post',
    async hooks: {
      'emit': (ctx) => {
        const c = ctx as unknown as {
          config: { site: { url?: string; locales: string[]; defaultLocale: string; prefixAll: boolean } };
          dataset: { projects: Project[] };
          routes: RouteRecord[];
          root: string;
        };
        const siteUrl = options.siteUrl ?? c.config.site.url ?? '';
        const exclude = options.exclude ?? [];
        const routes = c.routes.filter((r) => !exclude.some((p) => r.path.startsWith(p)));
        const xml = buildSitemapXml(
          siteUrl,
          routes,
          c.dataset.projects,
          c.config.site.locales,
          c.config.site.defaultLocale,
          c.config.site.prefixAll,
        );
        const md = buildSitemapMd(routes);
        await ctx.emit('sitemap.xml', xml);
        await ctx.emit('sitemap.md', md);
      },
    },
  };
}

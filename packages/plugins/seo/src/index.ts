/**
 * plugin-seo (M6-01 + M6-02): per-page meta (title, description, canonical,
 * OG, Twitter), html lang / noindex support and JSON-LD structured data
 * (Person, WebSite+SearchAction, CollectionPage, ItemList,
 * SoftwareSourceCode, SoftwareApplication, CreativeWork, BreadcrumbList,
 * FAQPage) with XSS-safe serialization.
 *
 * Field priority: project.seo overrides > project fields > site defaults.
 */
import type { MineprojPlugin, RouteRecord, Project } from '@mineproj/core';

export interface SeoOptions {
  siteUrl: string;
  siteTitle: string;
  siteDescription?: string;
  twitter?: string;
  defaultLocale?: string;
  locales?: string[];
  defaultLocalePrefixAll?: boolean;
}

/** Escape text for embedding inside JSON-LD script payloads. */
export function escapeJsonLd(value: string): string {
  return value
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('<!--', '\\u003c!--');
}

export function jsonLdScript(objects: Record<string, unknown>[]): string {
  const payload = JSON.stringify(objects.length === 1 ? objects[0] : objects)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
  return `<script type="application/ld+json">${payload}</script>`;
}

function projectUrl(siteUrl: string, route: RouteRecord): string {
  const clean = siteUrl.replace(/\/+$/, '');
  return `${clean}${route.path}`;
}

export function buildMetaTags(options: SeoOptions, route: RouteRecord, project: Project | undefined): string {
  const locale = route.locale ?? options.defaultLocale ?? 'zh-CN';
  const title = route.title
    ? route.title !== options.siteTitle
      ? `${route.title} · ${options.siteTitle}`
      : options.siteTitle
    : options.siteTitle;
  const description =
    project?.seo?.description ?? project?.summary ?? options.siteDescription ?? '';
  const canonical = options.siteUrl ? projectUrl(options.siteUrl, route) : route.path;
  const ogImage = project?.seo?.ogImage ?? project?.cover;
  const tags: string[] = [
    `<title>${title}</title>`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:locale" content="${locale}">`,
  ];
  if (description) tags.push(`<meta name="description" content="${description}">`, `<meta property="og:description" content="${description}">`);
  if (ogImage) tags.push(`<meta property="og:image" content="${ogImage}">`, `<meta name="twitter:image" content="${ogImage}">`);
  if (options.twitter) tags.push(`<meta name="twitter:site" content="${options.twitter}">`);
  if (project?.seo?.noindex) tags.push(`<meta name="robots" content="noindex">`);
  for (const alt of route.alternates ?? []) {
    tags.push(`<link rel="alternate" hreflang="${alt.locale}" href="${options.siteUrl.replace(/\/+$/, '')}${alt.href}">`);
  }
  return tags.join('\n');
}

export function buildJsonLd(
  options: SeoOptions,
  route: RouteRecord,
  project: Project | undefined,
  extras: { profileName?: string; profileUrl?: string } = {},
): string {
  const siteUrl = options.siteUrl.replace(/\/+$/, '');
  const objects: Record<string, unknown>[] = [];
  const personId = `${siteUrl}/#person`;

  if (route.layout === 'home') {
    objects.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': personId,
      name: extras.profileName ?? options.siteTitle,
      url: siteUrl,
    });
    objects.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: options.siteTitle,
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/projects/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
    objects.push({ '@context': 'https://schema.org', '@type': 'CollectionPage', url: `${siteUrl}/`, name: options.siteTitle });
  }

  if (route.layout === 'list' || route.layout === 'tag') {
    objects.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      url: projectUrl(siteUrl, route),
      name: route.title ?? options.siteTitle,
    });
  }

  if (route.layout === 'detail' && project) {
    objects.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: project.name,
      description: project.summary,
      codeRepository: project.links.find((l) => l.type === 'repo')?.url,
      license: project.license,
      dateCreated: project.createdAt,
      programmingLanguage: project.techStack,
      author: { '@id': personId },
    });
    objects.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: project.name,
      applicationCategory: project.category ?? 'WebApplication',
      operatingSystem: project.platforms.join(', '),
      softwareVersion: project.changelog[0]?.version,
      author: { '@id': personId },
    });
    objects.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: options.siteTitle, item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${siteUrl}/projects/` },
        { '@type': 'ListItem', position: 3, name: project.name, item: projectUrl(siteUrl, route) },
      ],
    });
    if (project.faq.length > 0) {
      objects.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: project.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }
  }

  return objects.length > 0 ? jsonLdScript(objects) : '';
}

/** Canonical plugin factory. */
export function defineSeoPlugin(options: SeoOptions): MineprojPlugin {
  return {
    name: '@mineproj/plugin-seo',
    enforce: 'post',
    hooks: {
      'render:before': (html, ctx) => {
        const route = (ctx as { route?: RouteRecord }).route;
        if (!route) return html;
        const project = route.slug
          ? (ctx as { dataset?: { projects: Project[] } }).dataset?.projects.find((p) => p.slug === route.slug)
          : undefined;
        const profile = (ctx as { dataset?: { profile: { name?: string; url?: string } | null } }).dataset?.profile ?? undefined;
        const meta = buildMetaTags(options, route, project);
        const ld = buildJsonLd(options, route, project, {
          profileName: profile?.name,
          profileUrl: profile?.url,
        });
        let out = html.replace('<head>', `<head>\n${meta}${ld ? `\n${ld}` : ''}`);
        // html lang comes from the pipeline document; nothing to do here.
        return out;
      },
    },
  };
}

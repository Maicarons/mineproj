import type { Project } from '@mineproj/core';

/** plugin-feed (M6-08): RSS 2.0 + Atom + JSON Feed builders. */

export interface FeedItem {
  slug: string;
  name: string;
  summary: string;
  createdAt: string;
  updatedAt?: string;
}

export function buildRss(siteTitle: string, siteUrl: string, items: FeedItem[]): string {
  const esc = (t: string): string => t.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const base = siteUrl.replace(/\/+$/, '');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"><channel>',
    `<title>${esc(siteTitle)}</title>`,
    `<link>${base}</link>`,
    `<description>${esc(siteTitle)}</description>`,
    ...items.map((i) => `<item><title>${esc(i.name)}</title><link>${base}/projects/${i.slug}/</link><description>${esc(i.summary)}</description><pubDate>${new Date(i.createdAt).toUTCString()}</pubDate></item>`),
    '</channel></rss>',
    '',
  ].join('\n');
}

export function buildAtom(siteTitle: string, siteUrl: string, items: FeedItem[]): string {
  const esc = (t: string): string => t.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const base = siteUrl.replace(/\/+$/, '');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `<title>${esc(siteTitle)}</title>`,
    `<link href="${base}"/>`,
    `<updated>${items[0]?.updatedAt ?? items[0]?.createdAt ?? new Date().toISOString()}</updated>`,
    `<id>${base}</id>`,
    ...items.map((i) => `<entry><title>${esc(i.name)}</title><link href="${base}/projects/${i.slug}/"/><id>${base}/projects/${i.slug}/</id><summary>${esc(i.summary)}</summary></entry>`),
    '</feed>',
    '',
  ].join('\n');
}

export function feedItemsOf(projects: Project[]): FeedItem[] {
  return projects
    .filter((p) => !p.hidden)
    .map((p) => ({ slug: p.slug, name: p.name, summary: p.summary, createdAt: p.createdAt, updatedAt: p.updatedAt }));
}

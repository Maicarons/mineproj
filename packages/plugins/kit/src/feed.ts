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

/** JSON Feed format (M6-08): https://www.jsonfeed.org/version/1.1/ */
export function buildJsonFeed(siteTitle: string, siteUrl: string, items: FeedItem[]): string {
  const base = siteUrl.replace(/\/+$/, '');
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: siteTitle,
    home_page_url: base,
    feed_url: `${base}/feed.json`,
    items: items.map((i) => ({
      id: `${base}/projects/${i.slug}/`,
      url: `${base}/projects/${i.slug}/`,
      title: i.name,
      summary: i.summary,
      date_published: i.createdAt,
      date_modified: i.updatedAt ?? i.createdAt,
    })),
  };
  return JSON.stringify(feed, null, 2) + '\n';
}

export function feedItemsOf(projects: Project[]): FeedItem[] {
  return projects
    .filter((p) => !p.hidden)
    .map((p) => ({ slug: p.slug, name: p.name, summary: p.summary, createdAt: p.createdAt, updatedAt: p.updatedAt }));
}

/** Define a feed plugin that emits RSS, Atom, and JSON Feed files. */
import type { MineprojPlugin, Project } from '@mineproj/core';

export interface FeedPluginOptions {
  siteTitle: string;
  siteUrl: string;
}

export function defineFeedPlugin(options: FeedPluginOptions): MineprojPlugin {
  return {
    name: '@mineproj/plugin-feed',
    enforce: 'post',
    hooks: {
      'emit': async (_value, ctx) => {
        const c = ctx as unknown as {
          dataset: { projects: Project[] };
          emit: (path: string, content: string) => Promise<void>;
        };
        const items = feedItemsOf(c.dataset.projects);
        await ctx.emit('feed.xml', buildRss(options.siteTitle, options.siteUrl, items));
        await ctx.emit('feed.atom', buildAtom(options.siteTitle, options.siteUrl, items));
        await ctx.emit('feed.json', buildJsonFeed(options.siteTitle, options.siteUrl, items));
      },
    },
  };
}

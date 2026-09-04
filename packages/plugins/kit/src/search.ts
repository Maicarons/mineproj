import MiniSearch from 'minisearch';
import type { Project } from '@mineproj/core';

/**
 * plugin-search (M6-07): sharded MiniSearch index — one shard per locale and
 * first letter bucket, so browsers only download the shard they query.
 */

export interface SearchShard {
  path: string;
  body: Record<string, unknown>;
}

export function buildSearchShards(
  projects: Project[],
  locales: string[],
  _defaultLocale: string,
): SearchShard[] {
  const shards: SearchShard[] = [];
  for (const locale of locales) {
    const docs = projects
      .filter((p) => !p.hidden)
      .map((p) => ({
        id: p.slug,
        name: p.i18n[locale]?.name ?? p.name,
        tagline: p.i18n[locale]?.tagline ?? p.tagline,
        summary: p.summary,
        tags: p.tags.join(' '),
      }));
    const buckets = new Map<string, typeof docs>();
    for (const doc of docs) {
      const letter = (doc.name[0] ?? '#').toUpperCase().replace(/[^A-Z0-9]/, '#') || '#';
      const key = letter;
      const list = buckets.get(key) ?? [];
      list.push(doc);
      buckets.set(key, list);
    }
    for (const [letter, bucketDocs] of buckets) {
      const index = new MiniSearch({
        fields: ['name', 'tagline', 'summary', 'tags'],
        storeFields: ['id'],
      });
      index.addAll(bucketDocs);
      shards.push({
        path: `search/${locale}/${letter}.json`,
        body: { locale, letter, index: index.toJSON(), documents: bucketDocs },
      });
    }
  }
  return shards;
}

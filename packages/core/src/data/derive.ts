import type { Project, Tag } from '@mineproj/schema';
import type { Dataset } from './loader';

/**
 * Derived data (M1-06): tag/category aggregations with counts, the creation
 * timeline and site-wide statistics feeding the `/api/v1` endpoints.
 */

export interface TagCount {
  name: string;
  count: number;
  color?: string;
  description?: string;
  group?: string;
}

/** Tag aggregation with counts, enriched from the tag dictionary. Empty tags never appear. */
export function deriveTags(projects: Project[], dictionary: Tag[] = []): TagCount[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    const seen = new Set<string>();
    for (const tag of project.tags) {
      if (seen.has(tag)) continue;
      seen.add(tag);
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const dict = new Map(dictionary.map((t) => [t.name, t]));
  return [...counts.entries()]
    .map(([name, count]) => {
      const meta = dict.get(name);
      return {
        name,
        count,
        color: meta?.color,
        description: meta?.description,
        group: meta?.group,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Category aggregation with counts, sorted by count desc then name. */
export function deriveCategories(projects: Project[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    if (!project.category) continue;
    counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export interface TimelineEntry {
  year: number;
  count: number;
}

/** Projects grouped by creation year, newest first. */
export function deriveTimeline(projects: Project[]): TimelineEntry[] {
  const counts = new Map<number, number>();
  for (const project of projects) {
    const year = Number(project.createdAt.slice(0, 4));
    if (!Number.isInteger(year)) continue;
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year);
}

export interface PlatformCount {
  name: string;
  count: number;
}

export function derivePlatforms(projects: Project[]): PlatformCount[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const platform of project.platforms) {
      counts.set(platform, (counts.get(platform) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export interface SiteStats {
  total: number;
  byStatus: Record<string, number>;
  featured: number;
  playable: number;
  openSource: number;
  platforms: PlatformCount[];
  timeline: TimelineEntry[];
}

export function deriveStats(projects: Project[]): SiteStats {
  const byStatus: Record<string, number> = {};
  for (const project of projects) {
    byStatus[project.status] = (byStatus[project.status] ?? 0) + 1;
  }
  return {
    total: projects.length,
    byStatus,
    featured: projects.filter((p) => p.featured).length,
    playable: projects.filter((p) => p.playable && p.playable.type !== 'none').length,
    openSource: projects.filter((p) => p.license !== undefined).length,
    platforms: derivePlatforms(projects),
    timeline: deriveTimeline(projects),
  };
}

/** Bundle every derived view of a dataset. */
export function deriveDatasetViews(dataset: Dataset) {
  return {
    tags: deriveTags(dataset.projects, dataset.tags),
    categories: deriveCategories(dataset.projects),
    stats: deriveStats(dataset.projects),
    timeline: deriveTimeline(dataset.projects),
  };
}

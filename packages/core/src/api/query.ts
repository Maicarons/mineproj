import type { Project } from '@mineproj/schema';

/**
 * Query engine (M1-09): filtering, multi-tag AND-OR, sorting, pagination,
 * field projection and facet computation — shared by the dev middleware and
 * any client-side filtering.
 */

export type TagMode = 'and' | 'or';

export interface QuerySpec {
  q?: string;
  tags: string[];
  tagMode: TagMode;
  category?: string;
  status?: string;
  platforms: string[];
  playable?: boolean;
  /** `<field>:<asc|desc>`, e.g. `createdAt:desc`. */
  sort: string;
  page: number;
  pageSize: number;
  fields?: string[];
}

export interface Facets {
  tags: Record<string, number>;
  status: Record<string, number>;
  categories: Record<string, number>;
}

export interface QueryResult {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: Facets;
}

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;
const DEFAULT_SORT = 'createdAt:desc';

const SORTS: Record<string, (a: Project, b: Project) => number> = {
  'createdAt:desc': (a, b) => b.createdAt.localeCompare(a.createdAt),
  'createdAt:asc': (a, b) => a.createdAt.localeCompare(b.createdAt),
  'updatedAt:desc': (a, b) =>
    (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
  'name:asc': (a, b) => a.name.localeCompare(b.name),
  'name:desc': (a, b) => b.name.localeCompare(a.name),
  'weight:desc': (a, b) => b.weight - a.weight || b.createdAt.localeCompare(a.createdAt),
};

/** Fields allowed in `fields=` projections (the "lite" API shape). */
const PROJECTABLE_FIELDS = new Set([
  'slug',
  'name',
  'tagline',
  'summary',
  'cover',
  'category',
  'tags',
  'status',
  'platforms',
  'createdAt',
  'updatedAt',
  'featured',
  'weight',
  'playable',
  'license',
]);

export function parseQuery(searchParams: URLSearchParams): QuerySpec {
  const list = (key: string): string[] => {
    const values = searchParams.getAll(key).flatMap((v) => v.split(','));
    return values.map((v) => v.trim()).filter((v) => v.length > 0);
  };
  const num = (key: string, fallback: number, min: number, max: number): number => {
    const raw = searchParams.get(key);
    if (raw === null || raw === '') return fallback;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < min || n > max) return fallback;
    return n;
  };
  const flag = (key: string): boolean | undefined => {
    const raw = searchParams.get(key);
    if (raw === null || raw === '') return undefined;
    return raw === 'true' || raw === '1';
  };

  const tags = list('tag');
  const sortRaw = searchParams.get('sort') ?? '';
  const fields = list('fields').filter((f) => PROJECTABLE_FIELDS.has(f));
  const tagModeRaw = searchParams.get('tagMode');
  const playable = flag('playable');

  return {
    q: searchParams.get('q') ?? undefined,
    tags,
    tagMode: tagModeRaw === 'and' ? 'and' : 'or',
    category: searchParams.get('category') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    platforms: list('platform'),
    playable,
    // Invalid/unknown sort strings fall back to the default.
    sort: SORTS[sortRaw] !== undefined ? sortRaw : DEFAULT_SORT,
    page: num('page', 1, 1, Number.MAX_SAFE_INTEGER),
    pageSize: num('pageSize', DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE),
    fields: fields.length > 0 ? fields : undefined,
  };
}

function matchesQuery(project: Project, spec: QuerySpec): boolean {
  if (spec.category !== undefined && project.category !== spec.category) return false;
  if (spec.status !== undefined && project.status !== spec.status) return false;
  if (spec.playable !== undefined) {
    const isPlayable = project.playable !== undefined && project.playable.type !== 'none';
    if (spec.playable !== isPlayable) return false;
  }
  if (spec.platforms.length > 0 && !spec.platforms.some((p) => project.platforms.includes(p as never))) {
    return false;
  }
  if (spec.tags.length > 0) {
    const has = (t: string): boolean => project.tags.includes(t);
    const ok = spec.tagMode === 'and' ? spec.tags.every(has) : spec.tags.some(has);
    if (!ok) return false;
  }
  if (spec.q !== undefined && spec.q.length > 0) {
    const needle = spec.q.toLowerCase();
    const haystack = [project.name, project.tagline, project.summary, project.tags.join(' ')]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function computeFacets(projects: Project[]): Facets {
  const facets: Facets = { tags: {}, status: {}, categories: {} };
  for (const project of projects) {
    facets.status[project.status] = (facets.status[project.status] ?? 0) + 1;
    if (project.category) {
      facets.categories[project.category] = (facets.categories[project.category] ?? 0) + 1;
    }
    const seen = new Set<string>();
    for (const tag of project.tags) {
      if (seen.has(tag)) continue;
      seen.add(tag);
      facets.tags[tag] = (facets.tags[tag] ?? 0) + 1;
    }
  }
  return facets;
}

/** Fields allowed to appear in a projected (lite) project object. */
export function projectFields(project: Project, fields: string[] | undefined): Project {
  if (fields === undefined) return project;
  const projected: Record<string, unknown> = {};
  for (const field of fields) {
    if (PROJECTABLE_FIELDS.has(field)) {
      projected[field] = (project as unknown as Record<string, unknown>)[field];
    }
  }
  return projected as Project;
}

export function applyQuery(projects: Project[], spec: QuerySpec): QueryResult {
  const filtered = projects.filter((p) => matchesQuery(p, spec));
  const sortFn = SORTS[spec.sort] ?? SORTS[DEFAULT_SORT]!;
  const sorted = [...filtered].sort(sortFn);
  const facets = computeFacets(filtered);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / spec.pageSize));
  const start = (spec.page - 1) * spec.pageSize;
  const items = sorted.slice(start, start + spec.pageSize).map((p) => projectFields(p, spec.fields));

  return { items, total, page: spec.page, pageSize: spec.pageSize, totalPages, facets };
}

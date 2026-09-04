import type { Project } from '@mineproj/schema';

/**
 * Filtering / sorting logic (M3-05 + M3-10) as pure functions so the island
 * component and tests share one implementation. Mirrors the core query
 * engine semantics for the client side.
 */

export type SortKey = 'newest' | 'oldest' | 'name' | 'updated';

export interface FilterState {
  q: string;
  categories: string[];
  tags: string[];
  status: string[];
  platforms: string[];
  years: string[];
  playable: boolean | null; // null = all, true = playable, false = not playable
  excludeArchived: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  q: '',
  categories: [],
  tags: [],
  status: [],
  platforms: [],
  years: [],
  playable: null,
  excludeArchived: true,
  sort: 'newest',
};

export function applyFilters(projects: Project[], state: FilterState): Project[] {
  const q = state.q.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    if (state.excludeArchived && p.status === 'archived') return false;
    if (state.categories.length > 0 && (p.category === undefined || !state.categories.includes(p.category))) {
      return false;
    }
    if (state.tags.length > 0 && !state.tags.every((t) => p.tags.includes(t))) return false;
    if (state.status.length > 0 && !state.status.includes(p.status)) return false;
    if (state.platforms.length > 0 && !state.platforms.some((pl) => p.platforms.includes(pl))) return false;
    if (state.years.length > 0) {
      const year = p.createdAt?.slice(0, 4);
      if (!year || !state.years.includes(year)) return false;
    }
    if (state.playable === true && !p.playable) return false;
    if (state.playable === false && p.playable) return false;
    if (q.length > 0) {
      const haystack = [p.name, p.tagline, p.summary, p.tags.join(' ')].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (state.sort) {
    case 'oldest':
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'updated':
      sorted.sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt));
      break;
    default:
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return sorted;
}

/** Serialize state to URL query params; omits defaults so URLs stay clean. */
export function stateToQuery(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.categories.length > 0) params.set('category', state.categories.join(','));
  if (state.tags.length > 0) params.set('tag', state.tags.join(','));
  if (state.status.length > 0) params.set('status', state.status.join(','));
  if (state.platforms.length > 0) params.set('platform', state.platforms.join(','));
  if (state.years.length > 0) params.set('year', state.years.join(','));
  if (state.playable === true) params.set('playable', '1');
  else if (state.playable === false) params.set('playable', '0');
  if (!state.excludeArchived) params.set('archived', '1');
  if (state.sort !== DEFAULT_FILTER_STATE.sort) params.set('sort', state.sort);
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
}

export function queryToState(search: string, base: FilterState = DEFAULT_FILTER_STATE): FilterState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const list = (key: string): string[] => {
    const raw = params.getAll(key).join(',');
    return raw
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  };
  const playableRaw = params.get('playable');
  const playable = playableRaw === '1' ? true : playableRaw === '0' ? false : null;
  return {
    q: params.get('q') ?? base.q,
    categories: list('category'),
    tags: list('tag'),
    status: list('status'),
    platforms: list('platform'),
    years: list('year'),
    playable,
    excludeArchived: params.get('archived') !== '1',
    sort: (['newest', 'oldest', 'name', 'updated'] as const).includes(params.get('sort') as never)
      ? (params.get('sort') as SortKey)
      : base.sort,
  };
}

export function toggleInArray(array: string[], value: string): string[] {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value];
}

/** Facet options derived from the visible project set. */
export function deriveFacets(projects: Project[]): {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  statuses: { name: string; count: number }[];
  platforms: { name: string; count: number }[];
  years: { name: string; count: number }[];
} {
  const count = (values: (string | undefined)[]): { name: string; count: number }[] => {
    const map = new Map<string, number>();
    for (const value of values) {
      if (!value) continue;
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return [...map.entries()].map(({name, count}) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };
  return {
    categories: count(projects.map((p) => p.category)),
    tags: count(projects.flatMap((p) => p.tags)),
    statuses: count(projects.map((p) => p.status)),
    platforms: count(projects.flatMap((p) => p.platforms)),
    years: count(projects.map((p) => p.createdAt?.slice(0, 4))),
  };
}

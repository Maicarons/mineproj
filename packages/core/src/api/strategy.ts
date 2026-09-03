import { envelope, LITE_FIELDS, type ApiContext, type ApiEndpoint } from './endpoints';
import { projectFields } from './query';
import { applyQuery, parseQuery } from './query';
import type { Project } from '@mineproj/schema';

/**
 * Query strategies (M1-12):
 *  - `client`  — the full list is on disk; filtering happens client-side.
 *  - `hybrid`  — hot combos (first pages + per-tag first pages) are
 *                pregenerated in addition to the full list.
 *  - `static`  — only pregenerated combos exist; misses are hard errors.
 */

export interface HotVariant {
  /** Canonical query string identifying the combo, e.g. `tag=web&page=1`. */
  queryString: string;
  /** Variant file path below the API root. */
  path: string;
}

function toLite(project: Project): Project {
  return projectFields(project, [...LITE_FIELDS]);
}

/** Compute the hot combos for a dataset. */
export function computeHotVariants(
  projects: Project[],
  pageSize: number,
  pregeneratedPages: number,
): HotVariant[] {
  const visible = projects.filter((p) => !p.hidden);
  const variants: HotVariant[] = [];
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  for (let page = 1; page <= Math.min(pregeneratedPages, totalPages); page++) {
    variants.push({
      queryString: `page=${page}&pageSize=${pageSize}`,
      path: `variants/page-${page}.json`,
    });
  }
  const tags = new Set<string>();
  for (const project of visible) {
    for (const tag of project.tags) tags.add(tag);
  }
  for (const tag of [...tags].sort()) {
    variants.push({
      queryString: `tag=${tag}&page=1&pageSize=${pageSize}`,
      path: `variants/tag-${tag}.json`,
    });
  }
  return variants;
}

/** Build the variant endpoint files (hybrid and static modes). */
export function generateVariantEndpoints(ctx: ApiContext): ApiEndpoint[] {
  const { api } = ctx.config;
  const variants = computeHotVariants(ctx.dataset.projects, api.pageSize, api.pregeneratedPages);
  const now = ctx.now ?? new Date().toISOString();
  const endpoints: ApiEndpoint[] = [];
  const manifest: Record<string, string> = {};

  for (const variant of variants) {
    const spec = parseQuery(new URLSearchParams(variant.queryString));
    const result = applyQuery(ctx.dataset.projects, spec);
    manifest[variant.queryString] = variant.path;
    endpoints.push({
      path: variant.path,
      body: envelope('ProjectList', result.items.map(toLite), now, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        facets: result.facets,
      }),
    });
  }

  endpoints.push({
    path: 'variants/manifest.json',
    body: envelope('VariantManifest', manifest, now),
  });
  return endpoints;
}

/** Normalize a searchParams object into the canonical variant key. */
export function canonicalQueryString(searchParams: URLSearchParams): string {
  const spec = parseQuery(searchParams);
  const params = new URLSearchParams();
  if (spec.q !== undefined) params.set('q', spec.q);
  if (spec.tags.length > 0) params.set('tag', spec.tags.join(','));
  if (spec.tagMode !== 'or') params.set('tagMode', spec.tagMode);
  if (spec.category !== undefined) params.set('category', spec.category);
  if (spec.status !== undefined) params.set('status', spec.status);
  if (spec.platforms.length > 0) params.set('platform', spec.platforms.join(','));
  if (spec.playable !== undefined) params.set('playable', String(spec.playable));
  if (spec.sort !== 'createdAt:desc') params.set('sort', spec.sort);
  params.set('page', String(spec.page));
  params.set('pageSize', String(spec.pageSize));
  return params.toString();
}

/** True when a `projects` request can be served from a pregenerated combo. */
export function isPregeneratedCombo(
  variants: HotVariant[],
  searchParams: URLSearchParams,
): boolean {
  const canonical = canonicalQueryString(searchParams);
  return variants.some((v) => v.queryString === canonical);
}

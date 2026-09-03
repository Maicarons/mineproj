import MiniSearch from 'minisearch';
import { SCHEMA_VERSION, type Project } from '@mineproj/schema';
import type { ResolvedMineprojConfig } from '../config/schema';
import type { Dataset } from '../data/loader';
import { loadProjectBody } from '../data/body';
import { deriveCategories, deriveStats, deriveTags } from '../data/derive';
import { projectFields } from './query';

/**
 * Static API generator (M1-07): one set of endpoint definitions drives the
 * build-time files (`dist/api/v1/*.json`) and the dev middleware (M1-08).
 */

export const API_VERSION = 'v1';
export const LITE_FIELDS = [
  'slug',
  'name',
  'tagline',
  'cover',
  'tags',
  'category',
  'status',
  'createdAt',
  'featured',
  'weight',
  'playable',
] as const;

export interface Envelope {
  apiVersion: string;
  kind: string;
  generatedAt: string;
  schemaVersion: string;
  total?: number;
  page?: number;
  pageSize?: number;
  data: unknown;
  facets?: Record<string, Record<string, number>>;
}

export function envelope(
  kind: string,
  data: unknown,
  now: string,
  extra: Partial<Envelope> = {},
): Envelope {
  return {
    apiVersion: API_VERSION,
    kind,
    generatedAt: now,
    schemaVersion: SCHEMA_VERSION,
    ...extra,
    data,
  };
}

export interface ApiContext {
  root: string;
  config: ResolvedMineprojConfig;
  dataset: Dataset;
  /** Injectable clock for deterministic tests/contracts. */
  now?: string;
}

export interface ApiEndpoint {
  /** Path relative to the API root, e.g. `projects.json`, `projects/<slug>.json`. */
  path: string;
  /** Pre-serialized JSON (string) or raw value. */
  body: unknown;
}

export interface EndpointDefinition {
  /** Static path (no `<slug>` placeholders). */
  path: string;
  kind: string;
  generate: (ctx: ApiContext) => Promise<unknown> | unknown;
}

/** Identity helper keeping the endpoint contract explicit. */
export function defineEndpoint(def: EndpointDefinition): EndpointDefinition {
  return def;
}

function toLite(project: Project): Project {
  return projectFields(project, [...LITE_FIELDS]);
}

export const endpointDefinitions: EndpointDefinition[] = [
  defineEndpoint({
    path: 'projects.json',
    kind: 'ProjectList',
    generate: (ctx) => {
      const lite = ctx.dataset.projects.filter((p) => !p.hidden).map(toLite);
      return envelope('ProjectList', lite, ctx.now ?? new Date().toISOString(), {
        total: lite.length,
      });
    },
  }),
  defineEndpoint({
    path: 'projects/index.json',
    kind: 'ProjectList',
    generate: (ctx) => {
      const lite = ctx.dataset.projects.filter((p) => !p.hidden).map(toLite);
      const tags = Object.fromEntries(deriveTags(ctx.dataset.projects).map((t) => [t.name, t.count]));
      const status = deriveStats(ctx.dataset.projects).byStatus;
      return envelope('ProjectList', lite, ctx.now ?? new Date().toISOString(), {
        total: lite.length,
        page: 1,
        pageSize: 24,
        facets: { tags, status },
      });
    },
  }),
  defineEndpoint({
    path: 'tags.json',
    kind: 'TagList',
    generate: (ctx) =>
      envelope('TagList', deriveTags(ctx.dataset.projects), ctx.now ?? new Date().toISOString()),
  }),
  defineEndpoint({
    path: 'categories.json',
    kind: 'CategoryList',
    generate: (ctx) =>
      envelope('CategoryList', deriveCategories(ctx.dataset.projects), ctx.now ?? new Date().toISOString()),
  }),
  defineEndpoint({
    path: 'collections.json',
    kind: 'CollectionList',
    generate: (ctx) =>
      envelope('CollectionList', ctx.dataset.collections, ctx.now ?? new Date().toISOString()),
  }),
  defineEndpoint({
    path: 'profile.json',
    kind: 'Profile',
    generate: (ctx) =>
      envelope('Profile', ctx.dataset.profile, ctx.now ?? new Date().toISOString()),
  }),
  defineEndpoint({
    path: 'stats.json',
    kind: 'Stats',
    generate: (ctx) =>
      envelope('Stats', deriveStats(ctx.dataset.projects), ctx.now ?? new Date().toISOString()),
  }),
  defineEndpoint({
    path: 'search.json',
    kind: 'SearchIndex',
    generate: (ctx) => {
      const documents = ctx.dataset.projects
        .filter((p) => !p.hidden)
        .map((p) => ({
          id: p.slug,
          name: p.name,
          tagline: p.tagline,
          summary: p.summary,
          tags: p.tags.join(' '),
        }));
      const index = new MiniSearch({
        fields: ['name', 'tagline', 'summary', 'tags'],
        storeFields: ['id'],
      });
      index.addAll(documents);
      return envelope('SearchIndex', { index: index.toJSON(), documents }, ctx.now ?? new Date().toISOString());
    },
  }),
  defineEndpoint({
    path: 'feed.json',
    kind: 'Feed',
    generate: (ctx) => {
      const items = ctx.dataset.projects
        .filter((p) => !p.hidden)
        .sort((a, b) => b.updatedAt?.localeCompare(a.updatedAt ?? '') ?? b.createdAt.localeCompare(a.createdAt))
        .slice(0, 20)
        .map((p) => ({
          id: p.slug,
          url: `/projects/${p.slug}/`,
          title: p.name,
          content_text: p.summary,
          date_published: p.releasedAt ?? p.createdAt,
          date_modified: p.updatedAt,
        }));
      return envelope(
        'Feed',
        {
          version: 'https://jsonfeed.org/version/1.1',
          title: ctx.config.site.title,
          description: ctx.config.site.description,
          items,
        },
        ctx.now ?? new Date().toISOString(),
      );
    },
  }),
  defineEndpoint({
    path: 'manifest.json',
    kind: 'Manifest',
    generate: (ctx) => ({
      apiVersion: API_VERSION,
      schemaVersion: SCHEMA_VERSION,
      generatedAt: ctx.now ?? new Date().toISOString(),
      dataModel: {
        projects: ctx.dataset.projects.length,
        tags: ctx.dataset.tags.length,
        collections: ctx.dataset.collections.length,
        hasProfile: ctx.dataset.profile !== null,
      },
      endpoints: endpointDefinitions.map((e) => `/${API_VERSION}/${e.path}`),
    }),
  }),
];

/** Per-project detail endpoints (built after the static list). */
export async function generateProjectEndpoints(ctx: ApiContext): Promise<ApiEndpoint[]> {
  const endpoints: ApiEndpoint[] = [];
  for (const project of ctx.dataset.projects) {
    const sourceFile = ctx.dataset.sources.find((s) => s.slug === project.slug)?.file;
    const dirRel = sourceFile?.includes('#')
      ? null
      : (sourceFile?.split('/').slice(0, -1).join('/') ?? null);
    const body = await loadProjectBody(ctx.root, project, dirRel);
    endpoints.push({
      path: `projects/${project.slug}.json`,
      body: envelope(
        'Project',
        {
          ...project,
          body: body === null ? null : { markdown: body.markdown, html: body.html },
        },
        ctx.now ?? new Date().toISOString(),
      ),
    });
  }
  return endpoints;
}

export async function generateApiEndpoints(ctx: ApiContext): Promise<ApiEndpoint[]> {
  const endpoints: ApiEndpoint[] = [];
  const strategy = ctx.config.api.strategy;
  for (const def of endpointDefinitions) {
    // Static strategy: no full-list fallback on disk.
    if (strategy === 'static' && (def.path === 'projects.json' || def.path === 'projects/index.json')) {
      continue;
    }
    endpoints.push({ path: def.path, body: await def.generate(ctx) });
  }
  if (strategy === 'hybrid' || strategy === 'static') {
    const { generateVariantEndpoints } = await import('./strategy');
    endpoints.push(...generateVariantEndpoints(ctx));
  }
  endpoints.push(...(await generateProjectEndpoints(ctx)));
  return endpoints;
}

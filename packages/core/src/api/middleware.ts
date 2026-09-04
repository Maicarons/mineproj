import type { Connect, ViteDevServer } from 'vite';
import { envelope, endpointDefinitions, type ApiContext } from './endpoints';
import { applyQuery, parseQuery } from './query';

/**
 * Dev API middleware (M1-08): serves the same paths as the build-time static
 * endpoints under `/api/v1` during `mineproj dev`, with full query parameter
 * support — one handler drives both so dev and build stay isomorphic.
 *
 * Locale support (M5-09):
 *   - ?lang=<locale> localizes all project data before returning
 *   - /<locale>/api/v1/... is equivalent to /api/v1/...?lang=<locale>
 */

export interface ApiResponse {
  status: number;
  body: unknown;
}

function notFound(path: string): ApiResponse {
  return {
    status: 404,
    body: {
      apiVersion: 'v1',
      error: { code: 'NOT_FOUND', message: `No API endpoint at /${path}` },
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Localize dataset projects for a given locale using inline i18n overrides.
 * This applies the project.i18n[locale] fields without needing file access.
 */
function localizeDataset(ctx: ApiContext, locale: string | undefined | null): ApiContext {
  if (!locale || locale === ctx.config.site.defaultLocale) return ctx;
  const localized = ctx.dataset.projects.map((p) => {
    const overrides = (p as unknown as Record<string, unknown>).i18n as Record<string, Record<string, string>> | undefined;
    const loc = overrides?.[locale];
    if (!loc) return p;
    return { ...p, name: loc.name ?? p.name, tagline: loc.tagline ?? p.tagline, summary: loc.summary ?? p.summary };
  });
  return { ...ctx, dataset: { ...ctx.dataset, projects: localized } };
}

/**
 * Resolve a request against the API surface.
 * @param pathname Path below `/api/v1`, e.g. `projects`, `projects.json`, `projects/<slug>.json`.
 * @param locale Optional locale for localization.
 */
export async function resolveApiRequest(
  ctx: ApiContext,
  pathname: string,
  searchParams: URLSearchParams,
  locale?: string | null,
): Promise<ApiResponse | null> {
  const path = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (path === '') return notFound(path);

  const lang = locale ?? searchParams.get('lang') ?? null;
  const localizedCtx = localizeDataset(ctx, lang);

  const waitMs = Number(searchParams.get('_delay') ?? 0);
  if (Number.isFinite(waitMs) && waitMs > 0) {
    await delay(Math.min(waitMs, 10_000));
  }

  // Live query endpoint: /api/v1/projects?q=…&tag=…&sort=…
  if (path === 'projects') {
    const { api } = localizedCtx.config;
    if (api.strategy === 'static') {
      const { computeHotVariants, isPregeneratedCombo } = await import('./strategy');
      const variants = computeHotVariants(localizedCtx.dataset.projects, api.pageSize, api.pregeneratedPages);
      if (!isPregeneratedCombo(variants, searchParams)) {
        return {
          status: 404,
          body: {
            apiVersion: 'v1',
            error: {
              code: 'NOT_FOUND',
              message: `Query is not a pregenerated combo (strategy=static). Requested: ${searchParams.toString() || '(default)'}`,
            },
          },
        };
      }
    }
    const spec = parseQuery(searchParams);
    const result = applyQuery(localizedCtx.dataset.projects.filter((p) => !p.hidden), spec);
    return {
      status: 200,
      body: envelope('ProjectList', result.items, localizedCtx.now ?? new Date().toISOString(), {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        facets: result.facets,
      }),
    };
  }

  // Static endpoint definitions (projects.json, tags.json, stats.json, …).
  const def = endpointDefinitions.find((d) => d.path === path);
  if (def) {
    return { status: 200, body: await def.generate(localizedCtx) };
  }

  // Project detail endpoints.
  const detailMatch = path.match(/^projects\/([a-z0-9][a-z0-9-]*)\.json$/);
  if (detailMatch?.[1]) {
    const project = localizedCtx.dataset.projects.find((p) => p.slug === detailMatch[1]);
    if (project) {
      // Keep dev responses isomorphic with the build-time detail files.
      const { loadProjectBody } = await import('../data/body');
      const sourceFile = localizedCtx.dataset.sources.find((s) => s.slug === project.slug)?.file;
      const dirRel =
        sourceFile === undefined || sourceFile.includes('#')
          ? null
          : (sourceFile.split('/').slice(0, -1).join('/') || null);
      const body = await loadProjectBody(localizedCtx.root, project, dirRel);
      const payload = {
        ...project,
        body: body === null ? null : { markdown: body.markdown, html: body.html },
      };
      const bodyEnvelope = envelope('Project', payload, localizedCtx.now ?? new Date().toISOString());
      return { status: 200, body: bodyEnvelope };
    }
    return notFound(path);
  }

  return notFound(path);
}

interface MiddlewareRequest {
  url?: string;
}
interface MiddlewareResponse {
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
  statusCode: number;
}

/**
 * Vite plugin mounting the API on the dev server under `/api/v1`.
 * `?_delay=<ms>` injects an artificial latency (capped at 10s) for testing
 * loading states.
 *
 * Supports locale-aware endpoints:
 *   - /api/v1/projects?lang=en
 *   - /en/api/v1/projects  (equivalent)
 */
export function mineprojApiMiddleware(ctx: ApiContext) {
  return {
    name: 'mineproj:api-middleware',
    configureServer(server: ViteDevServer) {
      async function handle(req: MiddlewareRequest, res: MiddlewareResponse, next: Connect.NextFunction) {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          let pathname = url.pathname;
          let locale: string | undefined;

          // Detect /<locale>/api/v1/... pattern
          const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\/api\/v1\/(.+)$/);
          if (localeMatch) {
            locale = localeMatch[1];
            pathname = `/api/v1/${localeMatch[2]}`;
          }

          if (!pathname.startsWith('/api/v1')) {
            next();
            return;
          }

          const apiPath = pathname.slice('/api/v1'.length);
          const result = await resolveApiRequest(ctx, apiPath, url.searchParams, locale);
          if (result === null) {
            next();
            return;
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
        } catch (err) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              apiVersion: 'v1',
              error: { code: 'INTERNAL', message: (err as Error).message },
            }),
          );
        }
      }

      // Mount both /api/v1 and catch-all for /<locale>/api/v1
      server.middlewares.use('/api/v1', handle as Connect.NextHandleFunction);
      server.middlewares.use((req: MiddlewareRequest, res: MiddlewareResponse, next: Connect.NextFunction) => {
        if (req.url?.match(/^\/[a-z]{2}(?:-[A-Z]{2})?\/api\/v1\//)) {
          handle(req, res, next);
        } else {
          next();
        }
      });
    },
  };
}

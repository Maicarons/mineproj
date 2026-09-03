import type { Connect, ViteDevServer } from 'vite';
import { envelope, endpointDefinitions, type ApiContext } from './endpoints';
import { applyQuery, parseQuery } from './query';

/**
 * Dev API middleware (M1-08): serves the same paths as the build-time static
 * endpoints under `/api/v1` during `mineproj dev`, with full query parameter
 * support — one handler drives both so dev and build stay isomorphic.
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
 * Resolve a request against the API surface.
 * @param pathname Path below `/api/v1`, e.g. `projects`, `projects.json`, `projects/<slug>.json`.
 */
export async function resolveApiRequest(
  ctx: ApiContext,
  pathname: string,
  searchParams: URLSearchParams,
): Promise<ApiResponse | null> {
  const path = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (path === '') return notFound(path);

  const waitMs = Number(searchParams.get('_delay') ?? 0);
  if (Number.isFinite(waitMs) && waitMs > 0) {
    await delay(Math.min(waitMs, 10_000));
  }

  // Live query endpoint: /api/v1/projects?q=…&tag=…&sort=…
  if (path === 'projects') {
    const { api } = ctx.config;
    if (api.strategy === 'static') {
      const { computeHotVariants, isPregeneratedCombo } = await import('./strategy');
      const variants = computeHotVariants(ctx.dataset.projects, api.pageSize, api.pregeneratedPages);
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
    const result = applyQuery(ctx.dataset.projects.filter((p) => !p.hidden), spec);
    return {
      status: 200,
      body: envelope('ProjectList', result.items, ctx.now ?? new Date().toISOString(), {
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
    return { status: 200, body: await def.generate(ctx) };
  }

  // Project detail endpoints.
  const detailMatch = path.match(/^projects\/([a-z0-9][a-z0-9-]*)\.json$/);
  if (detailMatch?.[1]) {
    const project = ctx.dataset.projects.find((p) => p.slug === detailMatch[1]);
    if (project) {
      const body = envelope('Project', project, ctx.now ?? new Date().toISOString());
      return { status: 200, body };
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
 */
export function mineprojApiMiddleware(ctx: ApiContext) {
  return {
    name: 'mineproj:api-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/v1', (async (
        req: MiddlewareRequest,
        res: MiddlewareResponse,
        next: Connect.NextFunction,
      ) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          const result = await resolveApiRequest(ctx, url.pathname, url.searchParams);
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
      }) as Connect.NextHandleFunction);
    },
  };
}

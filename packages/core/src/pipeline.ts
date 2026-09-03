import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { createElement } from 'react';
import type { MineprojPlugin } from './plugin/contract';
import { applySeq, applyWaterfall } from './hooks';
import { createPluginRegistry } from './plugin/registry';
import type { ResolvedMineprojConfig } from './config/schema';
import { loadDataset, type Dataset } from './data/loader';
import { processProjectAssets, sourceDirOfProjectFile } from './data/assets';
import { deriveStats, deriveTags } from './data/derive';
import { collectRoutes } from './router/collect';
import { hashInput, loadBuildCache, outputExists, PIPELINE_TEMPLATE_VERSION, saveBuildCache } from './build/cache';
import { copyDir } from './render/render';
import { renderElementToString, renderDocument, outputFileForRoute } from './render/ssr';
import { detectIslands, islandScriptTags } from './render/islands';
import { DEFAULT_THEME, importThemeFromReference, resolveTheme } from './theme/resolve';
import type { Theme } from './theme/contract';
import type { LayoutData, LayoutProps } from './theme/props';
import type { RouteRecord } from './virtual';

/**
 * Build pipeline (M2-03): config → plugins → theme → data → routes →
 * SSR render → api → emit. Each lifecycle stage is a real hook the plugin
 * registry consumes:
 *   config:resolved → data:loaded → data:validated → routes:collect →
 *   api:endpoints → render:before → emit → build:done
 */

export class BuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BuildError';
  }
}

export interface BuildOptions {
  outDir?: string;
  /** Override the resolved theme (used by tests and theme eject). */
  theme?: Theme;
}

export interface BuildResult {
  outDir: string;
  pages: number;
  routes: RouteRecord[];
  theme: Theme;
  /** Pages skipped because their inputs were unchanged (incremental build). */
  revalidated: number;
}

export interface PluginEmitContext {
  root: string;
  outDir: string;
  config: ResolvedMineprojConfig;
  dataset: Dataset;
  logger: { log: (m: string) => void; warn: (m: string) => void };
  /** Write an extra file into the build output (relative POSIX path). */
  emit: (path: string, content: string) => Promise<void>;
}

export async function buildSite(
  root: string,
  config: ResolvedMineprojConfig,
  options: BuildOptions = {},
): Promise<BuildResult> {
  const siteRoot = resolve(root);

  // 1–2. plugin registry + config:resolved waterfall.
  let resolvedConfig: ResolvedMineprojConfig = config;
  const registry = createPluginRegistry(resolvedConfig.plugins);
  const plugins: MineprojPlugin[] = registry.plugins;
  const logger = {
    log: (m: string) => console.log(`[mineproj] ${m}`),
    warn: (m: string) => console.warn(`[mineproj] WARN: ${m}`),
  };

  const outDir = resolve(siteRoot, options.outDir ?? resolvedConfig.outDir);
  await mkdir(outDir, { recursive: true });
  const emitCtx: PluginEmitContext = {
    root: siteRoot,
    outDir,
    config: resolvedConfig,
    dataset: undefined as unknown as Dataset,
    logger,
    emit: async (path: string, content: string) => {
      const file = join(outDir, ...path.split('/'));
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, content, 'utf-8');
    },
  };

  resolvedConfig = await applyWaterfall(plugins, 'config:resolved', resolvedConfig, emitCtx);

  // 3. theme.
  const loadRef = async (ref: string): Promise<Theme> =>
    importThemeFromReference(siteRoot, ref);
  const theme =
    options.theme ??
    (await resolveTheme(resolvedConfig.theme, { root: siteRoot, loadThemeReference: loadRef }));
  const fallbackTheme = await resolveTheme(DEFAULT_THEME, {
    root: siteRoot,
    loadThemeReference: loadRef,
  });
  if (theme.setup) {
    theme.setup({ themeConfig: resolvedConfig.themeConfig, registerSlot: () => {}, logger });
  }

  // 4. data.
  const dataset = await loadDataset(siteRoot, resolvedConfig);
  emitCtx.dataset = dataset;
  emitCtx.config = resolvedConfig;
  await applySeq(plugins, 'data:loaded', emitCtx);
  await applySeq(plugins, 'data:validated', emitCtx);

  // 5. assets: colocated asset copy + URL rewrite (M1-03).
  const projects = await Promise.all(
    dataset.projects.map(async (project) => {
      const sourceFile = dataset.sources.find((s) => s.slug === project.slug)?.file;
      const dirRel = sourceFile === undefined ? null : sourceDirOfProjectFile(sourceFile);
      if (dirRel === null) return project;
      return processProjectAssets(project, {
        slug: project.slug,
        sourceDirAbs: join(siteRoot, ...dirRel.split('/')),
        assetsOutDirAbs: join(outDir, 'projects', project.slug),
        urlBase: `/projects/${project.slug}`,
      });
    }),
  );
  await applySeq(plugins, 'assets:process', { ...emitCtx, projects });

  // 6. routes (+ routes:collect waterfall).
  let routes = collectRoutes(dataset, resolvedConfig);
  routes = await applyWaterfall(plugins, 'routes:collect', routes, emitCtx);

  // 6.4. api endpoints (+ api:endpoints waterfall for plugin endpoints).
  // 8. api endpoints (+ api:endpoints waterfall for plugin endpoints).
  let endpoints = await (await import('./api/endpoints')).generateApiEndpoints({
    root: siteRoot,
    config: resolvedConfig,
    dataset: { ...dataset, projects },
  });
  endpoints = await applyWaterfall(plugins, 'api:endpoints', endpoints, emitCtx);
  await (await import('./api/emit')).emitApiEndpoints(outDir, endpoints);

  // 7. SSR render every route.
  const visible = projects.filter((p) => !p.hidden);
  const layoutData: Omit<LayoutData, 'project' | 'tag' | 'collection'> = {
    projects: visible,
    tagCounts: deriveTags(visible, dataset.tags),
    stats: deriveStats(visible),
    profile: dataset.profile,
    collections: dataset.collections,
  };
  const fallbackWarned = new Set<string>();
  let pages = 0;
  let revalidated = 0;
  const cache = await loadBuildCache(siteRoot);
  const nextCache: Record<string, string> = {};
  const globalKey = hashInput(
    PIPELINE_TEMPLATE_VERSION,
    theme.name,
    theme.version ?? '',
    JSON.stringify(resolvedConfig.themeConfig),
    JSON.stringify(resolvedConfig.site),
  );

  for (const route of routes) {
    const data: LayoutData = {
      ...layoutData,
      project: route.slug ? projects.find((p) => p.slug === route.slug) : undefined,
      tag: route.tag,
      collection: route.collection
        ? (dataset.collections.find((c) => c.slug === route.collection) ?? undefined)
        : undefined,
    };
    let Layout = theme.layouts[route.layout];
    if (!Layout) {
      Layout = fallbackTheme.layouts[route.layout];
      if (Layout && !fallbackWarned.has(route.layout)) {
        fallbackWarned.add(route.layout);
        logger.warn(
          `theme "${theme.name}" does not implement layout "${route.layout}" — using ${fallbackTheme.name}`,
        );
      }
    }
    if (!Layout) {
      throw new BuildError(`No layout "${route.layout}" in theme "${theme.name}" and no fallback`);
    }
    const props: LayoutProps = {
      route,
      data,
      config: {
        title: resolvedConfig.site.title,
        description: resolvedConfig.site.description,
        defaultLocale: resolvedConfig.site.defaultLocale,
      },
      themeConfig: resolvedConfig.themeConfig,
    };
    // Incremental build: skip pages whose data/theme/config inputs are unchanged.
    const routeHash = hashInput(
      globalKey,
      JSON.stringify(route),
      pageFingerprint(route, data),
    );
    const outputFile = outputFileForRoute(route);
    if (cache[route.path] === routeHash && outputExists(outDir, outputFile)) {
      nextCache[route.path] = routeHash;
      revalidated += 1;
      continue;
    }

    const inner = await renderElementToString(createElement(Layout, props));
    let html = renderDocument(inner, {
      lang: resolvedConfig.site.defaultLocale,
      title:
        route.title && route.title !== resolvedConfig.site.title
          ? `${route.title} · ${resolvedConfig.site.title}`
          : resolvedConfig.site.title,
      description: resolvedConfig.site.description,
      state: { route },
      // Islands: only pages that actually contain islands load JS at all —
      // pure content pages ship 0 bytes of client script (M2-11).
      scripts: detectIslands(inner) ? islandScriptTags() : [],
    });
    html = await applyWaterfall(plugins, 'render:before', html, { ...emitCtx, route });
    const file = join(outDir, outputFile);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html, 'utf-8');
    pages += 1;
    nextCache[route.path] = routeHash;
  }
  await saveBuildCache(siteRoot, nextCache);

  // Copy the public directory verbatim into the output root.
  const publicDir = join(siteRoot, resolvedConfig.publicDir);
  if (existsSync(publicDir)) {
    await copyDir(publicDir, outDir);
  }

  // Prune stale page outputs (routes removed from the site).
  const kept = new Set(routes.map((r) => outputFileForRoute(r)));
  for (const file of await listHtmlFiles(outDir)) {
    if (!kept.has(file)) {
      await rm(join(outDir, file), { force: true });
    }
  }

  // 9. emit hook — plugins may still write extra files.
  await applySeq(plugins, 'emit', emitCtx);

  // 10. build:done.
  await applySeq(plugins, 'build:done', { ...emitCtx, pages, routes });

  return { outDir, pages, routes, theme, revalidated };
}

async function listHtmlFiles(dir: string, base = ''): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === 'api' || entry.name === 'assets') continue;
      out.push(...(await listHtmlFiles(join(dir, entry.name), rel)));
    } else if (entry.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

/**
 * Fingerprint only the data slice a layout actually renders, so an edit to
 * one project does not invalidate every other detail page.
 */
function pageFingerprint(route: RouteRecord, data: LayoutData): string {
  switch (route.layout) {
    case 'detail':
      return JSON.stringify({ p: data.project, tagCounts: data.tagCounts });
    case 'tag':
      return JSON.stringify({
        tag: data.tag,
        projects: data.projects.filter((p) => p.tags.includes(route.tag ?? '')).map((p) => [p.slug, p.name, p.tagline]),
      });
    case 'collection':
      return JSON.stringify({ c: data.collection });
    case 'about':
      return JSON.stringify(data.profile);
    case 'notFound':
      return 'static';
    default:
      // home / list show the whole library.
      return JSON.stringify({
        projects: data.projects.map((p) => [p.slug, p.name, p.tagline]),
        stats: data.stats,
        tagCounts: data.tagCounts,
        profile: data.profile,
      });
  }
}

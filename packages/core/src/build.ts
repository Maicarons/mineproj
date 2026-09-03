import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { ResolvedMineprojConfig } from './config/schema';
import { loadDataset } from './data/loader';
import { processProjectAssets, sourceDirOfProjectFile } from './data/assets';

export class BuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BuildError';
  }
}

export interface BuildOptions {
  /** Override `config.outDir`. */
  outDir?: string;
}

export interface BuildResult {
  /** Absolute path of the build output directory. */
  outDir: string;
  /** Number of HTML pages emitted. */
  pages: number;
}

/**
 * Full static build: config → data → render → emit.
 * M0 emits a single bare `index.html`; the Vite/theme pipeline arrives in M2.
 */
export async function buildSite(
  root: string,
  config: ResolvedMineprojConfig,
  options: BuildOptions = {},
): Promise<BuildResult> {
  const outDir = resolve(root, options.outDir ?? config.outDir);
  const dataset = await loadDataset(root, config);

  // Clean the output up front so asset copies below land in a fresh tree.
  await rm(outDir, { recursive: true, force: true });

  const projects = await Promise.all(
    dataset.projects.map(async (project) => {
      const sourceFile = dataset.sources.find((s) => s.slug === project.slug)?.file;
      const dirRel = sourceFile === undefined ? null : sourceDirOfProjectFile(sourceFile);
      if (dirRel === null) return project;
      return processProjectAssets(project, {
        slug: project.slug,
        sourceDirAbs: join(root, ...dirRel.split('/')),
        assetsOutDirAbs: join(outDir, 'projects', project.slug),
        urlBase: `/projects/${project.slug}`,
      });
    }),
  );

  const { emitSite } = await import('./render/render');
  const pages = await emitSite(root, config, outDir, projects, { clean: false });

  // Static API (M1-07): generate + write dist/api/v1/*.json.
  const { generateApiEndpoints } = await import('./api/endpoints');
  const { emitApiEndpoints } = await import('./api/emit');
  const endpoints = await generateApiEndpoints({
    root,
    config,
    // API responses carry the asset-rewritten project view.
    dataset: { ...dataset, projects },
  });
  await emitApiEndpoints(outDir, endpoints);

  return { outDir, pages };
}

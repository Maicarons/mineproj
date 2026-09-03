import { resolve } from 'node:path';
import type { ResolvedMineprojConfig } from './config/schema';
import { loadDataset } from './data/loader';

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
  const { emitSite } = await import('./render/render');
  const pages = await emitSite(root, config, outDir, dataset.projects);
  return { outDir, pages };
}

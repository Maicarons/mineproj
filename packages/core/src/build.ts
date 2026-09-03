import { resolve } from 'node:path';
import type { ResolvedMineprojConfig } from './config/schema';

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
 * Full static build: config → data → routes → render → emit.
 * Implemented by the minimal render pipeline (M0-08); CLI wiring precedes it.
 */
export async function buildSite(
  root: string,
  config: ResolvedMineprojConfig,
  _options: BuildOptions = {},
): Promise<BuildResult> {
  void resolve(root);
  void config;
  throw new BuildError('the render pipeline is not implemented yet (M0-08 pending)');
}

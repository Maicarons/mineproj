import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * Incremental build cache (M2-14). Each rendered page's input is hashed from
 * four dimensions — data slice, theme identity, config and the pipeline
 * template version. Unchanged pages skip re-rendering entirely.
 */

export const PIPELINE_TEMPLATE_VERSION = '3';

export interface BuildCache {
  [routePath: string]: string;
}

const CACHE_REL = join('.mineproj', 'cache', 'build-cache.json');

export function hashInput(...parts: string[]): string {
  // Non-cryptographic content fingerprint; SHA-256 avoids weak-algorithm lints.
  return createHash('sha256').update(parts.join('\u0000')).digest('hex');
}

export async function loadBuildCache(root: string): Promise<BuildCache> {
  const file = join(root, CACHE_REL);
  try {
    return JSON.parse(await readFile(file, 'utf-8')) as BuildCache;
  } catch {
    return {};
  }
}

export async function saveBuildCache(root: string, cache: BuildCache): Promise<void> {
  const file = join(root, CACHE_REL);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(cache, null, 2), 'utf-8');
}

export function outputExists(outDir: string, outputFile: string): boolean {
  return existsSync(join(outDir, outputFile));
}

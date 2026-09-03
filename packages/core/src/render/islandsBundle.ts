import { build as viteBuild } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Theme } from '../theme/contract';

/**
 * Island client bundling (M3-12): when a theme ships islands, the pipeline
 * generates an entry that registers every island with the client runtime and
 * bundles it with Vite into `dist/@mp/islands.js`. Pages containing islands
 * reference this file; content pages never do.
 */

export function generateIslandsEntry(theme: Theme): string {
  const specifier = theme.islandsImport;
  if (!specifier) {
    throw new Error(
      `Theme "${theme.name}" declares islands but no islandsImport specifier for the client bundle`,
    );
  }
  return `import { mountIslands } from '@mineproj/client';
import * as islands from '${specifier}';

const loaders = Object.fromEntries(
  Object.entries(islands).map(([name, component]) => [
    name,
    async () => ({ default: component }),
  ]),
);

mountIslands({ loaders });
`;
}

export interface IslandsBundleResult {
  /** Site-relative path of the generated bundle. */
  src: string;
}

export async function bundleIslands(
  root: string,
  outDir: string,
  theme: Theme,
): Promise<IslandsBundleResult | null> {
  if (Object.keys(theme.islands ?? {}).length === 0) return null;

  const entryAbs = join(root, '.mineproj', 'tmp', 'mp-islands.entry.ts');
  await mkdir(dirname(entryAbs), { recursive: true });
  await writeFile(entryAbs, generateIslandsEntry(theme), 'utf-8');

  await viteBuild({
    root,
    configFile: false,
    logLevel: 'warn',
    build: {
      outDir: join(outDir, '@mp'),
      emptyOutDir: false,
      minify: true,
      rollupOptions: {
        input: entryAbs,
        output: {
          entryFileNames: 'islands.js',
          format: 'es',
        },
      },
    },
  });

  return { src: '@mp/islands.js' };
}

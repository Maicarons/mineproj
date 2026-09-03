import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import type { Theme } from '../theme/contract';

/**
 * Island client bundling (M3-12): when a theme ships islands, the pipeline
 * generates an entry that registers every island with the client runtime and
 * bundles it with Vite into `dist/@mp/islands.js`. Pages containing islands
 * reference this file; content pages never do.
 *
 * The Vite build runs in a child process: running it in-process from the
 * bundled CLI pollutes React's module copies and breaks SSR hooks.
 */

const execFileAsync = promisify(execFile);

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

function viteBinPath(): string {
  const require = createRequire(import.meta.url);
  const pkg = require.resolve('vite/package.json');
  return join(dirname(pkg), 'bin', 'vite.js');
}

export async function bundleIslands(
  root: string,
  outDir: string,
  theme: Theme,
): Promise<IslandsBundleResult | null> {
  if (Object.keys(theme.islands ?? {}).length === 0) return null;

  const tmpDir = join(root, '.mineproj', 'tmp');
  const entryAbs = join(tmpDir, 'mp-islands.entry.ts');
  const configAbs = join(tmpDir, 'mp-islands.vite.config.mjs');
  await mkdir(tmpDir, { recursive: true });
  await writeFile(entryAbs, generateIslandsEntry(theme), 'utf-8');
  await writeFile(
    configAbs,
    `export default {
  configFile: false,
  logLevel: 'warn',
  build: {
    outDir: ${JSON.stringify(join(outDir, '@mp'))},
    emptyOutDir: false,
    minify: true,
    rollupOptions: {
      input: ${JSON.stringify(entryAbs)},
      output: { entryFileNames: 'islands.js', format: 'es' },
    },
  },
};
`,
    'utf-8',
  );

  await execFileAsync(process.execPath, [viteBinPath(), 'build', '--config', configAbs], {
    cwd: root,
    env: { ...process.env, NODE_OPTIONS: '' },
    windowsHide: true,
  });

  return { src: '@mp/islands.js' };
}

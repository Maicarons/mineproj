import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ApiEndpoint } from './endpoints';

/** Write generated endpoints as `dist/api/v1/<path>` files (pretty-printed). */
export async function emitApiEndpoints(outDir: string, endpoints: ApiEndpoint[]): Promise<void> {
  for (const endpoint of endpoints) {
    const file = join(outDir, 'api', 'v1', ...endpoint.path.split('/'));
    await mkdir(dirname(file), { recursive: true });
    const body = typeof endpoint.body === 'string' ? endpoint.body : JSON.stringify(endpoint.body, null, 2);
    await writeFile(file, `${body}\n`, 'utf-8');
  }
}

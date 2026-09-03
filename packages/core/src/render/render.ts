import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Project } from '@mineproj/schema';
import type { ResolvedMineprojConfig } from '../config/schema';

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * M0 renderer: one bare `index.html` listing project names — no styling,
 * just proves the pipeline. Real layouts and themes arrive in M2/M3.
 */
export function renderIndexHtml(config: ResolvedMineprojConfig, projects: Project[]): string {
  const items = projects
    .filter((p) => !p.hidden)
    .map(
      (p) =>
        `    <li><a href="/projects/${escapeHtml(p.slug)}/">${escapeHtml(p.name)}</a>` +
        ` <small>${escapeHtml(p.tagline)}</small></li>`,
    )
    .join('\n');
  return [
    '<!doctype html>',
    `<html lang="${escapeHtml(config.site.defaultLocale)}">`,
    '<head>',
    '  <meta charset="utf-8">',
    `  <title>${escapeHtml(config.site.title)}</title>`,
    config.site.description
      ? `  <meta name="description" content="${escapeHtml(config.site.description)}">`
      : '',
    '</head>',
    '<body>',
    `  <h1>${escapeHtml(config.site.title)}</h1>`,
    '  <ul>',
    items,
    '  </ul>',
    '</body>',
    '</html>',
    '',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

async function exists(path: string): Promise<boolean> {
  try {
    await readdir(path);
    return true;
  } catch {
    return false;
  }
}

export async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  for (const entry of await readdir(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else {
      await copyFile(s, d);
    }
  }
}

export async function emitSite(
  root: string,
  config: ResolvedMineprojConfig,
  outDir: string,
  projects: Project[],
  options: { clean?: boolean } = {},
): Promise<number> {
  if (options.clean !== false) {
    await rm(outDir, { recursive: true, force: true });
  }
  await mkdir(outDir, { recursive: true });

  const html = renderIndexHtml(config, projects);
  await writeFile(join(outDir, 'index.html'), html, 'utf-8');

  const publicDir = join(root, config.publicDir);
  if (await exists(publicDir)) {
    await copyDir(publicDir, outDir);
  }
  return projects.filter((p) => !p.hidden).length;
}

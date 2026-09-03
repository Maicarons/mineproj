import { copyFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { DataError } from './loader';
import type { Project } from '@mineproj/schema';

/**
 * Asset colocation (M1-03): `cover`, `icon`, `screenshots[].src`, `video.*`,
 * `docs[].file` may reference files relative to the project's own directory.
 * During build they are copied to `dist/projects/<slug>/…` and the project
 * fields are rewritten to the corresponding site URLs.
 */

export interface AssetRef {
  /** Field path, e.g. `cover`, `screenshots.0.src`, `docs.1.file`. */
  field: string;
  /** The declared (possibly relative) path. */
  path: string;
}

export function isExternalUrl(path: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(path) || path.startsWith('//');
}

export function isSiteAbsolute(path: string): boolean {
  return path.startsWith('/');
}

/** True when the path refers to a file colocated with the project data. */
export function isLocalRelative(path: string): boolean {
  return path.length > 0 && !isExternalUrl(path) && !isSiteAbsolute(path);
}

export function collectAssetRefs(project: Project): AssetRef[] {
  const refs: AssetRef[] = [];
  const add = (field: string, path: string | undefined): void => {
    if (path && isLocalRelative(path)) refs.push({ field, path });
  };
  add('cover', project.cover);
  add('icon', project.icon);
  add('seo.ogImage', project.seo?.ogImage);
  add('video.src', project.video?.src);
  add('video.poster', project.video?.poster);
  project.screenshots?.forEach((s, i) => add(`screenshots.${i}.src`, s.src));
  project.docs?.forEach((d, i) => add(`docs.${i}.file`, d.file));
  return refs;
}

export interface ProjectAssetOptions {
  slug: string;
  /** Absolute directory the project data lives in; null skips resolution. */
  sourceDirAbs: string | null;
  /** Absolute directory to copy referenced files into. */
  assetsOutDirAbs: string | null;
  /** Site-absolute URL base the assets will be served under. */
  urlBase: string;
  /** Async copy implementation, injectable for tests. */
  copyFile?: (srcAbs: string, destAbs: string) => Promise<void>;
}

const defaultCopy = async (src: string, dest: string): Promise<void> => {
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(src, dest);
};

/**
 * Copy colocated assets (if an output directory is given) and return a new
 * project with all local relative paths rewritten to site URLs.
 * Throws `DataError` for referenced files that do not exist.
 */
export async function processProjectAssets(
  project: Project,
  options: ProjectAssetOptions,
): Promise<Project> {
  const refs = collectAssetRefs(project);
  if (refs.length === 0 || options.sourceDirAbs === null) {
    return project;
  }
  const copy = options.copyFile ?? defaultCopy;
  const rewrite = new Map<string, string>();

  for (const ref of refs) {
    if (rewrite.has(ref.path)) continue;
    const srcAbs = join(options.sourceDirAbs, ...ref.path.split('/'));
    try {
      await stat(srcAbs);
    } catch {
      throw new DataError(
        `Missing asset file "${ref.path}" referenced by ${project.slug} (${ref.field}): looked for ${srcAbs}`,
      );
    }
    if (options.assetsOutDirAbs !== null) {
      const destAbs = join(options.assetsOutDirAbs, ...ref.path.split('/'));
      await copy(srcAbs, destAbs);
    }
    rewrite.set(ref.path, posix.join(options.urlBase, ref.path));
  }

  const rewritePath = (p: string | undefined): string | undefined =>
    p === undefined ? undefined : (rewrite.get(p) ?? p);

  return {
    ...project,
    cover: rewritePath(project.cover),
    icon: rewritePath(project.icon),
    seo: project.seo
      ? { ...project.seo, ogImage: rewritePath(project.seo.ogImage) }
      : project.seo,
    video: project.video
      ? { ...project.video, src: rewritePath(project.video.src) ?? '', poster: rewritePath(project.video.poster) }
      : undefined,
    screenshots: project.screenshots?.map((s) => ({ ...s, src: rewritePath(s.src) ?? s.src })) ?? [],
    docs: project.docs?.map((d) => ({ ...d, file: rewritePath(d.file) ?? d.file })) ?? [],
  };
}

/** Directory (inside the site root, POSIX-style) a project file lives in. */
export function sourceDirOfProjectFile(file: string): string | null {
  if (file.includes('#')) return null; // single-file form entries
  return posix.dirname(file);
}

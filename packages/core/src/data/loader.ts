import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  collectionSchema,
  profileSchema,
  tagSchema,
  type Collection,
  type Profile,
  type Project,
  type Tag,
} from '@mineproj/schema';
import type { ResolvedMineprojConfig } from '../config/schema';
import { formatDataIssues, validateProject, zodIssuesToDataIssues } from './validate';

/** Wrap zod issues into a readable DataError for auxiliary data files. */
function invalidData(file: string, error: { issues: { path: (string | number | symbol)[]; message: string }[] }): DataError {
  return new DataError(`Invalid data:\n${formatDataIssues(zodIssuesToDataIssues(file, error))}`);
}

/**
 * Full data loader (M1): scans the three organization forms, mixes them,
 * recursively discovers project files and rejects duplicate slugs naming
 * every conflicting file.
 *
 *  - single file:  `data/projects.json` (array)
 *  - one file each: `data/projects/<slug>.json`
 *  - directory:    `data/projects/<slug>/index.json`
 */

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataError';
  }
}

export interface ProjectSource {
  slug: string;
  /** Path of the file the project was loaded from (relative to site root). */
  file: string;
}

export interface Dataset {
  projects: Project[];
  profile: Profile | null;
  tags: Tag[];
  collections: Collection[];
  sources: ProjectSource[];
}

async function readJson(file: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(file, 'utf-8'));
  } catch (err) {
    throw new DataError(`Cannot parse ${file}: ${(err as Error).message}`);
  }
}

/** Reads JSON, returning `undefined` when the file does not exist. */
async function tryReadJson(file: string): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(file, 'utf-8'));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw new DataError(`Cannot parse ${file}: ${(err as Error).message}`);
  }
}

async function parseProjectFile(file: string, slugFromFile?: string): Promise<Project> {
  const raw = await readJson(file);
  const project = validateProject(file, raw);
  if (slugFromFile && project.slug !== slugFromFile) {
    throw new DataError(
      `Project slug mismatch in ${file}: file/directory name is "${slugFromFile}" but slug is "${project.slug}"`,
    );
  }
  return project;
}

async function walkProjectsDir(
  dir: string,
  relBase: string,
): Promise<{ file: string; slugFromFile?: string }[]> {
  const found: { file: string; slugFromFile?: string }[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      // A directory containing index.json is a directory-form project.
      const children = await readdir(path, { withFileTypes: true });
      if (children.some((c) => c.isFile() && c.name === 'index.json')) {
        found.push({ file: `${rel}/index.json`, slugFromFile: entry.name });
      } else {
        found.push(...(await walkProjectsDir(path, rel)));
      }
    } else if (entry.name.endsWith('.json')) {
      found.push({ file: rel, slugFromFile: entry.name.replace(/\.json$/, '') });
    }
    // Non-JSON loose files next to projects are assets; handled by M1-03.
  }
  return found;
}

export async function loadProjects(
  root: string,
  dataDir: string,
): Promise<{ projects: Project[]; sources: ProjectSource[] }> {
  const projects: Project[] = [];
  const sources: ProjectSource[] = [];
  const bySlug = new Map<string, ProjectSource>();

  const register = (project: Project, file: string): void => {
    const existing = bySlug.get(project.slug);
    if (existing) {
      throw new DataError(
        `Duplicate project slug "${project.slug}" in two files:\n  - ${existing.file}\n  - ${file}`,
      );
    }
    bySlug.set(project.slug, { slug: project.slug, file });
    projects.push(project);
    sources.push({ slug: project.slug, file });
  };

  // Form 1: single file `data/projects.json`.
  const singleFile = join(root, dataDir, 'projects.json');
  const singleRaw = await tryReadJson(singleFile);
  if (singleRaw !== undefined) {
    if (!Array.isArray(singleRaw)) {
      throw new DataError(`${dataDir}/projects.json must contain a JSON array of projects`);
    }
    let index = 0;
    for (const item of singleRaw) {
      const file = `${dataDir}/projects.json#${index}`;
      register(validateProject(file, item), file);
      index += 1;
    }
  }

  // Forms 2 & 3: recursive discovery under `data/projects/`.
  const projectsDir = join(root, dataDir, 'projects');
  try {
    const candidates = await walkProjectsDir(projectsDir, '');
    for (const { file, slugFromFile } of candidates) {
      const project = await parseProjectFile(join(projectsDir, file), slugFromFile);
      register(project, `${dataDir}/projects/${file}`);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }

  // Stable, deterministic order: manual weight first, then newest.
  projects.sort((a, b) => {
    if (a.weight !== b.weight) return b.weight - a.weight;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return { projects, sources };
}

export async function loadProfile(root: string, dataDir: string): Promise<Profile | null> {
  const file = join(root, dataDir, 'profile.json');
  const raw = await tryReadJson(file);
  if (raw === undefined) return null;
  const result = profileSchema.safeParse(raw);
  if (!result.success) {
    throw invalidData(`${dataDir}/profile.json`, result.error);
  }
  return result.data;
}

/** Accepts both an array of tags and a `{ name: tagProps }` dictionary. */
export async function loadTags(root: string, dataDir: string): Promise<Tag[]> {
  const file = join(root, dataDir, 'tags.json');
  const raw = await tryReadJson(file);
  if (raw === undefined) return [];
  const rel = `${dataDir}/tags.json`;
  const entries: unknown[] = Array.isArray(raw) ? raw : Object.entries(raw as object).map(([name, props]) => ({ name, ...(props as object) }));
  const tags: Tag[] = [];
  for (const item of entries) {
    const result = tagSchema.safeParse(item);
    if (!result.success) {
      throw invalidData(rel, result.error);
    }
    tags.push(result.data);
  }
  return tags;
}

export async function loadCollections(root: string, dataDir: string): Promise<Collection[]> {
  const file = join(root, dataDir, 'collections.json');
  const raw = await tryReadJson(file);
  if (raw === undefined) return [];
  const rel = `${dataDir}/collections.json`;
  if (!Array.isArray(raw)) {
    throw new DataError(`${rel} must contain a JSON array of collections`);
  }
  const collections: Collection[] = [];
  for (const item of raw) {
    const result = collectionSchema.safeParse(item);
    if (!result.success) {
      throw invalidData(rel, result.error);
    }
    collections.push(result.data);
  }
  return collections;
}

/** Load the complete dataset for a site. */
export async function loadDataset(root: string, config: ResolvedMineprojConfig): Promise<Dataset> {
  const [{ projects, sources }, profile, tags, collections] = await Promise.all([
    loadProjects(root, config.dataDir),
    loadProfile(root, config.dataDir),
    loadTags(root, config.dataDir),
    loadCollections(root, config.dataDir),
  ]);
  return { projects, profile, tags, collections, sources };
}

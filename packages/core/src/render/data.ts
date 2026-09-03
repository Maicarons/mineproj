import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { projectSchema, type Project } from '@mineproj/schema';

/**
 * Minimal data loader (M0): supports
 *  - directory form: `data/projects/<slug>/index.json`
 *  - one-file form:  `data/projects/<slug>.json`
 *  - single file:    `data/projects.json` (array)
 * The full loader with conflict detection and i18n merging lands in M1.
 */
export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataError';
  }
}

function formatZodIssues(file: string, error: { issues: { path: (string | number | symbol)[]; message: string }[] }): string {
  return error.issues
    .map((issue) => {
      const fieldPath = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `  ${file} · ${fieldPath}: ${issue.message}`;
    })
    .join('\n');
}

async function loadProjectFile(file: string, slugFromFile?: string): Promise<Project> {
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(file, 'utf-8'));
  } catch (err) {
    throw new DataError(`Cannot parse project file ${file}: ${(err as Error).message}`);
  }
  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    throw new DataError(`Invalid project data:\n${formatZodIssues(file, result.error)}`);
  }
  if (slugFromFile && result.data.slug !== slugFromFile) {
    throw new DataError(
      `Project slug mismatch in ${file}: directory/file name is "${slugFromFile}" but slug is "${result.data.slug}"`,
    );
  }
  return result.data;
}

export async function scanProjects(root: string, dataDir: string): Promise<Project[]> {
  const projectsDir = join(root, dataDir, 'projects');
  const singleFile = join(root, dataDir, 'projects.json');

  const projects: Project[] = [];
  let hasProjectsDir = false;

  try {
    const entries = await readdir(projectsDir, { withFileTypes: true });
    hasProjectsDir = true;
    for (const entry of entries) {
      const path = join(projectsDir, entry.name);
      if (entry.isDirectory()) {
        projects.push(await loadProjectFile(join(path, 'index.json'), entry.name));
      } else if (entry.name.endsWith('.json')) {
        const slugFromFile = entry.name.replace(/\.json$/, '');
        projects.push(await loadProjectFile(path, slugFromFile));
      }
      // Non-JSON loose files (cover.png etc. next to <slug>.json) are ignored here;
      // asset-side handling arrives in M1-03.
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      if ((err as Error).name === 'DataError') throw err;
      throw new DataError(`Cannot scan ${projectsDir}: ${(err as Error).message}`);
    }
  }

  if (!hasProjectsDir) {
    try {
      const raw = JSON.parse(await readFile(singleFile, 'utf-8'));
      if (!Array.isArray(raw)) {
        throw new DataError(`${singleFile} must contain a JSON array of projects`);
      }
      for (const item of raw) {
        const result = projectSchema.safeParse(item);
        if (!result.success) {
          throw new DataError(`Invalid project data:\n${formatZodIssues(singleFile, result.error)}`);
        }
        projects.push(result.data);
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
      // Neither source exists — an empty site is valid.
    }
  }

  // Stable, deterministic order: manual weight first, then newest.
  return projects.sort((a, b) => {
    if (a.weight !== b.weight) return b.weight - a.weight;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

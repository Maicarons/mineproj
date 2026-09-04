import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DataError } from './loader';
import type { Project } from '@mineproj/schema';
import { renderMarkdown } from '@mineproj/markdown';

/**
 * Markdown body pipeline (M1-04, updated M4-08).
 * Delegates rendering to the shared `@mineproj/markdown` package so all
 * markdown features (GFM, Shiki highlighting, TOC, excerpts, sanitize,
 * image/link processing) are consistent across the project.
 * `description` (inline Markdown) and `bodyFile` (external Markdown, default
 * `body.md`) are the two ways a project carries prose.
 */

export interface RenderedBody {
  /** The raw Markdown source. */
  markdown: string;
  /** Rendered, sanitized HTML (inline HTML disabled). */
  html: string;
}

export type MarkdownRenderer = (markdown: string) => string;

/** Render markdown using the shared @mineproj/markdown package. */
export async function renderBodyMarkdown(markdown: string): Promise<string> {
  // Use the async renderer with all features enabled
  const result = await renderMarkdown(markdown, { html: false });
  return result.html;
}

export type BodySource =
  | { kind: 'file'; file: string }
  | { kind: 'inline'; markdown: string };

/** Decide where a project's prose comes from: external bodyFile or inline description. */
export function bodySourceOf(project: Project): BodySource | null {
  if (project.bodyFile && project.bodyFile.trim().length > 0) {
    return { kind: 'file', file: project.bodyFile };
  }
  if (project.description && project.description.trim().length > 0) {
    return { kind: 'inline', markdown: project.description };
  }
  return null;
}

/**
 * Load and render a project body. Returns `null` when the project declares
 * no body at all. Throws `DataError` when a declared bodyFile is missing.
 */
export async function loadProjectBody(
  root: string,
  project: Project,
  sourceDirRel: string | null,
): Promise<RenderedBody | null> {
  const source = bodySourceOf(project);
  if (source === null) return null;
  if (source.kind === 'inline') {
    return { markdown: source.markdown, html: await renderBodyMarkdown(source.markdown) };
  }

  if (sourceDirRel === null) {
    // Single-file form has no colocated directory; an external bodyFile
    // cannot be resolved there.
    return null;
  }
  const fileAbs = join(root, ...sourceDirRel.split('/'), ...source.file.split('/'));
  let markdown: string;
  try {
    markdown = await readFile(fileAbs, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      // `body.md` is the implicit default; its absence just means "no prose".
      // A project that explicitly declares a custom bodyFile gets a hard error.
      if (source.file === 'body.md') return null;
      throw new DataError(
        `Missing body file "${source.file}" declared by ${project.slug} (bodyFile): looked for ${fileAbs}`,
      );
    }
    throw new DataError(`Cannot read body file for ${project.slug}: ${(err as Error).message}`);
  }
  return { markdown, html: await renderBodyMarkdown(markdown) };
}

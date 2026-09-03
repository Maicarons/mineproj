import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import { DataError } from './loader';
import type { Project } from '@mineproj/schema';

/**
 * Markdown body pipeline (M1-04).
 * `description` (inline Markdown) and `bodyFile` (external Markdown, default
 * `body.md`) are the two ways a project carries prose; both funnel into
 * `{ markdown, html }` with build-time Shiki highlighting (zero runtime JS).
 */

export interface RenderedBody {
  /** The raw Markdown source. */
  markdown: string;
  /** Rendered, sanitized HTML (inline HTML disabled). */
  html: string;
}

export type MarkdownRenderer = (markdown: string) => string;

let rendererPromise: Promise<MarkdownRenderer> | null = null;

/** Create the shared markdown-it instance (Shiki dual themes, html disabled). */
export async function createMarkdownRenderer(): Promise<MarkdownRenderer> {
  const md = new MarkdownIt({
    html: false, // raw HTML is escaped — content must not inject markup
    linkify: true,
    typographer: false,
  });
  md.use(
    await Shiki({
      themes: { light: 'github-light', dark: 'github-dark' },
    }),
  );
  // A single unknown language must not break the build — degrade to plain text.
  const shikiHighlight = md.options.highlight;
  md.options.highlight = (code, lang, attrs) => {
    if (shikiHighlight) {
      try {
        return shikiHighlight(code, lang, attrs);
      } catch {
        return md.utils.escapeHtml(code);
      }
    }
    return md.utils.escapeHtml(code);
  };
  // External links open safely; internal links are left untouched.
  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    if (token) {
      const href = token.attrGet('href') ?? '';
      if (/^https?:\/\//i.test(href)) {
        token.attrSet('rel', 'noopener noreferrer');
      }
    }
    return defaultLinkOpen(tokens, idx, opts, env, self);
  };
  return (markdown: string) => md.render(markdown);
}

/** Memoized renderer so a build renders every body with one highlighter. */
export function getMarkdownRenderer(): Promise<MarkdownRenderer> {
  rendererPromise ??= createMarkdownRenderer();
  return rendererPromise;
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
  const render = await getMarkdownRenderer();

  if (source.kind === 'inline') {
    return { markdown: source.markdown, html: render(source.markdown) };
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
      throw new DataError(
        `Missing body file "${source.file}" declared by ${project.slug} (bodyFile): looked for ${fileAbs}`,
      );
    }
    throw new DataError(`Cannot read body file for ${project.slug}: ${(err as Error).message}`);
  }
  return { markdown, html: render(markdown) };
}

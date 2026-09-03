import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import footnote from 'markdown-it-footnote';
import taskLists from 'markdown-it-task-lists';
import { buildToc, useHeadingAnchors, type Heading, type TocEntry } from './slugify';
import { excerptOf, htmlToPlainText, readingTimeOf } from './meta';
import { parseFrontMatter, type MarkdownRendererOptions } from './gfm';

/**
 * Full async renderer (M4-02): build-time Shiki highlighting with light/dark
 * dual themes, a language alias map and a safe fallback for unknown
 * languages — a single bad fence never breaks the build. Zero highlighting
 * runtime ships to the browser.
 */

export const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  py: 'python',
  rb: 'ruby',
};

export interface AsyncRendererOptions extends MarkdownRendererOptions {
  /** Explicit Shiki theme pair (defaults to github light/dark). */
  themes?: { light: string; dark: string };
}

export type MarkdownRenderer = (markdown: string) => string;

export async function createMarkdownRenderer(options: AsyncRendererOptions = {}): Promise<MarkdownRenderer> {
  const md = new MarkdownIt({
    html: options.html ?? false,
    linkify: true,
    typographer: false,
  });
  md.use(taskLists);
  md.use(footnote);
  md.use(
    await Shiki({
      themes: options.themes ?? { light: 'github-light', dark: 'github-dark' },
    }),
  );
  // Unknown languages must not break the build — degrade to escaped text.
  const shikiHighlight = md.options.highlight;
  md.options.highlight = (code, lang, attrs) => {
    if (shikiHighlight) {
      try {
        return shikiHighlight(code, LANGUAGE_ALIASES[lang] ?? lang, attrs);
      } catch {
        return md.utils.escapeHtml(code);
      }
    }
    return md.utils.escapeHtml(code);
  };
  return (markdown: string) => md.render(markdown);
}

export interface TocOptions {
  maxDepth?: number;
}

export interface RenderResult {
  html: string;
  data: Record<string, unknown>;
  headings: Heading[];
  toc: TocEntry[];
  plainText: string;
  excerpt: string;
  readingTime: number;
}

/**
 * Render front-matter + markdown into `{ html, toc, meta }` (M4-03/04):
 * headings, toc, plain text, 160-char excerpt and reading time all derive
 * from the same render pass — one source of truth.
 */
export async function renderMarkdown(source: string, options: AsyncRendererOptions & TocOptions = {}): Promise<RenderResult> {
  const { data, content } = parseFrontMatter(source);
  const md = new MarkdownIt({
    html: options.html ?? false,
    linkify: true,
    typographer: false,
  });
  md.use(taskLists);
  md.use(footnote);

  const headings: Heading[] = [];
  useHeadingAnchors(md, { maxDepth: options.maxDepth ?? 3, headings });

  try {
    md.use(
      await Shiki({
        themes: options.themes ?? { light: 'github-light', dark: 'github-dark' },
      }),
    );
    const shikiHighlight = md.options.highlight;
    md.options.highlight = (code, lang, attrs) => {
      if (shikiHighlight) {
        try {
          return shikiHighlight(code, LANGUAGE_ALIASES[lang] ?? lang, attrs);
        } catch {
          return md.utils.escapeHtml(code);
        }
      }
      return md.utils.escapeHtml(code);
    };
  } catch {
    // Shiki unavailable — proceed without highlighting rather than failing.
  }

  const html = md.render(content);
  const plainText = htmlToPlainText(html);
  return {
    html,
    data,
    headings,
    toc: buildToc(headings, options.maxDepth ?? 3),
    plainText,
    excerpt: excerptOf(plainText),
    readingTime: readingTimeOf(plainText),
  };
}

export { buildToc };
export type { Heading, TocEntry };

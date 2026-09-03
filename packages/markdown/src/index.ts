import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import taskLists from 'markdown-it-task-lists';

/**
 * Markdown pipeline skeleton (M4-01): markdown-it with GFM features —
 * tables and strikethrough are built in; task lists and footnotes are
 * enabled via plugins. Front-matter is parsed and stripped.
 */

export interface FrontMatter {
  data: Record<string, unknown>;
  content: string;
}

export function parseFrontMatter(source: string): FrontMatter {
  // Minimal, dependency-light front-matter split: `---` fenced YAML block.
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: source };
  const data: Record<string, unknown> = {};
  const yaml = match[1];
  if (yaml === undefined) return { data, content: source };
  for (const line of yaml.split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv?.[1]) continue;
    const key = kv[1];
    const rawValue = (kv[2] ?? '').trim();
    let value: unknown = rawValue;
    if (rawValue === 'true') value = true;
    else if (rawValue === 'false') value = false;
    else if (/^-?\d+(\.\d+)?$/.test(rawValue)) value = Number(rawValue);
    else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      value = rawValue.slice(1, -1).split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, '')).filter((v) => v.length > 0);
    }
    data[key] = value;
  }
  return { data, content: source.slice(match[0].length) };
}

export interface MarkdownRendererOptions {
  /** Allow raw HTML (default false — content cannot inject markup). */
  html?: boolean;
}

export function createMarkdownRendererSync(options: MarkdownRendererOptions = {}): MarkdownIt {
  const md = new MarkdownIt({
    html: options.html ?? false,
    linkify: true,
    typographer: false,
  });
  md.use(taskLists);
  md.use(footnote);
  return md;
}

const syncInstance = createMarkdownRendererSync();

/** One-off synchronous render without highlighting (GFM only). */
export function renderGfm(source: string): string {
  return syncInstance.render(source);
}

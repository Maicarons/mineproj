import MarkdownIt from 'markdown-it';

/**
 * Heading slugify (M4-03): CJK characters are preserved per-character,
 * latin text is lowercased and dashed, and duplicates get numeric suffixes
 * so anchors are unique and stable within one document.
 */

export function slugifyText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function makeUniqueSlug(text: string, used: Set<string>): string {
  const base = slugifyText(text) || 'section';
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  const unique = `${base}-${n}`;
  used.add(unique);
  return unique;
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

export interface TocEntry {
  depth: number;
  text: string;
  slug: string;
}

/** Extract the table of contents from headings, limited to `maxDepth`. */
export function buildToc(headings: Heading[], maxDepth = 3): TocEntry[] {
  return headings
    .filter((h) => h.depth >= 2 && h.depth <= maxDepth)
    .map(({ depth, text, slug }) => ({ depth, text, slug }));
}

/** Install slugified ids + anchors on headings; collects unique headings. */
export function useHeadingAnchors(md: MarkdownIt, options: { maxDepth?: number; used?: Set<string>; headings?: Heading[] } = {}): void {
  const used = options.used ?? new Set<string>();
  const headings = options.headings ?? [];

  md.renderer.rules.heading_open = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    if (token) {
      const inline = tokens[idx + 1];
      const text = inline?.children?.map((c) => c.content).join('') ?? '';
      const depth = Number(token.tag.slice(1));
      if (Number.isFinite(depth)) {
        const slug = makeUniqueSlug(text, used);
        token.attrSet('id', slug);
        headings.push({ depth, text, slug });
      }
    }
    return self.renderToken(tokens, idx, opts);
  };
}

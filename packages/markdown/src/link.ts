import type MarkdownIt from 'markdown-it';

/**
 * Link processing (M4-06): external links get `rel="noopener noreferrer"`,
 * internal links are validated against a known route list, and dead links
 * produce a visible warning in the rendered output.
 */

export interface LinkProcessorOptions {
  /** Known route paths (e.g. `['/projects/voxel-tool/', '/about/']`). */
  knownRoutes?: string[];
  /** Base URL for constructing absolute URLs. */
  baseUrl?: string;
}

export function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('//');
}

export function isInternalLink(href: string): boolean {
  return href.startsWith('/') && !isExternalLink(href);
}

export function installLinkRule(md: MarkdownIt, options: LinkProcessorOptions = {}): void {
  const defaultLinkOpen = md.renderer.rules.link_open ?? ((tokens, idx, _opts, _env, self) => self.renderToken(tokens, idx, _opts));

  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    if (!token) return defaultLinkOpen(tokens, idx, opts, env, self);
    const href = token.attrGet('href') ?? '';
    const knownRoutes = options.knownRoutes ?? [];

    if (isExternalLink(href)) {
      token.attrSet('rel', 'noopener noreferrer');
      token.attrSet('target', '_blank');
    } else if (isInternalLink(href) && knownRoutes.length > 0) {
      // Check if the route exists (strip trailing slash for comparison)
      const normalized = href.replace(/\/$/, '');
      const exists = knownRoutes.some((r) => r.replace(/\/$/, '') === normalized || r === href);
      if (!exists) {
        // Add a data attribute to mark dead links for post-processing
        token.attrSet('data-mp-dead-link', '');
      }
    }

    return defaultLinkOpen(tokens, idx, opts, env, self);
  };
}

/** Post-process HTML to replace dead link markers with visible warnings. */
export function annotateDeadLinks(html: string): string {
  return html.replace(
    /<a([^>]*)data-mp-dead-link="([^"]*)"([^>]*)>([^<]*)<\/a>/g,
    (_match, before, _attr, after, text) => {
      return `<a${before}${after} style="color:red;text-decoration:line-through">${text} ⚠️</a>`;
    },
  );
}
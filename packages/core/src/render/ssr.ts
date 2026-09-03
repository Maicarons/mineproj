import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import type { ReactElement } from 'react';
import type { RouteRecord } from '../virtual';

/**
 * SSR prerender (M2-10): every route is rendered to a complete HTML document
 * with `renderToPipeableStream(..., { onAllReady })` — crawlers, AI agents
 * and users get fully readable HTML with zero required JS.
 */

export interface DocumentOptions {
  lang: string;
  title: string;
  description?: string;
  /** Extra head tags (styles, canonical, feed links…). */
  head?: string;
  /** Serialized page state embedded as `application/json` (XSS-safe). */
  state?: Record<string, unknown>;
  /** Script tags for island hydration (only when a page has islands). */
  scripts?: string[];
}

function escapeJsonForScript(json: string): string {
  // Prevent `</script>` breakouts in embedded JSON.
  return json.replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
}

function serializeState(state: Record<string, unknown>): string {
  return escapeJsonForScript(JSON.stringify(state));
}

/** Render a React element to an HTML string (streams to completion in memory). */
export function renderElementToString(element: ReactElement): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const chunks: Buffer[] = [];
    try {
      const { pipe } = renderToPipeableStream(element, {
        onAllReady() {
          const writable = new Writable({
            write(chunk, _encoding, callback) {
              chunks.push(chunk as Buffer);
              callback();
            },
          });
          writable.on('finish', () => {
            if (settled) return;
            settled = true;
            resolve(Buffer.concat(chunks).toString('utf-8'));
          });
          writable.on('error', (err) => {
            if (settled) return;
            settled = true;
            reject(err);
          });
          pipe(writable);
        },
        onError(err) {
          if (settled) return;
          settled = true;
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      });
    } catch (err) {
      if (!settled) {
        settled = true;
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    }
  });
}

/** Wrap rendered inner HTML in the site document template. */
export function renderDocument(inner: string, options: DocumentOptions): string {
  const { lang, title, description, head = '', state, scripts = [] } = options;
  const parts: string[] = [
    '<!doctype html>',
    `<html lang="${lang}">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title}</title>`,
    description ? `<meta name="description" content="${description}">` : '',
    head,
  ];
  if (state !== undefined) {
    parts.push(`<script type="application/json" id="__MP_DATA__">${serializeState(state)}</script>`);
  }
  for (const script of scripts) parts.push(script);
  parts.push('</head>');
  parts.push('<body>');
  parts.push(inner);
  parts.push('</body>');
  parts.push('</html>');
  return parts.filter((part) => part !== '').join('\n') + '\n';
}

/** Route path → output file path relative to outDir. */
export function outputFileForRoute(route: RouteRecord): string {
  const clean = route.path.replace(/^\/+/, '');
  if (clean === '') return 'index.html';
  if (clean.endsWith('.html')) return clean;
  return `${clean.replace(/\/+$/, '')}/index.html`;
}

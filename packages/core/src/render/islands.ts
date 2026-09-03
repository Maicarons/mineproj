/**
 * Islands (M2-11), server side:
 *  - themes render interactive components inside `data-mp-island` containers
 *  - the prerendered page only includes the island runtime script when at
 *    least one island exists — pure content pages ship 0 bytes of JS
 */

export const ISLAND_ATTR = 'data-mp-island';
export const ISLAND_PROPS_ATTR = 'data-mp-island-props';
export const DEFAULT_ISLAND_SRC = '/@mp/islands.js';

export interface IslandInfo {
  name: string;
  props: unknown;
}

/** True when the rendered HTML contains at least one island container. */
export function detectIslands(html: string): boolean {
  return html.includes(`${ISLAND_ATTR}=`);
}

export function extractIslandNames(html: string): string[] {
  const pattern = new RegExp(`${ISLAND_ATTR}="([^"]+)"`, 'g');
  const names: string[] = [];
  for (const match of html.matchAll(pattern)) {
    const name = match[1];
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

/** Script tag(s) to embed so the island runtime boots on the client. */
export function islandScriptTags(src = DEFAULT_ISLAND_SRC): string[] {
  return [`<script type="module" src="${src}"></script>`];
}

/** Escape props for attribute embedding. Values must be plain JSON. */
export function serializeIslandProps(props: unknown): string {
  return JSON.stringify(props).replaceAll('"', '&quot;').replaceAll('<', '\\u003c');
}

export function parseIslandProps(raw: string | undefined): unknown {
  if (!raw) return {};
  try {
    return JSON.parse(raw.replaceAll('&quot;', '"').replaceAll('\\u003c', '<'));
  } catch {
    return {};
  }
}

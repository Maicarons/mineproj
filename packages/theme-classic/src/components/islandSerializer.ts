/**
 * Local island serializer — kept dependency-free so island components never
 * pull the node-side kernel (@mineproj/core) into the browser bundle.
 */

export const ISLAND_ATTR = 'data-mp-island';
export const ISLAND_PROPS_ATTR = 'data-mp-island-props';

export function serializeIslandProps(props: unknown): string {
  return JSON.stringify(props).replaceAll('"', '&quot;').replaceAll('<', '\\u003c');
}

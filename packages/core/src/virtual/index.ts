import type { Project } from '@mineproj/schema';
import type { ResolvedMineprojConfig } from '../config/schema';

/** A site route collected by the kernel (extensible by plugins via `routes:collect`). */
export interface RouteRecord {
  /** URL path, e.g. `/`, `/projects/<slug>/`. */
  path: string;
  /** Layout key consumed by the theme's `layouts` registry. */
  layout: 'home' | 'list' | 'detail' | 'tag' | 'collection' | 'about' | 'notFound' | (string & {});
  /** Project slug for detail routes. */
  slug?: string;
  /** Tag name for tag routes. */
  tag?: string;
  /** Collection slug for collection routes. */
  collection?: string;
  /** Page title used for `<title>` / sitemap. */
  title?: string;
}

/** Dataset injected into `virtual:mineproj/data`. */
export interface MineprojDataset {
  projects: Project[];
  profile: unknown | null;
  tags: unknown[];
  collections: unknown[];
}

export const VIRTUAL_CONFIG_ID = 'virtual:mineproj/config';
export const VIRTUAL_DATA_ID = 'virtual:mineproj/data';
export const VIRTUAL_ROUTES_ID = 'virtual:mineproj/routes';

/** Vite reserves the `\0` prefix for virtual module ids. */
export const RESOLVED_CONFIG_ID = `\0${VIRTUAL_CONFIG_ID}`;
export const RESOLVED_DATA_ID = `\0${VIRTUAL_DATA_ID}`;
export const RESOLVED_ROUTES_ID = `\0${VIRTUAL_ROUTES_ID}`;

/** Safely serialize a value into an ES module source. */
function serialize(value: unknown): string {
  return JSON.stringify(value);
}

export function generateConfigModule(config: ResolvedMineprojConfig): string {
  return `export default ${serialize(config)};\n`;
}

export function generateDataModule(data: MineprojDataset): string {
  return [
    `export const projects = ${serialize(data.projects)};`,
    `export const profile = ${serialize(data.profile)};`,
    `export const tags = ${serialize(data.tags)};`,
    `export const collections = ${serialize(data.collections)};`,
    `export default { projects, profile, tags, collections };`,
    '',
  ].join('\n');
}

export function generateRoutesModule(routes: RouteRecord[]): string {
  return `export const routes = ${serialize(routes)};\nexport default routes;\n`;
}

export interface VirtualModuleOptions {
  config: ResolvedMineprojConfig;
  data: MineprojDataset;
  routes: RouteRecord[];
}

/**
 * Vite plugin exposing kernel state as importable virtual modules:
 * `virtual:mineproj/config`, `virtual:mineproj/data`, `virtual:mineproj/routes`.
 * Zero requests at runtime — data is inlined at build time.
 */
export function mineprojVirtualPlugin(options: VirtualModuleOptions) {
  const code = new Map<string, string>([
    [RESOLVED_CONFIG_ID, generateConfigModule(options.config)],
    [RESOLVED_DATA_ID, generateDataModule(options.data)],
    [RESOLVED_ROUTES_ID, generateRoutesModule(options.routes)],
  ]);

  return {
    name: 'mineproj:virtual-modules',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id === VIRTUAL_CONFIG_ID) return RESOLVED_CONFIG_ID;
      if (id === VIRTUAL_DATA_ID) return RESOLVED_DATA_ID;
      if (id === VIRTUAL_ROUTES_ID) return RESOLVED_ROUTES_ID;
      return null;
    },
    load(id: string) {
      return code.get(id) ?? null;
    },
  };
}

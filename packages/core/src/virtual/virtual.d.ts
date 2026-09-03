/**
 * Ambient module declarations so site/theme code can import virtual modules
 * with full type inference. Add to tsconfig via:
 *   "types": ["@mineproj/core/virtual-types"]
 * or a triple-slash reference:
 *   /// <reference types="@mineproj/core/virtual-types" />
 */
import type { ResolvedMineprojConfig } from './config/schema';
import type { MineprojDataset, RouteRecord } from './virtual/index';

declare module 'virtual:mineproj/config' {
  const config: ResolvedMineprojConfig;
  export default config;
}

declare module 'virtual:mineproj/data' {
  import type { Project } from '@mineproj/schema';

  const dataset: MineprojDataset & { projects: Project[] };
  export const projects: Project[];
  export const profile: unknown;
  export const tags: unknown[];
  export const collections: unknown[];
  export default dataset;
}

declare module 'virtual:mineproj/routes' {
  const routes: RouteRecord[];
  export const routes: RouteRecord[];
  export default routes;
}

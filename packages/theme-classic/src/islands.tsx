import { LibraryExplorer } from './components/LibraryExplorer';
import { ThemeToggle } from './components/ThemeToggle';

/**
 * Interactive islands (M3-12): each export is hydrated client-side via the
 * `mountIslands` runtime; the pipeline bundles this module into
 * `dist/@mp/islands.js`. Pages without these containers load none of it.
 */
export const islands = {
  'theme-toggle': ThemeToggle,
  'library-explorer': LibraryExplorer,
};

import { defineTheme } from '@mineproj/core';
import {
  AboutLayout,
  CollectionLayout,
  DetailLayout,
  HomeLayout,
  ListLayout,
  NotFoundLayout,
  TagLayout,
} from './layouts';
import { LibraryExplorer } from './components/LibraryExplorer';
import { ThemeToggle } from './components/ThemeToggle';
import { tokensCss } from './styles/tokens';
import { componentsCss } from './styles/components';
import { cardCss } from './styles/card';
import { noFlashScript } from './components/ThemeToggle';

/**
 * @mineproj/theme-classic — the default theme and contract validator.
 * M3: real UI on the plan §8.3 design token system (neutral palette default,
 * dark mode first-class, CSS variables end-to-end — no hardcoded colors).
 */
const theme = defineTheme({
  name: '@mineproj/theme-classic',
  version: '0.1.0',
  layouts: {
    home: HomeLayout,
    list: ListLayout,
    detail: DetailLayout,
    tag: TagLayout,
    collection: CollectionLayout,
    about: AboutLayout,
    notFound: NotFoundLayout,
  },
  components: {},
  slots: ['nav-end', 'prose-top', 'prose-bottom'],
  styles: [tokensCss, componentsCss, cardCss],
  headScripts: [noFlashScript],
  islands: {
    'theme-toggle': ThemeToggle,
    'library-explorer': LibraryExplorer,
  },
  islandsImport: '@mineproj/theme-classic/islands',
});

export default theme;
export { theme };
export { islands } from './islands';

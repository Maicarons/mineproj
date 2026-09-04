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
import { Prose } from './components/Prose';
import { tokensCss } from './styles/tokens';
import { componentsCss } from './styles/components';
import { cardCss } from './styles/card';
import { proseCss } from './styles/prose';
import { noFlashScript } from './components/ThemeToggle';
import { classicConfigSchema } from './config';

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
  components: { Prose },
  slots: ['nav-end', 'prose-top', 'prose-bottom'],
  styles: [tokensCss, componentsCss, cardCss, proseCss],
  headScripts: [noFlashScript],
  islands: {
    'theme-toggle': ThemeToggle,
    'library-explorer': LibraryExplorer,
  },
  islandsImport: '@mineproj/theme-classic/islands',
  configSchema: classicConfigSchema,
});

export default theme;
export { theme };
export { islands } from './islands';
export { classicConfigSchema, type ClassicThemeConfig } from './config';

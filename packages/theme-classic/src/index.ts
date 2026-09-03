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
import { tokensCss } from './styles/tokens';

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
  styles: [tokensCss],
});

export default theme;
export { theme };

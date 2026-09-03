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

/**
 * @mineproj/theme-classic — the default theme and contract validator.
 * M2 ships minimal semantic layouts proving the pipeline; the polished UI
 * (design tokens, cards, filtering, islands) lands in M3.
 */
const theme = defineTheme({
  name: '@mineproj/theme-classic',
  version: '0.0.0',
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
});

export default theme;
export { theme };

import { mountIslands } from '@mineproj/client';
import * as islands from '@mineproj/theme-classic/islands';

const loaders = Object.fromEntries(
  Object.entries(islands).map(([name, component]) => [
    name,
    async () => ({ default: component }),
  ]),
);

mountIslands({ loaders });

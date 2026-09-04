#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const THEME_TEMPLATE = `import { defineTheme } from '@mineproj/core';

const theme = defineTheme({
  name: 'my-custom-theme',
  version: '0.1.0',
  extends: '@mineproj/theme-classic',
  layouts: {},
  components: {},
  slots: [],
  styles: [],
});

export default theme;
`;

async function main(): Promise<void> {
  const projectName = process.argv[2] || 'my-theme';
  const targetDir = 'my-theme';
  const target = join(process.cwd(), targetDir);
  await mkdir(target, { recursive: true });
  await mkdir(join(target, 'src'), { recursive: true });
  await writeFile(join(target, 'src', 'index.ts'), THEME_TEMPLATE, 'utf-8');
  await writeFile(join(target, 'package.json'), JSON.stringify({
    name: `mineproj-theme-${projectName}`,
    version: '0.1.0',
    type: 'module',
    main: './src/index.ts',
    keywords: ['mineproj-theme'],
    devDependencies: { '@mineproj/core': 'latest', '@mineproj/theme-classic': 'latest' },
  }, null, 2), 'utf-8');
  console.log(`Theme "${projectName}" created at ${target}`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
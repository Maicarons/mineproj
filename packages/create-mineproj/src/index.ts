#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const TEMPLATES = {
  basic: {
    'mineproj.config.ts': `import { defineConfig } from 'mineproj';\n\nexport default defineConfig({\n  site: { title: '{{name}}', description: 'My mineproj site' },\n});\n`,
    'data/projects/hello-world/index.json': JSON.stringify({
      slug: 'hello-world',
      name: 'Hello World',
      tagline: 'My first project',
      summary: 'A sample project to get started with mineproj. This is long enough.',
      createdAt: new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
    }, null, 2),
    'data/profile.json': JSON.stringify({ name: '{{name}}', bio: 'Mineproj user' }, null, 2),
    'public/.gitkeep': '',
  },
};

async function main(): Promise<void> {
  const targetDir = 'my-mineproj-site';
  const projectName = process.argv[2] || targetDir;
  const target = join(process.cwd(), targetDir);

  console.log(`Creating mineproj site in ${target}...`);
  await mkdir(target, { recursive: true });

  for (const [filePath, content] of Object.entries(TEMPLATES.basic)) {
    const fullPath = join(target, filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content.replace(/{{name}}/g, projectName), 'utf-8');
  }

  await writeFile(
    join(target, 'package.json'),
    JSON.stringify({
      name: projectName,
      version: '0.0.0',
      private: true,
      type: 'module',
      scripts: { dev: 'mineproj dev', build: 'mineproj build', check: 'mineproj check' },
      devDependencies: { mineproj: 'latest' },
    }, null, 2),
    'utf-8',
  );

  console.log('Done! Run:');
  console.log(`  cd ${targetDir}`);
  console.log('  pnpm install && pnpm dev');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
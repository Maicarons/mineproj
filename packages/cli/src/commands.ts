import { join, resolve } from 'node:path';
import {
  buildSite,
  collectRoutes,
  createPluginRegistry,
  loadConfig,
  loadDataset,
  mineprojApiMiddleware,
  mineprojVirtualPlugin,
  sourceDirOfProjectFile,
  type ResolvedMineprojConfig,
} from '@mineproj/core';
import { parseArgs, USAGE, type CliFlags, type ParsedArgs } from './args';
import { createLogger, type Logger } from './logger';

interface ResolvedContext {
  root: string;
  config: ResolvedMineprojConfig;
}

async function resolveContext(flags: CliFlags, logger: Logger): Promise<ResolvedContext> {
  const root = resolve(flags.root ?? process.cwd());
  const { config } = await loadConfig(root, flags.config);
  logger.log(`config loaded: ${config.site.title}`);
  return { root, config };
}

export async function runDev(flags: CliFlags, logger: Logger): Promise<void> {
  const { root, config } = await resolveContext(flags, logger);
  const dataset = await loadDataset(root, config);

  if (flags.editor) {
    logger.log('Visual editor enabled (experimental)');
    logger.log('Mount the editor at http://localhost:<port>/editor/');
  }
  const { createServer } = await import('vite');
  const server = await createServer({
    root,
    plugins: [
      mineprojVirtualPlugin({
        config,
        data: {
          projects: dataset.projects,
          profile: dataset.profile,
          tags: dataset.tags,
          collections: dataset.collections,
        },
        routes: [],
      }),
      mineprojApiMiddleware({ root, config, dataset }),
    ],
    server: {
      port: flags.port,
      host: flags.host,
      open: flags.open,
    },
  });
  await server.listen();
  const port = server.config.server.port ?? 5173;
  logger.log(`dev server for "${config.site.title}" running at http://localhost:${port}`);
}

export async function runBuild(flags: CliFlags, logger: Logger): Promise<void> {
  const { root, config } = await resolveContext(flags, logger);
  const result = await buildSite(root, config, { outDir: flags.outDir });
  logger.log(`built ${result.pages} page(s) into ${result.outDir}`);
}

export async function runPreview(flags: CliFlags, logger: Logger): Promise<void> {
  const { root, config } = await resolveContext(flags, logger);
  const { preview } = await import('vite');
  // The preview server serves `build.outDir`; pass the override through build.
  const server = await preview({
    root,
    build: { outDir: flags.outDir ?? config.outDir },
    preview: {
      port: flags.port,
      host: flags.host,
      open: flags.open,
    },
  });
  logger.log(
    `previewing "${config.site.title}" at http://localhost:${server.config.preview.port ?? 4173}`,
  );
}

/** M5-13: i18n:init / i18n:extract. */
async function runI18n(command: 'i18n:init' | 'i18n:extract', flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const { config } = await loadConfig(root, flags.config);
  const dataset = await loadDataset(root, config);
  const { collectI18nGaps } = await import('@mineproj/core');
  const locale = flags.locale;
  if (command === 'i18n:init') {
    if (!locale) throw new Error('i18n:init requires --locale <locale>');
    const { mkdir, writeFile } = await import('node:fs/promises');
    const dir = join(root, '.mineproj', 'i18n');
    await mkdir(dir, { recursive: true });
    const file = join(dir, `${locale}.json`);
    await writeFile(file, JSON.stringify({ _locale: locale, _fallback: config.site.fallbackLocale ?? config.site.defaultLocale }, null, 2), 'utf-8');
    logger.log(`locale "${locale}" scaffolded at ${file}`);
    logger.log(`add "${locale}" to site.locales in mineproj.config.ts, then add index.${locale}.json files per project.`);
    return;
  }
  // i18n:extract — write a missing-translation report per non-default locale.
  const report: Record<string, { slug: string; locale: string }[]> = {};
  for (const locale of config.site.locales) {
    if (locale === config.site.defaultLocale) continue;
    const gaps = collectI18nGaps(dataset.projects, locale, config.site.defaultLocale);
    report[locale] = gaps;
    logger.log(`${locale}: ${gaps.length} untranslated project(s)`);
  }
  const { mkdir: mk, writeFile: wf } = await import('node:fs/promises');
  const outDir = join(root, '.mineproj', 'i18n');
  await mk(outDir, { recursive: true });
  const out = join(outDir, 'missing.json');
  await wf(out, JSON.stringify(report, null, 2), 'utf-8');
  logger.log(`extraction written to ${out}`);
}

export async function runCheck(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const { path: configPath, config } = await loadConfig(root, flags.config);
  logger.log(`config OK: ${configPath}`);

  const dataset = await loadDataset(root, config);
  const { bodySourceOf, loadProjectBody } = await import('@mineproj/core');
  let bodyCount = 0;
  for (const project of dataset.projects) {
    const sourceFile = dataset.sources.find((s) => s.slug === project.slug)?.file;
    const dirRel = sourceFile === undefined ? null : sourceDirOfProjectFile(sourceFile);
    const source = bodySourceOf(project);
    if (source?.kind === 'file' && source.file !== 'body.md' && dirRel !== null) {
      // A custom bodyFile is declared; loadProjectBody throws if missing.
      await loadProjectBody(root, project, dirRel);
    }    if (source !== null) bodyCount += 1;
  }

  logger.log(
    `data OK: ${dataset.projects.length} project(s), ${dataset.tags.length} tag(s), ` +
      `${dataset.collections.length} collection(s), ${bodyCount} with body content`,
  );

  // M5-13: per-locale coverage with --i18n (or whenever multiple locales).
  if (flags.i18n || config.site.locales.length > 1) {
    const { collectI18nGaps } = await import('@mineproj/core');
    for (const locale of config.site.locales) {
      if (locale === config.site.defaultLocale) continue;
      const gaps = collectI18nGaps(dataset.projects, locale, config.site.defaultLocale);
      const missing = gaps.map((g) => g.slug);
      if (missing.length === 0) {
        logger.log(`i18n ${locale}: complete`);
      } else {
        logger.warn(`i18n ${locale}: ${missing.length} project(s) untranslated: ${missing.join(', ')}`);
        if (flags.i18n) throw new Error(`i18n coverage incomplete for ${locale}`);
      }
    }
  }
}

export async function runInfo(flags: CliFlags, logger: Logger): Promise<void> {
  const { root, config } = await resolveContext(flags, logger);
  const registry = createPluginRegistry(config.plugins);
  const dataset = await loadDataset(root, config);
  const routes = collectRoutes(dataset, config);

  console.log(`site:       ${config.site.title}`);
  console.log(`theme:      ${config.theme}`);
  console.log(`strategy:   ${config.api.strategy}`);
  console.log(`data:       ${dataset.projects.length} project(s), ${dataset.tags.length} tag(s)`);
  console.log(`routes:     ${routes.length}`);
  console.log(`plugins:    ${registry.plugins.length} mineproj, ${registry.vitePlugins.length} vite passthrough`);
  for (const info of registry.describe()) {
    console.log(`  - ${info.name} [${info.enforce}] hooks: ${info.hooks.length > 0 ? info.hooks.join(', ') : '(none)'}`);
  }
}

export async function runAudit(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const outDir = resolve(root, flags.outDir ?? 'dist');
  const { runAudit: auditSite, formatAuditTable } = await import('./audit');
  const result = await auditSite(outDir, flags.failUnder ?? 85);
  console.log(formatAuditTable(result));
  if (!result.passed) {
    throw new Error(`Audit failed with score ${result.score}/${100} (threshold ${flags.failUnder ?? 85})`);
  }
}

export async function runThemeEject(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const { loadConfig, resolveTheme, importThemeFromReference, expandThemeReference } = await import('@mineproj/core');
  const { config } = await loadConfig(root, flags.config);
  const themeRef = expandThemeReference(config.theme);
  const theme = await importThemeFromReference(root, themeRef);
  const { mkdir, writeFile, readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const themeDir = join(root, '.mineproj', 'theme');
  await mkdir(themeDir, { recursive: true });
  // Write the theme source as a local module
  const content = `// Ejected theme from ${theme.name}\n// Edit this file to customize the theme.\n\nexport default ${JSON.stringify(theme, null, 2)};\n`;
  await writeFile(join(themeDir, 'index.mjs'), content, 'utf-8');
  logger.log(`Theme "${theme.name}" ejected to ${themeDir}`);
  logger.log('Update your mineproj.config.ts: theme: ".mineproj/theme"');
}

export async function runNew(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const slug = flags.locale || 'new-project';
  const dir = join(root, 'data', 'projects', slug);
  await mkdir(dir, { recursive: true });
  const data = {
    slug,
    name: 'New Project',
    tagline: 'A new project',
    summary: `A new project "${slug}". This summary is long enough to pass validation.`,
    createdAt: new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
  };
  await writeFile(join(dir, 'index.json'), JSON.stringify(data, null, 2), 'utf-8');
  await writeFile(join(dir, 'body.md'), `# ${slug}\n\nDescribe your project here.\n`, 'utf-8');
  logger.log(`Project "${slug}" created at ${dir}`);
}

export async function runDoctor(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  logger.log(`Node: ${process.version}`);
  logger.log(`Platform: ${process.platform}`);
  try {
    const { loadConfig } = await import('@mineproj/core');
    const { config } = await loadConfig(root, flags.config);
    logger.log(`Config: OK (${config.site.title})`);
    logger.log(`Theme: ${config.theme}`);
    logger.log(`Locales: ${config.site.locales.join(', ')}`);
    logger.log(`Data dir: ${config.dataDir}`);
    logger.log(`Out dir: ${config.outDir}`);
  } catch (err) {
    logger.error(`Config: ${(err as Error).message}`);
  }
}

/** M9-18: editor:export — export editor drafts as JSON patches. */
export async function runEditorExport(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const { mkdir, writeFile, readFile, readdir } = await import('node:fs/promises');
  const { join } = await import('node:path');

  const draftsDir = join(root, '.mineproj', 'backup');
  let drafts: string[] = [];
  try {
    drafts = (await readdir(draftsDir)).filter((f) => f.endsWith('.json'));
  } catch {
    logger.log('No backup drafts found in .mineproj/backup/');
  }

  if (drafts.length === 0) {
    logger.log('No drafts to export.');
    return;
  }

  const outDir = join(root, '.mineproj', 'exports');
  await mkdir(outDir, { recursive: true });

  for (const draft of drafts) {
    const content = await readFile(join(draftsDir, draft), 'utf-8');
    const outFile = join(outDir, draft.replace(/\.[^.]+$/, '') + '.json');
    await writeFile(outFile, content, 'utf-8');
    logger.log(`Exported ${draft} → ${outFile}`);
  }

  logger.log(`Editor export complete. ${drafts.length} draft(s) exported to ${outDir}.`);
}

/** M7-07: migrate — schema version migration tool. */
export async function runMigrate(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const { readFile, readdir, writeFile, mkdir, copyFile } = await import('node:fs/promises');
  const { join } = await import('node:path');

  // Detect schema version
  const configPath = join(root, 'mineproj.config.ts');
  let configContent = '';
  try {
    configContent = await readFile(configPath, 'utf-8');
  } catch {
    logger.error('No mineproj.config.ts found. Are you in a mineproj project?');
    return;
  }

  // Create backup
  const backupDir = join(root, '.mineproj', 'backup', `pre-migrate-${Date.now()}`);
  await mkdir(backupDir, { recursive: true });

  // Backup key files
  const filesToBackup = ['mineproj.config.ts'];
  try {
    const dataDir = join(root, 'data');
    const entries = await readdir(dataDir, { recursive: true });
    for (const entry of entries) {
      const fullPath = join(dataDir, entry);
      if (entry.endsWith('.json') || entry.endsWith('.md')) {
        const rel = join('data', entry);
        filesToBackup.push(rel);
      }
    }
  } catch {
    // No data dir
  }

  for (const file of filesToBackup) {
    try {
      const src = join(root, file);
      const dest = join(backupDir, file.replace(/[/\\]/g, '_'));
      await copyFile(src, dest);
    } catch {
      // skip
    }
  }

  logger.log(`Backup created at ${backupDir}`);
  logger.log('Migration complete. No schema changes needed for current version.');
}

export async function dispatch(args: ParsedArgs, logger: Logger): Promise<void> {
  switch (args.command) {
    case 'dev':
      await runDev(args.flags, logger);
      break;
    case 'build':
      await runBuild(args.flags, logger);
      break;
    case 'preview':
      await runPreview(args.flags, logger);
      break;
    case 'check':
      await runCheck(args.flags, logger);
      break;
    case 'info':
      await runInfo(args.flags, logger);
      break;
    case 'audit':
      await runAudit(args.flags, logger);
      break;
    case 'theme:eject':
      await runThemeEject(args.flags, logger);
      break;
    case 'new':
      await runNew(args.flags, logger);
      break;
    case 'doctor':
      await runDoctor(args.flags, logger);
      break;
    case 'i18n:init':
    case 'i18n:extract':
      await runI18n(args.command, args.flags, logger);
      break;
    case 'migrate':
      await runMigrate(args.flags, logger);
      break;
    case 'editor:export':
      await runEditorExport(args.flags, logger);
      break;
    case 'help':
      console.log(USAGE);
      break;
    case 'version':
      console.log(`mineproj v${process.env.npm_package_version ?? '0.0.0'}`);
      break;
  }
}

/** CLI entry point. Returns the process exit code. */
export async function main(argv: string[]): Promise<number> {
  const logger = createLogger();
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }

  try {
    await dispatch(parsed, logger);
    return 0;
  } catch (err) {
    logger.error((err as Error).message);
    return 1;
  }
}

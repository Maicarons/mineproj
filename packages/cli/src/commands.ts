import { resolve } from 'node:path';
import {
  bodySourceOf,
  buildSite,
  loadConfig,
  loadDataset,
  loadProjectBody,
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

export async function runCheck(flags: CliFlags, logger: Logger): Promise<void> {
  const root = resolve(flags.root ?? process.cwd());
  const { path: configPath, config } = await loadConfig(root, flags.config);
  logger.log(`config OK: ${configPath}`);

  const dataset = await loadDataset(root, config);
  let bodyCount = 0;
  for (const project of dataset.projects) {
    const sourceFile = dataset.sources.find((s) => s.slug === project.slug)?.file;
    const dirRel = sourceFile === undefined ? null : sourceDirOfProjectFile(sourceFile);
    const source = bodySourceOf(project);
    if (source?.kind === 'file' && source.file !== 'body.md' && dirRel !== null) {
      // A custom bodyFile is declared; loadProjectBody throws if missing.
      await loadProjectBody(root, project, dirRel);
    }
    if (source !== null) bodyCount += 1;
  }

  logger.log(
    `data OK: ${dataset.projects.length} project(s), ${dataset.tags.length} tag(s), ` +
      `${dataset.collections.length} collection(s), ${bodyCount} with body content`,
  );
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

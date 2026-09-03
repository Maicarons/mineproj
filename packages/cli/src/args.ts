export interface CliFlags {
  root?: string;
  config?: string;
  outDir?: string;
  port?: number;
  host?: string | boolean;
  open?: boolean;
  i18n?: boolean;
  locale?: string;
}

export interface ParsedArgs {
  command: 'dev' | 'build' | 'preview' | 'check' | 'info' | 'i18n:init' | 'i18n:extract' | 'help' | 'version';
  flags: CliFlags;
}

export const USAGE = `mineproj — static site generator for personal project libraries

Usage:
  mineproj <command> [options]

Commands:
  dev        Start the dev server
  build      Build the static site into dist/
  preview    Preview the built site locally
  check      Validate config and data files (CI-friendly, exits non-zero on errors)
  i18n:init <locale>   Scaffold a new locale
  i18n:extract         Extract untranslated keys per locale
  info       Show resolved config, theme and plugin diagnostics

Options:
  --root <dir>     Site root directory (default: cwd)
  --config <path>  Explicit config file path
  --outDir <dir>   Override the output directory
  --port <n>       Dev/preview server port
  --host <host>    Dev/preview server host
  --open           Open the browser after server start
  --i18n           (check) print per-locale translation coverage
  --locale <l>     (i18n:init/i18n:extract) target locale
  -h, --help       Show this help
  -v, --version    Show version`;

function toFlag(arg: string): string {
  return arg.replace(/^--?/, '').toLowerCase();
}

const VALUE_FLAGS = new Set(['root', 'config', 'outdir', 'port', 'host']);

/** Parse CLI argv (without the node binary and script path). */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: CliFlags = {};
  let positional: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;

    if (arg === '-h' || arg === '--help') {
      return { command: 'help', flags };
    }
    if (arg === '-v' || arg === '--version') {
      return { command: 'version', flags };
    }
    if (arg.startsWith('-')) {
      const key = toFlag(arg);
      const next = argv[i + 1];
      if (VALUE_FLAGS.has(key)) {
        if (next === undefined || next.startsWith('-')) {
          throw new Error(`Flag ${arg} expects a value`);
        }
        i += 1;
        if (key === 'root') flags.root = next;
        else if (key === 'config') flags.config = next;
        else if (key === 'outdir') flags.outDir = next;
        else if (key === 'port') {
          const port = Number(next);
          if (!Number.isInteger(port) || port <= 0 || port > 65535) {
            throw new Error(`Flag ${arg} expects a port number between 1 and 65535, got "${next}"`);
          }
          flags.port = port;
        } else if (key === 'host') {
          flags.host = next === 'true' ? true : next;
        }
      } else if (key === 'open') {
        flags.open = true;
      } else if (key === 'i18n') {
        flags.i18n = true;
      } else if (key === 'locale') {
        if (next === undefined || next.startsWith('-')) {
          throw new Error(`Flag ${arg} expects a value`);
        }
        i += 1;
        flags.locale = next;
      } else {
        throw new Error(`Unknown flag: ${arg}`);
      }
      continue;
    }
    if (positional === undefined) {
      positional = arg.toLowerCase();
    } else {
      throw new Error(`Unexpected extra argument: ${arg}`);
    }
  }

  const command = (positional ?? 'help').replace(/_/g, ':') as ParsedArgs['command'];
  if (!['dev', 'build', 'preview', 'check', 'info', 'i18n:init', 'i18n:extract', 'help', 'version'].includes(command)) {
    throw new Error(`Unknown command: ${positional}\n\n${USAGE}`);
  }
  return { command, flags };
}

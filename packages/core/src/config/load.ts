import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { createJiti } from 'jiti';
import { mineprojConfigSchema, type MineprojUserConfig, type ResolvedMineprojConfig } from './schema';

const CONFIG_FILENAMES = [
  'mineproj.config.ts',
  'mineproj.config.mts',
  'mineproj.config.mjs',
  'mineproj.config.js',
  'mineproj.config.json',
] as const;

export class ConfigNotFoundError extends Error {
  constructor(searched: string[]) {
    super(
      `No mineproj config found. Searched:\n${searched.map((p) => `  - ${p}`).join('\n')}\n` +
        'Create a mineproj.config.ts with at least `{ site: { title: "..." } }`.',
    );
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigLoadError extends Error {
  constructor(path: string, reason: string) {
    super(`Failed to load config ${path}:\n${reason}`);
    this.name = 'ConfigLoadError';
  }
}

function formatZodIssues(
  path: string,
  error: { issues: { path: (string | number | symbol)[]; message: string }[] },
): string {
  const lines = error.issues.map((issue) => {
    const fieldPath = issue.path.length > 0 ? issue.path.join('.') : '(root)';
    return `  ${path} · ${fieldPath}: ${issue.message}`;
  });
  return `Invalid config in ${path}:\n${lines.join('\n')}`;
}

/** Convert a character offset into a 1-based line:column pair. */
function lineColOf(source: string, position: number): { line: number; column: number } {
  const upto = source.slice(0, Math.max(0, Math.min(position, source.length)));
  const line = upto.split('\n').length;
  const column = position - upto.lastIndexOf('\n');
  return { line, column };
}

async function loadJsonConfig(path: string): Promise<unknown> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf-8');
  } catch (err) {
    throw new ConfigLoadError(path, `cannot read file: ${(err as Error).message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    const e = err as SyntaxError;
    // Node <25 messages carry "position N"; newer ones only quote the token —
    // locate it in the raw text so the error still pinpoints line/column.
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch?.[1]) {
      const { line, column } = lineColOf(raw, Number(posMatch[1]));
      throw new ConfigLoadError(path, `${e.message} (line ${line}, column ${column})`);
    }
    const tokenMatch = e.message.match(/Unexpected token '(.+?)'/);
    if (tokenMatch?.[1]) {
      const idx = raw.indexOf(tokenMatch[1]);
      if (idx >= 0) {
        const { line, column } = lineColOf(raw, idx);
        throw new ConfigLoadError(path, `${e.message} (line ${line}, column ${column})`);
      }
    }
    const endMatch = e.message.match(/Unexpected end of JSON input/i);
    if (endMatch) {
      const { line, column } = lineColOf(raw, raw.length);
      throw new ConfigLoadError(path, `${e.message} (line ${line}, column ${column})`);
    }
    throw new ConfigLoadError(path, e.message);
  }
}

async function loadModuleConfig(path: string): Promise<unknown> {
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  try {
    const mod = (await jiti.import(path)) as unknown;
    // Support `export default defineConfig({...})`, plain default objects and
    // CJS-style `module.exports = {...}` (jiti's interop already unwraps it).
    if (mod && typeof mod === 'object' && 'default' in mod && Object.keys(mod).length === 1) {
      return (mod as { default: unknown }).default;
    }
    return mod;
  } catch (err) {
    throw new ConfigLoadError(path, (err as Error).message);
  }
}

/**
 * Locate and load the raw user config (not yet validated / defaulted).
 *
 * @param root    Site root directory.
 * @param configPath Optional explicit config file (absolute or relative to root).
 */
export async function loadRawConfig(
  root: string,
  configPath?: string,
): Promise<{ path: string; user: MineprojUserConfig }> {
  const candidates = configPath ? [resolve(root, configPath)] : CONFIG_FILENAMES.map((f) => join(root, f));
  const path = candidates.find((p) => existsSync(p));
  if (!path) {
    throw new ConfigNotFoundError(candidates);
  }

  const raw = path.endsWith('.json') ? await loadJsonConfig(path) : await loadModuleConfig(path);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConfigLoadError(path, 'config default export must be an object');
  }
  return { path, user: raw as MineprojUserConfig };
}

/**
 * Load, validate and default-merge the site config.
 * Throws a `ConfigLoadError` whose message pinpoints the file and field.
 */
export async function loadConfig(
  root: string,
  configPath?: string,
): Promise<{ path: string; config: ResolvedMineprojConfig }> {
  const { path, user } = await loadRawConfig(root, configPath);
  const result = mineprojConfigSchema.safeParse(user);
  if (!result.success) {
    throw new ConfigLoadError(path, formatZodIssues(path, result.error));
  }
  return { path: isAbsolute(path) ? path : resolve(path), config: result.data };
}

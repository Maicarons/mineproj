import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createJiti } from 'jiti';
import { isMineprojPlugin } from '../plugin/contract';
import { isThemeLike, resolveThemeExtends, type Theme } from './contract';

/**
 * Theme resolution (M2-05). Accepts, in priority order:
 *   1. an inline theme object
 *   2. a shorthand: `classic` / `gallery` → `@mineproj/theme-*`
 *   3. a full package reference (`mineproj-theme-*` or scoped)
 *   4. a local `.mineproj/theme/` directory (index.ts / index.js / index.mjs)
 * Missing references fall back to `@mineproj/theme-classic`.
 */

export const DEFAULT_THEME = '@mineproj/theme-classic';

export const SHORTHANDS: Record<string, string> = {
  classic: '@mineproj/theme-classic',
  gallery: '@mineproj/theme-gallery',
};

export function expandThemeReference(reference: string): string {
  return SHORTHANDS[reference] ?? reference;
}

export class ThemeResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeResolutionError';
  }
}

function looksLikeThemeModule(mod: unknown): mod is { default: unknown } {
  return typeof mod === 'object' && mod !== null && 'default' in mod;
}

async function importThemeModule(path: string, baseDir: string): Promise<Theme> {
  const jiti = createJiti(join(baseDir, 'index.js'), { interopDefault: false });
  try {
    const mod = (await jiti.import(path)) as unknown;
    if (isThemeLike(mod)) return mod;
    if (looksLikeThemeModule(mod)) {
      const candidate = (mod as { default: unknown }).default;
      if (isThemeLike(candidate)) return candidate;
    }
    throw new ThemeResolutionError(`Module at ${path} does not export a theme`);
  } catch (err) {
    if (err instanceof ThemeResolutionError) throw err;
    throw new ThemeResolutionError(`Cannot load theme from ${path}: ${(err as Error).message}`);
  }
}

export interface ResolveThemeOptions {
  root: string;
  /** Used when the theme's own extends is a string reference. */
  loadThemeReference?: (reference: string) => Promise<Theme>;
}

/**
 * Resolve a theme reference into a fully merged theme object.
 * `reference` may be undefined (default theme), a shorthand, a package name,
 * a local directory path or an inline theme object.
 */
export async function resolveTheme(
  reference: string | Theme | undefined,
  options: ResolveThemeOptions,
): Promise<Theme> {
  const { root } = options;

  const loadReference = options.loadThemeReference ?? (async (ref: string) => {
    const expandedRef = expandThemeReference(ref);
    if (!(expandedRef.startsWith('@') || expandedRef.startsWith('mineproj-theme-'))) {
      throw new ThemeResolutionError(`Cannot resolve theme reference "${ref}"`);
    }
    return importThemeModule(expandedRef, root);
  });

  // Inline object.
  if (typeof reference === 'object' && reference !== null) {
    if (!isThemeLike(reference)) {
      throw new ThemeResolutionError('Inline theme must have a name and layouts');
    }
    return resolveThemeExtends(reference, async (ref) => loadReference(ref));
  }

  // String reference.
  const raw = reference ?? DEFAULT_THEME;
  if (typeof raw !== 'string') {
    throw new ThemeResolutionError(`Unsupported theme reference: ${String(raw)}`);
  }
  const expanded = expandThemeReference(raw);

  // Local .mineproj/theme/ directory.
  const localCandidates = ['index.ts', 'index.mts', 'index.mjs', 'index.js'].map((f) =>
    join(root, '.mineproj', 'theme', f),
  );
  const localIndex = expanded === '.mineproj/theme' ? localCandidates.find((p) => existsSync(p)) : undefined;
  if (localIndex !== undefined) {
    const local = await importThemeModule(localIndex, root);
    return resolveThemeExtends(local, (ref) => loadReference(ref));
  }

  // Package reference. Prefer the injected loader (used by the pipeline and
  // tests); fall back to importing the package from the site root.
  if (expanded.startsWith('@') || expanded.startsWith('mineproj-theme-')) {
    const theme = await loadReference(expanded);
    return resolveThemeExtends(theme, (ref) => loadReference(ref));
  }

  throw new ThemeResolutionError(
    `Cannot resolve theme "${raw}". Use a shorthand (classic/gallery), a mineproj-theme-* package, ` +
      'a .mineproj/theme/ directory or an inline theme object.',
  );
}

export { isMineprojPlugin };

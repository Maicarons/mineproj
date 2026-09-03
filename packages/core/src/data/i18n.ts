import { join } from 'node:path';
import { projectI18nOverrideSchema, type Project, type ProjectI18nOverride } from '@mineproj/schema';
import { invalidData, tryReadJson } from './loader';

/**
 * Locale override merge (M1-05).
 *
 * Priority (highest last):
 *   1. `index.<locale>.json` file next to the project data
 *   2. the `i18n.<locale>` object inside `index.json`
 *   3. the root fields of `index.json`
 *
 * Arrays are replaced wholesale; objects are deep-merged; everything else is
 * overridden when present.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (Array.isArray(override)) return override as T;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      out[key] = key in out ? deepMerge(out[key], value) : value;
    }
    return out as T;
  }
  return override as T;
}

/** The `i18n.<locale>` object inside the project's own index.json. */
export function inlineOverrideOf(project: Project, locale: string): ProjectI18nOverride | undefined {
  return project.i18n[locale];
}

/** Apply one locale override onto a project. Arrays replace, objects deep-merge. */
export function applyOverride(project: Project, override: ProjectI18nOverride | undefined): Project {
  if (override === undefined) return project;
  const out: Record<string, unknown> = { ...project };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    out[key] = deepMerge((project as Record<string, unknown>)[key], value);
  }
  return out as Project;
}

/**
 * Parse and validate a locale override file payload.
 * Throws a DataError with `file:field` detail on invalid data.
 */
export function parseLocaleOverride(file: string, raw: unknown): ProjectI18nOverride {
  const result = projectI18nOverrideSchema.safeParse(raw);
  if (!result.success) {
    throw invalidData(file, result.error);
  }
  return result.data;
}

/**
 * Candidate file names for a locale override, next to the project data:
 * `index.<locale>.json` (directory form) or `<slug>.<locale>.json` (one-file form).
 */
export function localeOverrideFilePaths(sourceFileRel: string, locale: string): string[] {
  const segments = sourceFileRel.split('/');
  const base = segments.pop() ?? '';
  if (base === 'index.json') {
    segments.push(`index.${locale}.json`);
    return [segments.join('/')];
  }
  const stem = base.replace(/\.json$/, '');
  return [`${[...segments, stem].join('/')}.${locale}.json`, `${[...segments, `index.${locale}`].join('/')}.json`];
}

/**
 * Load `index.<locale>.json` (or `<slug>.<locale>.json`) for a project.
 * Returns `undefined` when no override file exists.
 */
export async function loadLocaleOverride(
  root: string,
  sourceFileRel: string,
  locale: string,
): Promise<ProjectI18nOverride | undefined> {
  for (const rel of localeOverrideFilePaths(sourceFileRel, locale)) {
    const raw = await tryReadJson(join(root, ...rel.split('/')));
    if (raw === undefined) continue;
    return parseLocaleOverride(rel, raw);
  }
  return undefined;
}

/**
 * Produce the locale-specific view of a project, applying both the inline
 * `i18n.<locale>` object and the external `index.<locale>.json` file
 * (file wins over inline; inline wins over root).
 */
export async function localizeProject(
  root: string,
  project: Project,
  sourceFileRel: string,
  locale: string,
): Promise<Project> {
  const fileOverride = await loadLocaleOverride(root, sourceFileRel, locale);
  const inline = inlineOverrideOf(project, locale);
  return applyOverride(applyOverride(project, inline), fileOverride);
}

/**
 * Locale fallback chain (M5-03): `locale → fallbackLocale → defaultLocale`.
 */
export function resolveLocaleChain(defaultLocale: string, fallbackLocale: string | undefined, locale: string): string[] {
  const chain = [locale, fallbackLocale, defaultLocale].filter(
    (l): l is string => l !== undefined && l.length > 0,
  );
  return [...new Set(chain)];
}

export interface I18nGap {
  slug: string;
  locale: string;
  /** True when an inline `i18n.<locale>` override exists (file missing). */
  hasInline: boolean;
}

/**
 * Projects with no translation at all for `locale` (neither
 * `index.<locale>.json` nor an inline `i18n.<locale>` object).
 * Powers `mineproj check --i18n` and build warnings.
 */
export function collectI18nGaps(projects: Project[], locale: string, defaultLocale: string): I18nGap[] {
  if (locale === defaultLocale) return [];
  return projects
    .filter((p) => p.i18n[locale] === undefined)
    .map((p) => ({ slug: p.slug, locale, hasInline: false }));
}

/** RTL locales (M5-12) — dir is derived from the locale, never configured. */
const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur']);

export function dirForLocale(locale: string): 'rtl' | 'ltr' {
  const lang = locale.split(/[-_]/)[0] ?? locale;
  return RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
}

/**
 * Attachments per locale (M5-05): docs tagged with the current locale
 * (`docs[].lang` or `<basename>.<locale>.<ext>` files) come first; docs with
 * a *different* explicit locale are dropped; untagged docs act as fallback.
 */
export function selectLocalizedDocs<T extends { lang?: string; file: string }>(docs: T[], locale: string): T[] {
  const matchesLocale = (d: T): boolean =>
    d.lang === locale || new RegExp(`\.${locale}\.[a-z0-9]+$`, 'i').test(d.file);
  const otherLocale = (d: T): boolean =>
    d.lang !== undefined && d.lang !== locale;
  const preferred = docs.filter(matchesLocale);
  const fallback = docs.filter((d) => !matchesLocale(d) && !otherLocale(d));
  return [...preferred, ...fallback];
}

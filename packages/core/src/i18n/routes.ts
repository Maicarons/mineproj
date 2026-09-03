import type { RouteRecord } from '../virtual';
import { dirForLocale } from '../data/i18n';

/**
 * Locale-aware routing (M5-06): the default locale is served unprefixed
 * (unless `prefixAll`), every other locale lives under `/<locale>/…`.
 * Each page records its alternates for `hreflang` (incl. x-default).
 */

export interface LocaleRoute extends RouteRecord {
  locale: string;
  dir: 'rtl' | 'ltr';
  alternates: { locale: string; href: string }[];
}

export function prefixPath(path: string, locale: string | null): string {
  if (!locale) return path;
  if (path === '/') return `/${locale}/`;
  if (path.endsWith('/404.html')) return `/${locale}/404.html`;
  return `/${locale}${path}`;
}

export function localizedRoutes(
  routes: RouteRecord[],
  options: { locales: string[]; defaultLocale: string; prefixAll: boolean },
): LocaleRoute[] {
  const { locales, defaultLocale, prefixAll } = options;
  const out: LocaleRoute[] = [];
  for (const locale of locales) {
    const isDefault = locale === defaultLocale;
    const prefix = !isDefault || prefixAll ? locale : null;
    for (const route of routes) {
      const alternates = locales.map((alt) => {
        const altIsDefault = alt === defaultLocale;
        return {
          locale: alt,
          href: prefixPath(route.path, !altIsDefault || prefixAll ? alt : null),
        };
      });
      alternates.push({
        locale: 'x-default',
        href: prefixPath(route.path, prefixAll ? defaultLocale : null),
      });
      out.push({
        ...route,
        path: prefixPath(route.path, prefix),
        locale,
        dir: dirForLocale(locale),
        alternates,
      });
    }
  }
  return out;
}

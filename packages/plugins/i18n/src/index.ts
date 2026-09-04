/**
 * plugin-i18n (M6-12): multi-language route support, hreflang generation,
 * and language switcher data injection. This plugin extracts the i18n
 * functionality that is embedded in @mineproj/core into a standalone plugin,
 * making it optional and swappable.
 *
 * When enabled, this plugin ensures that each route has:
 * - hreflang alternates (including x-default)
 * - Language switcher data in the page context
 * - Proper locale prefix handling
 */

import type { MineprojPlugin, RouteRecord } from '@mineproj/core';

export interface I18nPluginOptions {
  /** Site URL for generating absolute hreflang URLs. */
  siteUrl: string;
  /** All enabled locales. */
  locales: string[];
  /** Default locale (unprefixed). */
  defaultLocale: string;
  /** Whether to prefix all locales including default. */
  prefixAll?: boolean;
}

/**
 * Generate hreflang tags for a route across all locales.
 */
export function buildHreflangTags(
  route: RouteRecord,
  options: I18nPluginOptions,
): string {
  const tags: string[] = [];
  const siteUrl = options.siteUrl.replace(/\/+$/, '');

  if (route.alternates) {
    for (const alt of route.alternates) {
      tags.push(
        `<link rel="alternate" hreflang="${alt.locale}" href="${siteUrl}${alt.href}">`,
      );
    }
  }

  // x-default points to the default locale version
  const defaultHref = route.alternates?.find(
    (a) => a.locale === options.defaultLocale,
  )?.href ?? route.path;
  tags.push(
    `<link rel="alternate" hreflang="x-default" href="${siteUrl}${defaultHref}">`,
  );

  return tags.join('\n');
}

/**
 * Generate language switcher data: a list of all locale+url pairs
 * for the current page, used by the LangSwitch component.
 */
export function buildLanguageSwitcherData(
  route: RouteRecord,
  options: I18nPluginOptions,
): { locale: string; label: string; url: string; active: boolean }[] {
  const siteUrl = options.siteUrl.replace(/\/+$/, '');
  const localeLabels: Record<string, string> = {
    en: 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية',
  };

  return options.locales.map((locale) => {
    const alt = route.alternates?.find((a) => a.locale === locale);
    return {
      locale,
      label: localeLabels[locale] ?? locale,
      url: alt ? `${siteUrl}${alt.href}` : `${siteUrl}/${locale}/`,
      active: locale === route.locale,
    };
  });
}

export function defineI18nPlugin(options: I18nPluginOptions): MineprojPlugin {
  return {
    name: '@mineproj/plugin-i18n',
    hooks: {
      'render:before': (html, ctx) => {
        const route = (ctx as { route?: RouteRecord }).route;
        if (!route) return html;

        const hreflang = buildHreflangTags(route, options);
        const switcherData = buildLanguageSwitcherData(route, options);

        // Inject hreflang into <head>
        let out = html.replace('</head>', `${hreflang}\n</head>`);

        // Inject language switcher data as a script tag
        const script = `<script id="mp-i18n-data" type="application/json">${JSON.stringify(switcherData)}</script>`;
        out = out.replace('</head>', `${script}\n</head>`);

        return out;
      },
    },
  };
}
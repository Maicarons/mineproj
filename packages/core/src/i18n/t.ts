/**
 * UI dictionary helper (M5-10): `t(key, params)` built from theme locale
 * dictionaries with plugin namespaces merged underneath and a fallback
 * chain locale → fallbackLocale → defaultLocale. Interpolation uses
 * `{name}` placeholders.
 */

export type LocaleDictionaries = Record<string, Record<string, string>>;

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

export function createT(
  dictionaries: LocaleDictionaries,
  locale: string,
  fallbackLocale?: string,
): TranslateFn {
  const chain = [locale, fallbackLocale, 'en', 'zh-CN']
    .filter((l, i, arr): l is string => l !== undefined && arr.indexOf(l) === i);
  return (key, params) => {
    for (const loc of chain) {
      const dict = dictionaries[loc];
      const value = dict?.[key];
      if (value !== undefined) return interpolate(value, params);
    }
    // Last resort: the key itself (visible, debuggable, never crashes).
    return interpolate(key, params);
  };
}

/** Merge plugin dictionaries under theme dictionaries (theme wins). */
export function mergeDictionaries(
  themeDict: LocaleDictionaries,
  pluginDicts: LocaleDictionaries[],
): LocaleDictionaries {
  const merged: LocaleDictionaries = { ...themeDict };
  for (const pluginDict of pluginDicts) {
    for (const [locale, dict] of Object.entries(pluginDict)) {
      merged[locale] = { ...dict, ...merged[locale] };
    }
  }
  return merged;
}

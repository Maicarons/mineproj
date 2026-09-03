import { useEffect, useState } from 'react';

/**
 * LangSwitch (M5-11): swaps the locale prefix of the current path. When the
 * target locale has no such page (checked against the known route set the
 * build embeds), it falls back to that locale's home with a notice flag.
 */

export function switchLocalePath(
  path: string,
  from: string,
  to: string,
  defaultLocale: string,
  knownPaths?: Set<string>,
): { path: string; fallback: boolean } {
  const stripPrefix = (p: string, locale: string): string =>
    p === `/${locale}/` ? '/' : p.startsWith(`/${locale}/`) ? p.slice(locale.length + 1) : p;
  const base = from === defaultLocale ? path : stripPrefix(path, from);
  const target = to === defaultLocale ? base : `/${to}${base === '/' ? '/' : base}`;
  if (knownPaths && !knownPaths.has(target)) {
    return { path: to === defaultLocale ? '/' : `/${to}/`, fallback: true };
  }
  return { path: target, fallback: false };
}

export interface LangSwitchProps {
  current: string;
  locales: string[];
  defaultLocale: string;
  knownPaths?: string[];
}

export function LangSwitch({ current, locales, defaultLocale, knownPaths }: LangSwitchProps): ReactNode {
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const go = (to: string): void => {
    if (to === current) return;
    const { path, fallback } = switchLocalePath(
      window.location.pathname,
      current,
      to,
      defaultLocale,
      knownPaths ? new Set(knownPaths) : undefined,
    );
    if (fallback) setNotice(true);
    window.location.assign(path);
  };

  return (
    <span className="mp-lang-switch">
      {notice ? (
        <span role="status" className="mp-lang-switch__notice">
          Page not available in this language — showing home.
        </span>
      ) : null}
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          className="mp-btn"
          aria-current={locale === current ? 'true' : undefined}
          onClick={() => go(locale)}
        >
          {locale}
        </button>
      ))}
    </span>
  );
}

type ReactNode = import('react').ReactNode;

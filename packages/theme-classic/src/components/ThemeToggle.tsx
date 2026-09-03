import { useEffect, useState } from 'react';

/**
 * ThemeToggle (M3-12): cycles light → dark → system, persists the choice in
 * localStorage and writes `data-theme` on <html>. Pairs with the no-flash
 * inline script the theme ships in `headScripts`.
 */

export const THEME_STORAGE_KEY = 'mp-theme';

export type ThemeChoice = 'light' | 'dark' | 'system';

export function resolveThemeChoice(choice: ThemeChoice): 'light' | 'dark' {
  if (choice !== 'system') return choice;
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyThemeChoice(choice: ThemeChoice): void {
  document.documentElement.dataset.theme = resolveThemeChoice(choice);
}

export const noFlashScript = `(function(){try{var c=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=c==='dark'||(c==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

const ORDER: ThemeChoice[] = ['light', 'dark', 'system'];
const LABEL: Record<ThemeChoice, string> = { light: 'Light', dark: 'Dark', system: 'System' };

export function ThemeToggle(): ReactNode {
  const [choice, setChoice] = useState<ThemeChoice>('system');

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeChoice | null;
    if (stored && ORDER.includes(stored)) setChoice(stored);
  }, []);

  useEffect(() => {
    applyThemeChoice(choice);
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => {
      if (choice === 'system') applyThemeChoice('system');
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [choice]);

  const cycle = (): void => {
    const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length]!;
    setChoice(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <button type="button" className="mp-btn" onClick={cycle} aria-label={`Theme: ${LABEL[choice]}`}>
      {choice === 'light' ? '☀' : choice === 'dark' ? '☾' : '◐'} {LABEL[choice]}
    </button>
  );
}

type ReactNode = import('react').ReactNode;

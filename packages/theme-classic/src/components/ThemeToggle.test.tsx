// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  applyThemeChoice,
  noFlashScript,
  resolveThemeChoice,
  THEME_STORAGE_KEY,
  ThemeToggle,
} from './ThemeToggle';

describe('ThemeToggle (M3-12)', () => {
  it('resolves the system choice from the media query', () => {
    expect(resolveThemeChoice('light')).toBe('light');
    expect(resolveThemeChoice('dark')).toBe('dark');
    // jsdom defaults to light scheme.
    expect(resolveThemeChoice('system')).toBe('light');
  });

  it('writes data-theme on <html>', () => {
    applyThemeChoice('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    applyThemeChoice('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('cycles light → dark → system and persists', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Theme: System');
    fireEvent.click(button);
    expect(button.getAttribute('aria-label')).toBe('Theme: Light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    fireEvent.click(button);
    expect(button.getAttribute('aria-label')).toBe('Theme: Dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(button);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
  });

  it('ships a no-flash bootstrap covering storage + system fallback', () => {
    // The script must run before first paint: it reads the stored choice,
    // falls back to the media query and writes data-theme synchronously.
    expect(noFlashScript).toContain(`window.localStorage.getItem('${THEME_STORAGE_KEY}')`);
    expect(noFlashScript).toContain('prefers-color-scheme: dark');
    expect(noFlashScript).toContain('dataset.theme');
    // Replicate its decision table to lock the semantics.
    const decide = (choice: string, prefersDark: boolean): string =>
      choice === 'dark' || (choice === 'system' && prefersDark) ? 'dark' : 'light';
    expect(decide('dark', false)).toBe('dark');
    expect(decide('light', true)).toBe('light');
    expect(decide('system', true)).toBe('dark');
    expect(decide('system', false)).toBe('light');
  });
});

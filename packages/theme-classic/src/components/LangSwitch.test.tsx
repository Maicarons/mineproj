// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { switchLocalePath } from './LangSwitch';

describe('LangSwitch path logic (M5-11)', () => {
  const locales = ['zh-CN', 'en'];
  const known = new Set([
    '/',
    '/projects/voxel-tool/',
    '/about/',
    '/en/',
    '/en/projects/voxel-tool/',
  ]);

  it('strips the current prefix and adds the target prefix', () => {
    expect(switchLocalePath('/en/projects/voxel-tool/', 'en', 'zh-CN', 'zh-CN', known)).toEqual({
      path: '/projects/voxel-tool/',
      fallback: false,
    });
    expect(switchLocalePath('/projects/voxel-tool/', 'zh-CN', 'en', 'zh-CN', known)).toEqual({
      path: '/en/projects/voxel-tool/',
      fallback: false,
    });
  });

  it('falls back to the target home when the page does not exist there', () => {
    // /projects/only-zh/ has no en counterpart in `known`.
    const result = switchLocalePath('/projects/only-zh/', 'zh-CN', 'en', 'zh-CN', known);
    expect(result).toEqual({ path: '/en/', fallback: true });
  });

  it('handles the root page in both directions', () => {
    expect(switchLocalePath('/en/', 'en', 'zh-CN', 'zh-CN', known).path).toBe('/');
    expect(switchLocalePath('/', 'zh-CN', 'en', 'zh-CN', known).path).toBe('/en/');
  });

  it('marks the current locale', () => {
    expect(switchLocalePath('/en/', 'en', 'en', 'zh-CN', known).path).toBe('/en/');
  });
});

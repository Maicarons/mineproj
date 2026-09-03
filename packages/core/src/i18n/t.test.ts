import { describe, expect, it } from 'vitest';
import { createT, mergeDictionaries } from './t';

const dicts = {
  'zh-CN': { 'nav.projects': '项目', 'stats.count': '{count} 个项目' },
  en: { 'nav.projects': 'Projects', 'nav.about': 'About' },
};

describe('createT (M5-10)', () => {
  it('resolves the requested locale', () => {
    const t = createT(dicts, 'zh-CN');
    expect(t('nav.projects')).toBe('项目');
  });

  it('falls back along locale → fallback → other dictionaries', () => {
    const t = createT(dicts, 'zh-CN', 'en');
    expect(t('nav.about')).toBe('About');
  });

  it('interpolates {placeholders}', () => {
    const t = createT(dicts, 'zh-CN');
    expect(t('stats.count', { count: 12 })).toBe('12 个项目');
  });

  it('returns the key itself as a visible last resort', () => {
    const t = createT(dicts, 'zh-CN');
    expect(t('missing.key')).toBe('missing.key');
  });

  it('merges plugin dictionaries underneath theme ones', () => {
    const merged = mergeDictionaries(dicts, [
      { en: { 'nav.projects': 'PLUGIN PROJECTS' } },
    ]);
    expect(merged.en['nav.projects']).toBe('Projects'); // theme wins
    const mergedPluginKey = mergeDictionaries({}, [{ en: { 'plugin.key': 'from plugin' } }]);
    expect(mergedPluginKey.en['plugin.key']).toBe('from plugin');
  });
});

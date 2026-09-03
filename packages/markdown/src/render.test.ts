import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './render';
import { makeUniqueSlug, slugifyText } from './slugify';
import { excerptOf, readingTimeOf } from './meta';

describe('slugify (M4-03)', () => {
  it('keeps CJK characters and dashes latin words', () => {
    expect(slugifyText('安装指南 Guide')).toBe('安装指南-guide');
    expect(slugifyText('Hello, World!')).toBe('hello-world');
  });

  it('uniquifies duplicate headings', () => {
    const used = new Set<string>();
    expect(makeUniqueSlug('Setup', used)).toBe('setup');
    expect(makeUniqueSlug('Setup', used)).toBe('setup-2');
    expect(makeUniqueSlug('Setup', used)).toBe('setup-3');
    expect(makeUniqueSlug('安装', used)).toBe('安装');
  });
});

describe('renderMarkdown (M4-02/03/04)', () => {
  const source = [
    '---',
    'title: Deep Dive',
    '---',
    '',
    '# Deep Dive',
    '',
    '```ts',
    'const x: number = 1;',
    '```',
    '',
    '## Usage',
    '',
    '内容正文，用于摘录测试。'.repeat(20),
    '',
    '## See also',
  ].join('\n');

  it('highlights code at build time with dual-theme variables and no runtime script', async () => {
    const result = await renderMarkdown(source);
    expect(result.html).toContain('shiki-themes');
    expect(result.html).toContain('--shiki-dark');
    expect(result.html).not.toContain('<script');
  });

  it('collects headings with unique slugs and builds a toc', async () => {
    const result = await renderMarkdown(source);
    expect(result.headings.map((h) => h.slug)).toEqual(['deep-dive', 'usage', 'see-also']);
    expect(result.toc).toEqual([
      { depth: 2, text: 'Usage', slug: 'usage' },
      { depth: 2, text: 'See also', slug: 'see-also' },
    ]);
    expect(result.html).toContain('id="usage"');
  });

  it('derives excerpt, plainText and reading time from one pass', async () => {
    const result = await renderMarkdown(source);
    expect(result.plainText).toContain('内容正文');
    expect(result.excerpt.length).toBeLessThanOrEqual(161);
    expect(result.excerpt.endsWith('…') || result.excerpt === result.plainText).toBe(true);
    expect(result.readingTime).toBeGreaterThanOrEqual(1);
    expect(result.data.title).toBe('Deep Dive');
  });

  it('degrades unknown code languages without failing', async () => {
    const result = await renderMarkdown('```not-a-lang\nplain\n```');
    expect(result.html).toContain('<pre');
  });

  it('supports language aliases (ts → typescript)', async () => {
    const result = await renderMarkdown('```ts\nconst x = 1;\n```');
    expect(result.html).toContain('language-typescript');
  });
});

describe('meta helpers', () => {
  it('caps the excerpt at 160 chars with an ellipsis', () => {
    const long = 'word '.repeat(80).trim();
    const excerpt = excerptOf(long);
    expect(excerpt.length).toBeLessThanOrEqual(161);
    expect(excerpt.endsWith('…')).toBe(true);
  });

  it('computes reading time at 200 wpm', () => {
    expect(readingTimeOf('word '.repeat(400))).toBe(2);
    expect(readingTimeOf('short')).toBe(1);
  });
});

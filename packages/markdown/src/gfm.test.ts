import { describe, expect, it } from 'vitest';
import { parseFrontMatter, renderGfm } from './index';

describe('renderGfm (M4-01)', () => {
  it('renders tables', () => {
    const html = renderGfm('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders strikethrough and autolinks', () => {
    expect(renderGfm('~~gone~~')).toContain('<s>gone</s>');
    expect(renderGfm('visit https://example.com now')).toContain('<a href="https://example.com">');
  });

  it('renders task lists with checkbox inputs', () => {
    const html = renderGfm('- [x] done\n- [ ] todo');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked');
  });

  it('renders footnotes', () => {
    const html = renderGfm('Text[^1]\n\n[^1]: The note.');
    expect(html).toContain('footnote');
    expect(html).toContain('The note.');
  });

  it('escapes raw HTML by default', () => {
    const html = renderGfm('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
});

describe('parseFrontMatter (M4-01)', () => {
  it('extracts scalars, booleans, numbers and arrays', () => {
    const { data, content } = parseFrontMatter(
      '---\ntitle: My Post\ndraft: false\nweight: 3\ntags: [web, game]\n---\n\n# Body',
    );
    expect(data).toEqual({ title: 'My Post', draft: false, weight: 3, tags: ['web', 'game'] });
    expect(content).toBe('\n# Body');
  });

  it('passes through content without front-matter', () => {
    const { data, content } = parseFrontMatter('# Just a heading');
    expect(data).toEqual({});
    expect(content).toBe('# Just a heading');
  });
});

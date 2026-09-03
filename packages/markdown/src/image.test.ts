import { describe, expect, it } from 'vitest';
import { hasTraversal, installImageRule } from './image';
import MarkdownIt from 'markdown-it';

describe('image processing (M4-05)', () => {
  it('rejects path traversal', () => {
    expect(hasTraversal('../cover.png')).toBe(true);
    expect(hasTraversal('../../etc/passwd')).toBe(true);
    expect(hasTraversal('gallery/01.png')).toBe(false);
    expect(hasTraversal('/absolute/path.png')).toBe(false);
  });

  it('installs an image rule that uses the processor', () => {
    const md = new MarkdownIt();
    installImageRule(md, (src) => ({
      src: `/processed/${src}`,
      width: 800,
      height: 600,
      srcset: `/processed/${src} 800w`,
      lqip: 'data:image/webp;base64,abc',
    }));
    const html = md.render('![alt](cover.png)');
    expect(html).toContain('/processed/cover.png');
    expect(html).toContain('width="800"');
    expect(html).toContain('height="600"');
    expect(html).toContain('srcset');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('background:url');
  });

  it('shows an error for traversal paths', () => {
    const md = new MarkdownIt();
    installImageRule(md);
    const html = md.render('![alt](../../evil.png)');
    expect(html).toContain('Invalid image path');
  });

  it('passes through external URLs', () => {
    const md = new MarkdownIt();
    const processor = () => ({ src: 'should-not-be-called' } as never);
    installImageRule(md, processor);
    const html = md.render('![alt](https://cdn.example.com/photo.jpg)');
    expect(html).toContain('https://cdn.example.com/photo.jpg');
    expect(html).not.toContain('should-not-be-called');
  });
});
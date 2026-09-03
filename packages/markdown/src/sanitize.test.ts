import { describe, expect, it } from 'vitest';
import { sanitizeHtml, XSS_VECTORS } from './sanitize';

describe('sanitize (M4-07)', () => {
  it('keeps whitelisted tags and strips dangerous ones', () => {
    expect(sanitizeHtml('<b>bold</b><script>alert(1)</script>')).toBe('<b>bold</b>alert(1)');
    expect(sanitizeHtml('<p>text</p><iframe src="evil"></iframe>')).toBe('<p>text</p>');
  });

  it('strips event handlers', () => {
    expect(sanitizeHtml('<img src="x.png" onerror="alert(1)">')).toBe('<img src="x.png">');
    expect(sanitizeHtml('<a href="/ok" onclick="nope">click</a>')).toBe('<a href="/ok">click</a>');
  });

  it('blocks javascript: URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toBe('<a>click</a>');
  });

  it('strips HTML comments', () => {
    expect(sanitizeHtml('text<!-- comment -->more')).toBe('textmore');
  });

  it('passes all XSS vectors', () => {
    for (const vector of XSS_VECTORS) {
      const result = sanitizeHtml(vector);
      // No script tags, no event handlers, no javascript: URLs
      expect(result).not.toContain('<script');
      expect(result).not.toContain('onerror=');
      expect(result).not.toContain('onload=');
      expect(result).not.toContain('onfocus=');
      expect(result).not.toContain('javascript:');
    }
  });
});
/**
 * Sanitize (M4-07): when `html: true` is set on the markdown renderer, raw
 * HTML is allowed but must be sanitized against a whitelist to prevent XSS.
 * Tags and attributes outside the whitelist are stripped.
 */

const ALLOWED_TAGS = new Set([
  'b', 'i', 'em', 'strong', 'a', 'code', 'pre', 'blockquote',
  'p', 'br', 'hr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div', 'sup', 'sub', 'del', 'ins', 'mark',
  'figure', 'figcaption', 'img', 'video', 'source',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'width', 'height',
  'class', 'id', 'style', 'target', 'rel',
  'loading', 'lang', 'dir', 'datetime', 'cite',
  'start', 'type', 'value', 'name', 'charset',
]);

const FORBIDDEN_SCHEMES = /^\s*javascript\s*:/i;
const EVENT_HANDLER = /^on\w+$/i;

export function sanitizeHtml(html: string): string {
  // Strip HTML comments
  let result = html.replace(/<!--[\s\S]*?-->/g, '');

  // Strip tags not in the whitelist
  result = result.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_match, close, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      // Strip the tag but keep its content
      return '';
    }

    // Process attributes
    if (close) return `</${tag}>`;

    const safeAttrs = attrs.replace(/([a-zA-Z][a-zA-Z0-9]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g, (_m: string, name: string, dq?: string, sq?: string, uq?: string) => {
      const attrName = name.toLowerCase();
      if (EVENT_HANDLER.test(attrName)) return '';
      if (!ALLOWED_ATTRS.has(attrName)) return '';

      const value = dq ?? sq ?? uq ?? '';
      if (attrName === 'href' && FORBIDDEN_SCHEMES.test(value)) return '';
      if (attrName === 'src' && FORBIDDEN_SCHEMES.test(value)) return '';

      return ` ${attrName}="${value.replace(/"/g, '&quot;')}"`;
    });

    const cleaned = safeAttrs.trim().replace(/\s+/g, ' ');
return `<${tag}${cleaned ? ' ' + cleaned : ''}>`;
  });

  return result;
}

/** XSS test vectors that must all be neutralized. */
export const XSS_VECTORS = [
  '<script>alert(1)</script>',
  '<img onerror="alert(1)" src=x>',
  '<a href="javascript:alert(1)">click</a>',
  '<svg onload="alert(1)"></svg>',
  '<!--[if IE]><script>alert(1)</script><![endif]-->',
  '<img src="x" onerror="alert(1)">',
  '<body onload="alert(1)">',
  '<input onfocus="alert(1)" autofocus>',
];
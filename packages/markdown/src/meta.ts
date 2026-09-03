/** Content metadata (M4-04): plain text, excerpt and reading time. */

export const EXCERPT_LENGTH = 160;
const WORDS_PER_MINUTE = 200;

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerptOf(plainText: string, length = EXCERPT_LENGTH): string {
  if (plainText.length <= length) return plainText;
  const cut = plainText.slice(0, length);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function readingTimeOf(plainText: string): number {
  const words = plainText.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

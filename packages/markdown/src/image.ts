import type MarkdownIt from 'markdown-it';

/**
 * Image processing (M4-05): the markdown renderer calls an `imageProcessor`
 * callback for every image. The processor returns width/height/srcset/LQIP so
 * the template can reserve layout space (no CLS) and serve responsive images.
 * Relative paths with `../` are rejected.
 */

export interface ImageProcessorResult {
  src: string;
  width?: number;
  height?: number;
  srcset?: string;
  lqip?: string;
}

export type ImageProcessor = (src: string, alt: string) => ImageProcessorResult | Promise<ImageProcessorResult | null> | null;

export function hasTraversal(path: string): boolean {
  return path.includes('..');
}

export function installImageRule(md: MarkdownIt, processor?: ImageProcessor): void {
  const defaultImageRender = md.renderer.rules.image ?? ((tokens, idx, _options, _env, self) => self.renderToken(tokens, idx, _options));

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (!token) return defaultImageRender(tokens, idx, options, env, self);
    const src = token.attrGet('src') ?? '';
    const alt = token.attrGet('alt') ?? '';

    // Reject path traversal
    if (hasTraversal(src)) {
      return `<span style="color:red">[Invalid image path: ${src}]</span>`;
    }

    // Skip external URLs and data URIs
    if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) {
      return defaultImageRender(tokens, idx, options, env, self);
    }

    if (!processor) return defaultImageRender(tokens, idx, options, env, self);

    // Synchronously try to get the result; if async, return a placeholder
    const result = processor(src, alt);
    if (result === null) return defaultImageRender(tokens, idx, options, env, self);
    if (result instanceof Promise) {
      // Async processor not supported in sync render — return placeholder
      return defaultImageRender(tokens, idx, options, env, self);
    }

    // Build the <img> tag with width, height, srcset, and lqip
    const attrs: string[] = [`src="${result.src}"`, `alt="${alt}"`];
    if (result.width && result.height) {
      attrs.push(`width="${result.width}"`, `height="${result.height}"`);
    }
    if (result.srcset) {
      attrs.push(`srcset="${result.srcset}"`);
    }
    if (result.lqip) {
      attrs.push(`style="background:url('${result.lqip}') no-repeat center/cover;background-size:cover"`);
    }
    attrs.push('loading="lazy"');
    return `<img ${attrs.join(' ')}>`;
  };
}
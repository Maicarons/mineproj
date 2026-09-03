/**
 * Image pipeline (M2-15): generates 480/960/1440/1920 webp + avif variants
 * (capped at the natural size — no upscaling), a tiny inline LQIP placeholder
 * and `srcset` strings. Explicit width/height flow back to the caller so
 * templates can reserve layout space (no CLS).
 */

export const IMAGE_SIZES = [480, 960, 1440, 1920] as const;

export type ImageFormat = 'webp' | 'avif';

export interface ImageVariant {
  width: number;
  format: ImageFormat;
  /** Output file name (inside the image output directory). */
  fileName: string;
}

export interface ImagePipelineResult {
  width: number;
  height: number;
  /** Inline blur-up placeholder (`data:image/webp;base64,…`). */
  lqip: string;
  variants: ImageVariant[];
}

/** Build a `srcset` attribute value from variants for one format. */
export function buildSrcSet(variants: ImageVariant[], baseUrlFor: (fileName: string) => string, format: ImageFormat): string {
  return variants
    .filter((v) => v.format === format)
    .map((v) => `${baseUrlFor(v.fileName)} ${v.width}w`)
    .join(', ');
}

async function loadSharp(): Promise<typeof import('sharp')> {
  try {
    const mod = await import('sharp');
    return (mod as { default: typeof import('sharp') }).default ?? mod;
  } catch (err) {
    throw new Error(
      `The image pipeline requires "sharp": ${(err as Error).message}. Install it with: pnpm add sharp`,
    );
  }
}

/**
 * Process one source image into all variants + LQIP.
 * @param srcAbs     absolute path of the source image
 * @param outDirAbs  absolute directory receiving variant files
 * @param baseName   file name stem for variants, e.g. `cover`
 */
export async function processImage(
  srcAbs: string,
  outDirAbs: string,
  baseName: string,
): Promise<ImagePipelineResult> {
  const sharp = await loadSharp();
  const { mkdir } = await import('node:fs/promises');
  await mkdir(outDirAbs, { recursive: true });

  const image = sharp(srcAbs);
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (width === 0 || height === 0) {
    throw new Error(`Cannot read image dimensions of ${srcAbs}`);
  }

  const variants: ImageVariant[] = [];
  for (const size of IMAGE_SIZES) {
    if (size > width) continue; // never upscale
    for (const format of ['webp', 'avif'] as ImageFormat[]) {
      const fileName = `${baseName}-${size}w.${format}`;
      const resize = image.clone().resize({ width: size });
      if (format === 'webp') {
        await resize.webp({ quality: 80 }).toFile(join(outDirAbs, fileName));
      } else {
        await resize.avif({ quality: 60 }).toFile(join(outDirAbs, fileName));
      }
      variants.push({ width: size, format, fileName });
    }
  }

  // LQIP: 20px-wide webp inlined as base64 (well under 1KB).
  const lqipBuffer = await image.clone().resize({ width: 20 }).webp({ quality: 30 }).toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

  return { width, height, lqip, variants };
}

function join(...parts: string[]): string {
  return parts.join('/');
}

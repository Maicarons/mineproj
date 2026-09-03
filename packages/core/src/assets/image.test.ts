import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildSrcSet, processImage } from './image';

let dir: string;

/** Minimal PNG writer so the test does not need a binary fixture. */
function makePng(width: number, height: number, rgb: [number, number, number]): Buffer {
  const chunk = (type: string, data: Buffer): Buffer => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crcTable: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
    let crc = 0xffffffff;
    for (const byte of body) crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
    crc = (crc ^ 0xffffffff) >>> 0;
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc);
    return Buffer.concat([len, body, crcBuf]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    raw[rowStart] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const o = rowStart + 1 + x * 3;
      raw[o] = rgb[0];
      raw[o + 1] = rgb[1];
      raw[o + 2] = rgb[2];
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}


beforeEach(async () => {
  dir = join(tmpdir(), `mineproj-img-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
});

afterEach(async () => {
  const { rm } = await import('node:fs/promises');
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe('processImage', () => {
  it('generates webp and avif variants up to the natural size', async () => {
    const src = join(dir, 'cover.png');
    await writeFile(src, makePng(1000, 600, [40, 90, 200]));
    const result = await processImage(src, dir, 'cover');
    // 1000px natural width → 480 and 960 only (no upscaling to 1440/1920).
    expect(result.width).toBe(1000);
    expect(result.height).toBe(600);
    const formats = result.variants.map((v) => `${v.width}w-${v.format}`);
    expect(formats).toEqual(['480w-webp', '480w-avif', '960w-webp', '960w-avif']);
  });

  it('writes every variant file into the output directory', async () => {
    const src = join(dir, 'shot.png');
    await writeFile(src, makePng(500, 300, [10, 120, 90]));
    const result = await processImage(src, dir, 'shot');
    const { stat } = await import('node:fs/promises');
    for (const variant of result.variants) {
      await expect(stat(join(dir, variant.fileName))).resolves.toBeDefined();
    }
  });

  it('produces an inline LQIP placeholder under 1KB', async () => {
    const src = join(dir, 'cover.png');
    await writeFile(src, makePng(1200, 675, [200, 60, 40]));
    const result = await processImage(src, dir, 'cover');
    expect(result.lqip.startsWith('data:image/webp;base64,')).toBe(true);
    expect(result.lqip.length).toBeLessThan(1024);
  });

  it('builds srcset strings per format', () => {
    const variants = [
      { width: 480, format: 'webp' as const, fileName: 'c-480w.webp' },
      { width: 960, format: 'webp' as const, fileName: 'c-960w.webp' },
      { width: 480, format: 'avif' as const, fileName: 'c-480w.avif' },
    ];
    expect(buildSrcSet(variants, (f) => `/img/${f}`, 'webp')).toBe(
      '/img/c-480w.webp 480w, /img/c-960w.webp 960w',
    );
    expect(buildSrcSet(variants, (f) => `/img/${f}`, 'avif')).toBe('/img/c-480w.avif 480w');
  });

  it('rejects unreadable images with a clear error', async () => {
    const src = join(dir, 'broken.png');
    await writeFile(src, 'not an image');
    await expect(processImage(src, dir, 'broken')).rejects.toThrow();
  });
});

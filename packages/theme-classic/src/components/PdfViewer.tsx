import { useEffect, useRef, useState } from 'react';
import { Button } from './base';

/**
 * PdfViewer (M4-10/11/12/13): lazy-loads pdfjs-dist on demand, renders
 * one page at a time with a toolbar for navigation, zoom and fullscreen.
 * Three-level degradation: L1 viewer → L2 iframe → L3 download link.
 */

const SANDBOX_IFRAME = 'allow-scripts allow-same-origin';

export interface PdfViewerProps {
  file: string;
  title: string;
  pages?: number;
  size?: number;
  cover?: string;
  preview?: 'viewer' | 'iframe' | 'cover';
}

export function PdfViewer({ file, title, pages, size, cover, preview = 'viewer' }: PdfViewerProps): ReactNode {
  const [level, setLevel] = useState<'viewer' | 'iframe' | 'cover'>(preview);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<{ numPages: number; getPage: (n: number) => Promise<{ render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => void }> } | null>(null);

  // L1: pdf.js viewer
  useEffect(() => {
    if (level !== 'viewer') return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        const pdf = await pdfjsLib.getDocument(file).promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        renderPage(1, pdf, scale);
      } catch {
        if (!cancelled) setLevel('iframe');
      }
    })();
    return () => { cancelled = true; };
  }, [level]);

  useEffect(() => {
    if (pdfDocRef.current) renderPage(pageNum, pdfDocRef.current, scale);
  }, [pageNum, scale]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pdfjs API is dynamic
  async function renderPage(num: number, pdf: any, s: number): Promise<void> {
    const canvas = canvasRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const page = await pdf.getPage(num);
    const viewport = page.getViewport({ scale: s });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  const sizeLabel = size ? `${(size / 1024 / 1024).toFixed(1)} MB` : '';
  const pagesLabel = pages ? `${pages} pages` : '';

  if (level === 'cover') {
    return (
      <figure className="mp-panel">
        {cover ? <img src={cover} alt="" style={{ width: '100%', maxWidth: 320 }} /> : null}
        <figcaption>
          <strong>{title}</strong>
          {pagesLabel || sizeLabel ? <span> ({pagesLabel}{pagesLabel && sizeLabel ? ' · ' : ''}{sizeLabel})</span> : null}
        </figcaption>
        <p>
          <a href={file} download>Download PDF</a>
          {' · '}
          <a href={file} target="_blank" rel="noopener noreferrer">Open in new window</a>
        </p>
      </figure>
    );
  }

  if (level === 'iframe') {
    return (
      <figure className="mp-panel">
        <iframe src={file} title={title} sandbox={SANDBOX_IFRAME} style={{ width: '100%', height: 600, border: '1px solid var(--mp-color-border)' }} />
        <figcaption>
          <Button onClick={() => setLevel('cover')}>Show download link</Button>
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="mp-panel mp-pdf-viewer">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <Button onClick={() => setPageNum(Math.max(1, pageNum - 1))} aria-label="Previous page">←</Button>
        <span>
          <input
            type="number"
            value={pageNum}
            min={1}
            max={pages ?? pdfDocRef.current?.numPages ?? 1}
            onChange={(e) => setPageNum(Math.max(1, Math.min(Number(e.target.value), pages ?? pdfDocRef.current?.numPages ?? 1)))}
            style={{ width: 50, textAlign: 'center' }}
          />
          {' / '}{pages ?? pdfDocRef.current?.numPages ?? '?'}
        </span>
        <Button onClick={() => setPageNum(Math.min(pages ?? pdfDocRef.current?.numPages ?? 1, pageNum + 1))} aria-label="Next page">→</Button>
        <Button onClick={() => setScale(scale * 1.2)}>+</Button>
        <Button onClick={() => setScale(Math.max(0.5, scale / 1.2))}>−</Button>
        <Button onClick={() => setScale(1.5)}>0</Button>
        <Button onClick={() => canvasRef.current?.requestFullscreen?.()} aria-label="Fullscreen">⛶</Button>
        <Button onClick={() => setLevel('iframe')}>Fallback</Button>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', border: '1px solid var(--mp-color-border)' }} />
    </div>
  );
}

/** Build-time PDF info: count pages and size from a buffer. */
export function probePdfInfo(buffer: Buffer): { pages: number; size: number } {
  const text = buffer.toString('binary');
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return { pages: matches?.length ?? 1, size: buffer.length };
}

type ReactNode = import('react').ReactNode;
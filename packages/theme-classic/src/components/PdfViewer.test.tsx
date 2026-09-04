import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PdfViewer, probePdfInfo } from './PdfViewer';

describe('PdfViewer (M4-10/11/12/13)', () => {
  it('renders the cover level with download and open links', () => {
    const html = renderToString(<PdfViewer file="/docs/paper.pdf" title="Paper" preview="cover" pages={12} size={2048000} />);
    expect(html).toContain('Paper');
    expect(html).toContain('12 pages');
    expect(html).toContain('2.0 MB');
    expect(html).toContain('Download PDF');
    expect(html).toContain('download');
  });

  it('renders the iframe level with sandbox', () => {
    const html = renderToString(<PdfViewer file="/docs/paper.pdf" title="Paper" preview="iframe" />);
    expect(html).toContain('sandbox');
    expect(html).toContain('Show download link');
  });

  it('renders the viewer level with toolbar', () => {
    const html = renderToString(<PdfViewer file="/docs/paper.pdf" title="Paper" preview="viewer" />);
    expect(html).toContain('mp-pdf-viewer');
    expect(html).toContain('Fallback');
  });

  it('probes PDF metadata from binary buffer', () => {
    const buffer = Buffer.from('/Type /Page\n/Type /Page\n/Type /Page\nendobj', 'binary');
    const info = probePdfInfo(buffer);
    expect(info.pages).toBe(3);
    expect(info.size).toBe(buffer.length);
  });
});
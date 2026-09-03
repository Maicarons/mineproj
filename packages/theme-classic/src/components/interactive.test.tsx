// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  DiscoveryQueue,
  PlayableFrame,
  SANDBOX_DEFAULT,
  SearchPalette,
  searchDocs,
  scoreDoc,
  type SearchDoc,
} from './interactive';

type ReactNode = import('react').ReactNode;

describe('PlayableFrame (M3-08)', () => {
  const frame = (trusted = false): ReactNode => (
    <PlayableFrame entry="/demos/x/index.html" title="Demo" trusted={trusted} />
  );

  it('never emits allow-same-origin for untrusted demos', () => {
    const html = render(<>{frame(false)}</>).container.innerHTML;
    expect(html).not.toContain('allow-same-origin');
  });

  it('keeps the sandbox free of allow-same-origin by default', () => {
    expect(SANDBOX_DEFAULT).not.toContain('allow-same-origin');
  });

  it('lazy-mounts the iframe only after the user opts in', () => {
    const { container } = render(frame());
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(within(container).getByText('Run demo'));
    expect(container.querySelector('iframe')).not.toBeNull();
    expect(container.querySelector('iframe')?.getAttribute('sandbox')).toContain('allow-scripts');
  });

  it('adds allow-same-origin only when trusted', () => {
    const { container } = render(frame(true));
    fireEvent.click(within(container).getByText('Run demo'));
    expect(container.querySelector('iframe')?.getAttribute('sandbox')).toContain('allow-same-origin');
  });
});

const docs: SearchDoc[] = [
  { id: 'a', name: 'Voxel Tool', tagline: 'voxel editor', summary: '3d editing in the browser', tags: 'web game' },
  { id: 'b', name: 'CSV Wrangler', tagline: 'csv cli', summary: 'wrangle spreadsheets', tags: 'cli tool' },
];

describe('SearchPalette (M3-09)', () => {
  it('weights name over tags over tagline over summary', () => {
    const doc: SearchDoc = { id: 'x', name: 'vo', tags: 'vo', tagline: 'vo', summary: 'vo' };
    expect(scoreDoc(doc, 'vo')).toBe(7.5);
    expect(scoreDoc({ ...doc, name: 'other' }, 'vo')).toBe(4.5);
  });

  it('sorts by score and returns empty for no match', () => {
    const hits = searchDocs(docs, 'voxel');
    expect(hits.map((d) => d.id)).toEqual(['a']);
    expect(searchDocs(docs, 'zzz')).toEqual([]);
    // 'tool' matches a's *name* ("Voxel Tool", weight 3) and b's tags (2).
    expect(searchDocs(docs, 'tool').map((d) => d.id)).toEqual(['a', 'b']);
  });

  it('opens the palette on "/" and shows a no-results state', async () => {
    render(<SearchPalette documents={docs} />);
    fireEvent.keyDown(document, { key: '/' });
    const input = screen.getByRole('searchbox');
    expect(input).toBeDefined();
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.getByText(/No results/)).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
  });
});

describe('DiscoveryQueue (M3-11)', () => {
  it('picks a deterministic random queue of five and advances', () => {
    const { getByText } = render(
      <DiscoveryQueue slugs={['a', 'b', 'c', 'd', 'e', 'f']} seed={42} />,
    );
    expect(getByText(/Try this one/)).toBeDefined();
    fireEvent.click(getByText('Next'));
    expect(getByText(/Try this one/)).toBeDefined();
    // Advances through the remaining four entries to the finished state.
    for (let i = 0; i < 4; i++) fireEvent.click(getByText('Next'));
    expect(getByText(/Queue finished/)).toBeDefined();
  });

  it('is stable for the same seed', () => {
    const { getByText } = render(<DiscoveryQueue slugs={['a', 'b', 'c']} seed={7} />);
    const first = getByText(/Try this one/).textContent;
    const second = render(<DiscoveryQueue slugs={['a', 'b', 'c']} seed={7} />);
    expect(within(second.container).getByText(/Try this one/).textContent).toBe(first);
    second.unmount();
  });
});

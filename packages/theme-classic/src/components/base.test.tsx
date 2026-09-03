// @vitest-environment jsdom
import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import {
  Button,
  Modal,
  Pagination,
  SearchBox,
  Select,
  Skeleton,
  Switch,
  Tag,
  Tooltip,
} from './base';

describe('base components (M3-02)', () => {
  it('Button renders primary/default variants', () => {
    expect(renderToString(<Button>Go</Button>)).toContain('mp-btn');
    expect(renderToString(<Button variant="primary">Go</Button>)).toContain('mp-btn--primary');
  });

  it('Tag renders as link or pill', () => {
    expect(renderToString(<Tag label="web" href="/tags/web/" />)).toContain('href="/tags/web/"');
    expect(renderToString(<Tag label="web" />)).not.toContain('<a');
  });

  it('SearchBox and Select are labelled for screen readers', () => {
    expect(renderToString(<SearchBox />)).toContain('aria-label="Search projects"');
    expect(
      renderToString(
        <Select label="Sort order" onChange={() => {}}>
          <option>newest</option>
        </Select>,
      ),
    ).toContain('aria-label="Sort order"');
  });

  it('Tooltip pairs a visible trigger with a role=tooltip body', () => {
    const html = renderToString(
      <Tooltip label="Open repository">
        <button type="button">repo</button>
      </Tooltip>,
    );
    expect(html).toContain('role="tooltip"');
  });

  it('Pagination marks the current page with aria-current', () => {
    const html = renderToString(
      <Pagination
        items={[
          { page: 1, href: '/?page=1', current: true },
          { page: 2, href: '/?page=2', current: false },
        ]}
      />,
    );
    expect(html).toContain('aria-current="page"');
  });

  it('Switch renders role=switch and toggles via click', () => {
    function Harness(): ReactNode {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onChange={setOn} label="Exclude archived" />;
    }
    render(<Harness />);
    const sw = screen.getByRole('switch');
    expect(sw.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('true');
  });

  it('Skeleton is hidden from assistive tech', () => {
    expect(renderToString(<Skeleton />)).toContain('aria-hidden');
  });

  it('Modal renders dialog semantics when open and nothing when closed', () => {
    const open = renderToString(
      <Modal open onClose={() => {}} title="Search">
        <SearchBox />
      </Modal>,
    );
    expect(open).toContain('role="dialog"');
    expect(open).toContain('aria-modal="true"');
    expect(renderToString(<Modal open={false} onClose={() => {}} title="x"><span /></Modal>)).not.toContain(
      'role="dialog"',
    );
  });

  it('Modal closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Search">
        <SearchBox />
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Modal traps Tab focus inside the dialog', () => {
    render(
      <Modal open onClose={() => {}} title="Trap">
        <button type="button">first</button>
        <button type="button">last</button>
      </Modal>,
    );
    // The close button (✕) is the first focusable in DOM order.
    const all = screen.getAllByRole('button');
    expect(all[0]?.textContent).toBe('✕');
    all[all.length - 1]!.focus();
    // Tab from the last element wraps to the first.
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement?.textContent).toBe('✕');
    // Shift+Tab from the first wraps to the last.
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement?.textContent).toBe('last');
  });
});

type ReactNode = import('react').ReactNode;

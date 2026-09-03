import { useEffect, useRef, useState } from 'react';
import { Button, Modal, SearchBox } from './base';

/**
 * Interactive islands (M3-08/09/11): PlayableFrame (lazy sandboxed iframe),
 * SearchPalette (Cmd/Ctrl+K command palette over a MiniSearch index) and
 * DiscoveryQueue (random re-discovery with localStorage history).
 */

export const SANDBOX_DEFAULT = 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox';

export interface PlayableFrameProps {
  entry: string;
  sandbox?: string;
  trusted?: boolean;
  title: string;
  height?: number;
  timeoutMs?: number;
}

export function PlayableFrame({
  entry,
  sandbox = SANDBOX_DEFAULT,
  trusted = false,
  title,
  height = 480,
  timeoutMs = 15_000,
}: PlayableFrameProps): ReactNode {
  // Security invariant: never grant allow-same-origin unless explicitly trusted.
  const effectiveSandbox = trusted && !sandbox.includes('allow-same-origin')
    ? `${sandbox} allow-same-origin`
    : sandbox;
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!mounted || failed) return;
    const timer = setTimeout(() => setFailed(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [mounted, failed, timeoutMs]);

  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as { type?: string; height?: number };
      if (data?.type === 'mp-demo-resize' && typeof data.height === 'number' && frameRef.current) {
        frameRef.current.style.height = `${data.height}px`;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (failed) {
    return (
      <div className="mp-panel">
        <p>The demo could not be loaded inside the page.</p>
        <Button variant="primary" onClick={() => window.open(entry, '_blank', 'noopener')}>
          Open demo in a new window
        </Button>
      </div>
    );
  }

  return (
    <figure className="mp-playable mp-panel">
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {!mounted ? (
          <Button variant="primary" onClick={() => setMounted(true)}>
            Run demo
          </Button>
        ) : (
          <>
            <Button onClick={() => frameRef.current?.requestFullscreen?.()}>Fullscreen</Button>
            <Button onClick={() => window.open(entry, '_blank', 'noopener')}>New window</Button>
          </>
        )}
      </div>
      {mounted ? (
        <iframe
          ref={frameRef}
          src={entry}
          title={title}
          sandbox={effectiveSandbox}
          style={{ width: '100%', height, border: '1px solid var(--mp-color-border)' }}
          loading="lazy"
        />
      ) : (
        <div style={{ height, display: 'grid', placeItems: 'center', background: 'var(--mp-color-surface-alt)' }}>
          Demo loads on demand.
        </div>
      )}
    </figure>
  );
}

export interface SearchDoc {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  tags: string;
}

/** Weighted scoring identical to the plan §10.4: name 3 / tags 2 / tagline 1.5 / summary 1. */
export function scoreDoc(doc: SearchDoc, query: string): number {
  const q = query.toLowerCase();
  if (!q) return 0;
  const hit = (field: string, weight: number): number =>
    field.toLowerCase().includes(q) ? weight : 0;
  return hit(doc.name, 3) + hit(doc.tags, 2) + hit(doc.tagline, 1.5) + hit(doc.summary, 1);
}

export function searchDocs(docs: SearchDoc[], query: string): SearchDoc[] {
  return docs
    .map((doc) => ({ doc, score: scoreDoc(doc, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.name.localeCompare(b.doc.name))
    .map((r) => r.doc);
}

export function SearchPalette({ documents }: { documents: SearchDoc[] }): ReactNode {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = searchDocs(documents, query);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-label="Open search" aria-keyshortcuts="/">
        Search
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Search projects">
        <SearchBox
          autoFocus
          value={query}
          onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
        />
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {results.map((doc) => (
            <li key={doc.id}>
              <a href={`/projects/${doc.id}/`}>
                <strong>{doc.name}</strong> — {doc.tagline}
              </a>
            </li>
          ))}
        </ul>
        {query.length > 0 && results.length === 0 ? <p>No results for “{query}”.</p> : null}
      </Modal>
    </>
  );
}

export interface DiscoveryQueueProps {
  slugs: string[];
  /** Stable seed keeps the queue deterministic for tests. */
  seed?: number;
}

function pickRandom(slugs: string[], count: number, seed: number): string[] {
  const pool = [...slugs];
  const picked: string[] = [];
  let state = seed;
  while (picked.length < Math.min(count, slugs.length)) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const index = state % pool.length;
    picked.push(pool.splice(index, 1)[0]!);
  }
  return picked;
}

export function DiscoveryQueue({ slugs, seed = 20260903 }: DiscoveryQueueProps): ReactNode {
  const [queue] = useState(() => pickRandom(slugs, 5, seed));
  const [seen, setSeen] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem('mp-discovery-seen');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [position, setPosition] = useState(0);

  const record = (slug: string): void => {
    const next = [...new Set([slug, ...seen])].slice(0, 100);
    setSeen(next);
    try {
      window.localStorage.setItem('mp-discovery-seen', JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const current = queue[position];
  if (!current) {
    return (
      <div className="mp-panel">
        <p>Queue finished — you explored {queue.length} project(s).</p>
        <Button
          onClick={() => {
            setPosition(0);
            setSeen([]);
          }}
        >
          Restart
        </Button>
      </div>
    );
  }
  return (
    <div className="mp-panel">
      <p>
        Try this one: <a href={`/projects/${current}/`}>{current}</a>
      </p>
      <Button
        onClick={() => {
          record(current);
          setPosition((p) => p + 1);
        }}
      >
        Next
      </Button>
    </div>
  );
}

type ReactNode = import('react').ReactNode;

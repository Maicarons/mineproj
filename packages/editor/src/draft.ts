/**
 * Draft/Diff (M9-10): manages a working draft with localStorage persistence
 * and computes visual diffs before saving.
 */

export interface Draft {
  path: string;
  data: Record<string, unknown>;
  original: Record<string, unknown>;
  timestamp: number;
}

const DRAFT_KEY_PREFIX = 'mp-editor-draft-';

export function saveDraft(path: string, data: Record<string, unknown>, original: Record<string, unknown>): void {
  const draft: Draft = { path, data, original, timestamp: Date.now() };
  try {
    localStorage.setItem(DRAFT_KEY_PREFIX + path.replace(/[/\\]/g, '_'), JSON.stringify(draft));
  } catch {
    // Storage full or unavailable
  }
}

export function loadDraft(path: string): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY_PREFIX + path.replace(/[/\\]/g, '_'));
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

export function clearDraft(path: string): void {
  try {
    localStorage.removeItem(DRAFT_KEY_PREFIX + path.replace(/[/\\]/g, '_'));
  } catch {
    // ignore
  }
}

export function computeDiffSummary(draft: Draft): { field: string; before: string; after: string }[] {
  const changes: { field: string; before: string; after: string }[] = [];
  const allKeys = new Set([...Object.keys(draft.original), ...Object.keys(draft.data)]);
  for (const key of allKeys) {
    const before = JSON.stringify(draft.original[key] ?? '');
    const after = JSON.stringify(draft.data[key] ?? '');
    if (before !== after) {
      changes.push({
        field: key,
        before: draft.original[key] !== undefined ? String(draft.original[key]) : '(empty)',
        after: draft.data[key] !== undefined ? String(draft.data[key]) : '(empty)',
      });
    }
  }
  return changes;
}

/** Preview pane (M9-12): generates an iframe URL for live preview. */
export function getPreviewUrl(baseUrl: string, slug: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/projects/${slug}/`;
}
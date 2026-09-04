import { useState, type ReactNode } from 'react';

/**
 * MediaPanel (M9-07): editing cover, gallery, and docs arrays with
 * sorting, add/delete, and PDF page count / file size display.
 */

export interface MediaItem {
  path: string;
  alt?: string;
  caption?: string;
  /** For docs: page count, file size, etc. */
  pages?: number;
  size?: number;
  type?: string;
}

export interface MediaPanelProps {
  label: string;
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  /** Allow sortable reordering (default: true). */
  sortable?: boolean;
  /** Allowed MIME types for file picker. */
  accept?: string;
}

export function MediaPanel({ label, items, onChange, sortable = true, accept = 'image/*' }: MediaPanelProps): ReactNode {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const addItem = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const item: MediaItem = {
          path: url,
          alt: file.name,
          size: file.size,
          type: file.type,
        };
        onChange([...items, item]);
      }
    };
    input.click();
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateItem = (index: number, updates: Partial<MediaItem>) => {
    const updated = items.map((item, i) => (i === index ? { ...item, ...updates } : item));
    onChange(updated);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    if (moved) updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="mp-media-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="mp-field__label">{label}</span>
        <span className="mp-media-count">({items.length})</span>
        <button type="button" className="mp-btn mp-btn--small" onClick={addItem}>+ Add</button>
      </div>
      {items.length === 0 && <p className="mp-media-empty" style={{ color: '#999', fontStyle: 'italic' }}>No items yet</p>}
      <div className="mp-media-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, index) => (
          <div
            key={index}
            className="mp-media-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 12px',
              border: '1px solid var(--mp-color-border, #ddd)',
              borderRadius: 6,
              background: dragIndex === index ? 'var(--mp-color-bg-hover, #f0f0f0)' : undefined,
            }}
          >
            {item.path.match(/^blob:/) || item.path.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
              <img
                src={item.path}
                alt={item.alt ?? ''}
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: 48, height: 48, background: '#eee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.path.match(/\.pdf$/i) ? 'PDF' : '📄'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                type="text"
                className="mp-input"
                value={item.path}
                onChange={(e) => updateItem(index, { path: e.target.value })}
                placeholder="Path or URL"
                style={{ fontSize: 13, marginBottom: 4 }}
                aria-label={`${label} path ${index + 1}`}
              />
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#666' }}>
                {item.size && <span>{(item.size / 1024).toFixed(1)} KB</span>}
                {item.pages !== undefined && <span>{item.pages} pages</span>}
                {item.type && <span>{item.type}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {sortable && index > 0 && (
                <button
                  type="button"
                  className="mp-btn mp-btn--icon"
                  onClick={() => moveItem(index, index - 1)}
                  title="Move up"
                  aria-label="Move up"
                >↑</button>
              )}
              {sortable && index < items.length - 1 && (
                <button
                  type="button"
                  className="mp-btn mp-btn--icon"
                  onClick={() => moveItem(index, index + 1)}
                  title="Move down"
                  aria-label="Move down"
                >↓</button>
              )}
              <button
                type="button"
                className="mp-btn mp-btn--danger"
                onClick={() => removeItem(index)}
                title="Remove"
                aria-label="Remove"
              >×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
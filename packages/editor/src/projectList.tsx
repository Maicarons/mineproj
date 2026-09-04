import { useState, type ReactNode } from 'react';

/**
 * ProjectList (M9-09): search, create, copy, delete, drag sort, and batch tag
 * editing for projects in the editor.
 */

export interface ProjectListItem {
  slug: string;
  name: string;
  tagline?: string;
  tags?: string[];
  status?: string;
  updatedAt?: string;
}

export interface ProjectListProps {
  items: ProjectListItem[];
  activeSlug?: string;
  onSelect: (slug: string) => void;
  onCreate: () => void;
  onCopy: (slug: string) => void;
  onDelete: (slug: string) => Promise<boolean>;
  onReorder: (slugs: string[]) => void;
  onBatchTag: (slugs: string[], tag: string) => void;
}

export function ProjectList({
  items,
  activeSlug,
  onSelect,
  onCreate,
  onCopy,
  onDelete,
  onReorder,
  onBatchTag,
}: ProjectListProps): ReactNode {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [batchTag, setBatchTag] = useState('');

  const filtered = search
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.slug.toLowerCase().includes(search.toLowerCase()) ||
          item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  const toggleSelect = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((f) => f.slug)));
    }
  };

  const handleDelete = async (slug: string) => {
    const ok = await onDelete(slug);
    if (ok) setConfirmDelete(null);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      const reordered = [...filtered];
      const [moved] = reordered.splice(dragIndex, 1);
      if (moved) reordered.splice(index, 0, moved);
      onReorder(reordered.map((r) => r.slug));
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleBatchTag = () => {
    if (!batchTag.trim() || selected.size === 0) return;
    onBatchTag([...selected], batchTag.trim());
    setBatchTag('');
  };

  return (
    <div className="mp-project-list" style={{ border: '1px solid var(--mp-color-border, #ddd)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: '1px solid #eee', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="mp-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          style={{ flex: 1, minWidth: 150 }}
          aria-label="Search projects"
        />
        <button type="button" className="mp-btn mp-btn--primary" onClick={onCreate}>+ New</button>
        {selected.size > 0 && (
          <>
            <span style={{ fontSize: 13, color: '#666' }}>{selected.size} selected</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text"
                className="mp-input"
                value={batchTag}
                onChange={(e) => setBatchTag(e.target.value)}
                placeholder="Add tag..."
                style={{ width: 100, fontSize: 13 }}
                aria-label="Batch tag"
              />
              <button type="button" className="mp-btn mp-btn--small" onClick={handleBatchTag} disabled={!batchTag.trim()}>
                Tag
              </button>
            </div>
          </>
        )}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#f9f9f9', borderBottom: '1px solid #eee', fontSize: 13, fontWeight: 600 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={selectAll}
            aria-label="Select all"
          />
          <span>Name</span>
        </label>
        <span style={{ flex: 1 }} />
        <span style={{ width: 80 }}>Status</span>
        <span style={{ width: 100 }}>Updated</span>
        <span style={{ width: 80 }}>Actions</span>
      </div>

      {/* List */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
            {search ? 'No matching projects' : 'No projects yet'}
          </div>
        )}
        {filtered.map((item, index) => (
          <div
            key={item.slug}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(item.slug)}
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 12px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              background: activeSlug === item.slug ? '#e8f4fd' : dragIndex === index ? '#f0f0f0' : undefined,
              alignItems: 'center',
              fontSize: 14,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(item.slug)}
                onChange={() => toggleSelect(item.slug)}
                aria-label={`Select ${item.name}`}
              />
            </label>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500 }}>{item.name}</div>
              {item.tagline && <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.tagline}</div>}
            </div>
            <span style={{ width: 80, fontSize: 13, color: '#666' }}>{item.status ?? '-'}</span>
            <span style={{ width: 100, fontSize: 13, color: '#666' }}>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}</span>
            <div style={{ width: 80, display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="mp-btn mp-btn--small"
                onClick={() => onCopy(item.slug)}
                title="Copy"
                aria-label="Copy"
              >📋</button>
              {confirmDelete === item.slug ? (
                <>
                  <button type="button" className="mp-btn mp-btn--danger mp-btn--small" onClick={() => handleDelete(item.slug)}>Confirm</button>
                  <button type="button" className="mp-btn mp-btn--small" onClick={() => setConfirmDelete(null)}>Cancel</button>
                </>
              ) : (
                <button
                  type="button"
                  className="mp-btn mp-btn--danger mp-btn--small"
                  onClick={() => setConfirmDelete(item.slug)}
                  title="Delete"
                  aria-label="Delete"
                >🗑</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
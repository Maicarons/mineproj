
import { useState } from 'react';
import type { FormField } from './describe';

/**
 * Field controls (M9-03/04/05): renders form fields based on their widget
 * type. Uses a registry pattern so plugins can add custom controls.
 * Includes Markdown (dual-pane) and Media (upload) controls.
 */

export type FieldControl = React.ComponentType<{
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}>;

const registry = new Map<string, FieldControl>();

export function registerFieldControl(widget: string, component: FieldControl): void {
  registry.set(widget, component);
}

export function getFieldControl(widget: string): FieldControl | undefined {
  return registry.get(widget);
}

export function getAllFieldControls(): Map<string, FieldControl> {
  return new Map(registry);
}

// Built-in text control
export const TextControl: FieldControl = ({ field, value, onChange, error }) => (
  <div className="mp-field">
    <label className="mp-field__label">{field.label}</label>
    {field.help && <p className="mp-field__help">{field.help}</p>}
    <input
      type="text"
      className="mp-input"
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      maxLength={field.maxLength}
      aria-label={field.label}
    />
    {error && <p className="mp-field__error">{error}</p>}
  </div>
);

export const NumberControl: FieldControl = ({ field, value, onChange, error }) => (
  <div className="mp-field">
    <label className="mp-field__label">{field.label}</label>
    <input
      type="number"
      className="mp-input"
      value={String(value ?? 0)}
      onChange={(e) => onChange(Number(e.target.value))}
      min={field.min}
      max={field.max}
      aria-label={field.label}
    />
    {error && <p className="mp-field__error">{error}</p>}
  </div>
);

export const SwitchControl: FieldControl = ({ field, value, onChange }) => (
  <div className="mp-field">
    <label className="mp-field__label">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={field.label}
      />
      {field.label}
    </label>
  </div>
);

export const SelectControl: FieldControl = ({ field, value, onChange }) => (
  <div className="mp-field">
    <label className="mp-field__label">{field.label}</label>
    <select
      className="mp-select"
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      aria-label={field.label}
    >
      {field.options?.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const TagsControl: FieldControl = ({ field, value, onChange }) => {
  const tags: string[] = Array.isArray(value) ? value : [];
  return (
    <div className="mp-field">
      <label className="mp-field__label">{field.label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {tags.map((tag, i) => (
          <span key={i} className="mp-tag">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} aria-label={`Remove ${tag}`} style={{ marginLeft: 4, cursor: 'pointer' }}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="mp-input"
        placeholder="Add tag..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
            onChange([...tags, (e.target as HTMLInputElement).value]);
            (e.target as HTMLInputElement).value = '';
          }
        }}
        aria-label={`Add ${field.label}`}
      />
    </div>
  );
};

/** MarkdownControl (M9-04): dual-pane editor with live preview. */
export const MarkdownControl: FieldControl = ({ field, value, onChange, error }) => {
  const [preview, setPreview] = useState(false);
  const text = String(value ?? '');
  return (
    <div className="mp-field mp-field--markdown">
      <label className="mp-field__label">{field.label}</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <button type="button" className="mp-btn" onClick={() => setPreview(false)}>Edit</button>
        <button type="button" className="mp-btn" onClick={() => setPreview(true)}>Preview</button>
      </div>
      {preview ? (
        <div className="mp-prose" style={{ border: '1px solid var(--mp-color-border)', padding: 8, minHeight: 120, borderRadius: 4 }}>
          {text ? <div dangerouslySetInnerHTML={{ __html: text }} /> : <em style={{ color: '#aaa' }}>No content</em>}
        </div>
      ) : (
        <textarea
          className="mp-input"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: 120, fontFamily: 'monospace' }}
          aria-label={field.label}
        />
      )}
      {error && <p className="mp-field__error">{error}</p>}
    </div>
  );
};

/** MediaControl (M9-05): upload or select existing media files. */
export const MediaControl: FieldControl = ({ field, value, onChange, error }) => {
  const [files, setFiles] = useState<string[]>([]);
  const current = String(value ?? '');
  return (
    <div className="mp-field">
      <label className="mp-field__label">{field.label}</label>
      {current && <img src={current} alt="" style={{ maxWidth: 200, maxHeight: 150, display: 'block', marginBottom: 8, borderRadius: 4 }} />}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="mp-input"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Path or URL..."
          aria-label={field.label}
        />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              onChange(url);
              setFiles((prev) => [...prev, file.name]);
            }
          }}
          style={{ display: 'none' }}
          id={`file-${field.path}`}
        />
        <label htmlFor={`file-${field.path}`} className="mp-btn" style={{ cursor: 'pointer' }}>
          Upload
        </label>
      </div>
      {files.length > 0 && <p style={{ fontSize: 12, color: '#666' }}>{files.length} file(s) uploaded (in-memory only)</p>}
      {error && <p className="mp-field__error">{error}</p>}
    </div>
  );
};

// Register built-in controls
registerFieldControl('text', TextControl);
registerFieldControl('textarea', TextControl);
registerFieldControl('number', NumberControl);
registerFieldControl('switch', SwitchControl);
registerFieldControl('select', SelectControl);
registerFieldControl('tags', TagsControl);
registerFieldControl('date', TextControl);
registerFieldControl('url', TextControl);
registerFieldControl('markdown', MarkdownControl);
registerFieldControl('media', MediaControl);


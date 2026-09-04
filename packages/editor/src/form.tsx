import type { FormDescriptor } from './describe';
import { getFieldControl } from './controls';

/**
 * ProjectEditForm (M9-06): renders a full project edit form from a
 * FormDescriptor, with grouped/collapsible sections, field-level
 * validation, and draft change tracking.
 */

export interface ProjectFormProps {
  descriptor: FormDescriptor;
  data: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  errors?: Record<string, string>;
  onSave?: () => void;
  onCancel?: () => void;
  dirty?: boolean;
}

export function ProjectForm({ descriptor, data, onChange, errors, onSave, onCancel, dirty }: ProjectFormProps): ReactNode {
  const groups = Object.entries(descriptor.groups)
    .sort(([, a], [, b]) => a.order - b.order);

  return (
    <div className="mp-editor-form">
      {groups.map(([groupName, group]) => {
        const groupFields = descriptor.fields.filter((f) => f.group === groupName);
        if (groupFields.length === 0) return null;
        return (
          <details key={groupName} className="mp-editor-group" open={groupName === 'identity'}>
            <summary className="mp-editor-group__title">{group.title}</summary>
            <div className="mp-editor-group__fields">
              {groupFields.map((field) => {
                const Control = getFieldControl(field.widget);
                if (!Control) return null;
                return (
                  <Control
                    key={field.path}
                    field={field}
                    value={data[field.path]}
                    onChange={(value) => onChange(field.path, value)}
                    error={errors?.[field.path]}
                  />
                );
              })}
            </div>
          </details>
        );
      })}
      <div className="mp-editor-actions">
        {onSave && <button type="button" className="mp-btn mp-btn--primary" onClick={onSave} disabled={!dirty}>Save</button>}
        {onCancel && <button type="button" className="mp-btn" onClick={onCancel}>Cancel</button>}
        {dirty && <span className="mp-editor-dirty">Unsaved changes</span>}
      </div>
    </div>
  );
}

/** Diff utility (M9-10): computes the changed paths between two data objects. */
export function computeDiff(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const changed: string[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of allKeys) {
    const b = JSON.stringify(before[key]);
    const a = JSON.stringify(after[key]);
    if (b !== a) changed.push(key);
  }
  return changed;
}

type ReactNode = import('react').ReactNode;
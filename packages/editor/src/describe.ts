import { z } from 'zod';

/**
 * Schema → Form Descriptor (M9-02): reads a Zod schema and produces a
 * `FormDescriptor[]` describing every field. Each field carries metadata
 * (label, help, group, order, widget, visibleIf) extracted from the
 * schema's `.meta()` or from known field name conventions.
 */

export type FieldWidget = 'text' | 'textarea' | 'number' | 'switch' | 'date' | 'url' | 'select' | 'tags' | 'markdown' | 'media';

export interface FormField {
  /** Field path in the schema, e.g. `name`, `tags.0`, `links.0.url`. */
  path: string;
  /** Human-readable label. */
  label: string;
  /** Help text shown below the field. */
  help?: string;
  /** Field group for collapsible sections. */
  group?: string;
  /** Display order within the group. */
  order?: number;
  /** Widget type for rendering. */
  widget: FieldWidget;
  /** Whether the field is required. */
  required: boolean;
  /** Whether the field is hidden by default. */
  hidden?: boolean;
/** Visibility condition: `{ field: 'status', value: 'released' }` means visible only when status equals 'released'. */
  visibleIf?: { field: string; value: string };
  /** For select fields: available options. */
  options?: string[];
  /** Min/max validation constraints. */
  min?: number;
  max?: number;
  maxLength?: number;
  /** Pattern validation regex. */
  pattern?: string;
  /** Default value. */
  defaultValue?: unknown;
}

export interface FormDescriptor {
  fields: FormField[];
  /** Groups in display order, keyed by group name. */
  groups: Record<string, { title: string; order: number }>;
}

const KNOWN_LABELS: Record<string, { label: string; widget: FieldWidget; group?: string; order?: number; options?: string[] }> = {
  slug: { label: 'Slug', widget: 'text', group: 'identity', order: 1 },
  name: { label: 'Project Name', widget: 'text', group: 'identity', order: 2 },
  tagline: { label: 'Tagline', widget: 'text', group: 'identity', order: 3 },
  summary: { label: 'Summary', widget: 'textarea', group: 'identity', order: 4 },
  description: { label: 'Description', widget: 'markdown', group: 'content', order: 1 },
  bodyFile: { label: 'Body File', widget: 'text', group: 'content', order: 2 },
  cover: { label: 'Cover Image', widget: 'media', group: 'media', order: 1 },
  category: { label: 'Category', widget: 'select', group: 'classification', order: 1 },
  tags: { label: 'Tags', widget: 'tags', group: 'classification', order: 2 },
  status: { label: 'Status', widget: 'select', group: 'classification', order: 3, options: ['idea','wip','alpha','beta','released','maintenance','archived'] },
  createdAt: { label: 'Created At', widget: 'date', group: 'dates', order: 1 },
  updatedAt: { label: 'Updated At', widget: 'date', group: 'dates', order: 2 },
  releasedAt: { label: 'Released At', widget: 'date', group: 'dates', order: 3 },
  license: { label: 'License', widget: 'text', group: 'legal', order: 1 },
  role: { label: 'Role', widget: 'text', group: 'legal', order: 2 },
  featured: { label: 'Featured', widget: 'switch', group: 'display', order: 1 },
  hidden: { label: 'Hidden', widget: 'switch', group: 'display', order: 2 },
  weight: { label: 'Weight', widget: 'number', group: 'display', order: 3 },
  accentColor: { label: 'Accent Color', widget: 'text', group: 'display', order: 4 },
  techStack: { label: 'Tech Stack', widget: 'tags', group: 'classification', order: 4 },
  platforms: { label: 'Platforms', widget: 'tags', group: 'classification', order: 5 },
  languages: { label: 'Languages', widget: 'tags', group: 'classification', order: 6 },
  highlights: { label: 'Highlights', widget: 'tags', group: 'content', order: 3 },
};

export function describeFields(schema: z.ZodType): FormDescriptor {
  const fields: FormField[] = [];
  const groups: Record<string, { title: string; order: number }> = {};

  if (!(schema instanceof z.ZodObject)) {
    return { fields, groups };
  }

  const shape = schema.shape as Record<string, z.ZodType>;
  for (const [key, fieldSchema] of Object.entries(shape)) {
    const known = KNOWN_LABELS[key];
    const isOptional = fieldSchema.isOptional() || fieldSchema instanceof z.ZodDefault;
    const baseType = isOptional ? (fieldSchema as z.ZodDefault).unwrap?.() ?? fieldSchema : fieldSchema;

    let widget: FieldWidget = 'text';
    if (baseType instanceof z.ZodNumber) widget = 'number';
    else if (baseType instanceof z.ZodBoolean) widget = 'switch';
    else if (baseType instanceof z.ZodEnum) widget = 'select';
    else if (baseType instanceof z.ZodArray) widget = 'tags';

    const field: FormField = {
      path: key,
      label: known?.label ?? key,
      widget: known?.widget ?? widget,
      required: !isOptional,
      group: known?.group ?? 'general',
      order: known?.order ?? 999,
    };

    if (known?.options) field.options = known.options;
    if (baseType instanceof z.ZodNumber) {
      field.min = baseType.minValue ?? undefined;
      field.max = baseType.maxValue ?? undefined;
    }
    if (baseType instanceof z.ZodString) {
      field.maxLength = baseType.maxLength ?? undefined;
      field.pattern = undefined;
    }

    fields.push(field);
  }

  fields.sort((a, b) => (a.group === b.group ? (a.order ?? 999) - (b.order ?? 999) : 0));

  // Build groups
  const groupNames = [...new Set(fields.map((f) => f.group ?? 'general'))];
  const groupOrder = ['identity', 'content', 'media', 'classification', 'dates', 'display', 'legal', 'general'];
  for (const name of groupNames.sort((a, b) => (groupOrder.indexOf(a) >= 0 ? groupOrder.indexOf(a) : 999) - (groupOrder.indexOf(b) >= 0 ? groupOrder.indexOf(b) : 999))) {
    groups[name] = { title: name.charAt(0).toUpperCase() + name.slice(1), order: groupOrder.indexOf(name) >= 0 ? groupOrder.indexOf(name) : 999 };
  }

  return { fields, groups };
}
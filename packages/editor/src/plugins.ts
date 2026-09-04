import type { Transport } from './transport';

/**
 * Editor plugin extension points (M9-16): hooks that allow plugins to
 * customize field rendering, intercept save operations, and provide
 * custom transports.
 */

/** Hook context shared across all editor hooks. */
export interface EditorHookContext {
  /** Path of the current project file being edited. */
  projectPath?: string;
  /** Current project data. */
  data?: Record<string, unknown>;
}

/** Result of a beforeSave hook. */
export interface BeforeSaveResult {
  /** If true, the save is cancelled. */
  cancelled: boolean;
  /** Reason for cancellation. */
  reason?: string;
  /** Modified data to use instead. */
  data?: Record<string, unknown>;
}

/** Result of an afterSave hook. */
export interface AfterSaveResult {
  /** Notification message. */
  message?: string;
}

/** Editor hook registry. */
export interface EditorHooks {
  /** Called before rendering a field. Can modify the field descriptor. */
  'editor:field:render'?: Array<(field: Record<string, unknown>, ctx: EditorHookContext) => Record<string, unknown>>;
  /** Called before saving. Can cancel or modify the save. */
  beforeSave?: Array<(data: Record<string, unknown>, ctx: EditorHookContext) => Promise<BeforeSaveResult>>;
  /** Called after saving. */
  afterSave?: Array<(result: { path: string; success: boolean }, ctx: EditorHookContext) => Promise<AfterSaveResult>>;
  /** Called to provide a custom transport for a given path. */
  transport?: Array<(path: string, ctx: EditorHookContext) => Transport | null>;
}

const hooks: EditorHooks = {};

/** Register one or more editor hooks. */
export function registerEditorHooks(extension: Partial<EditorHooks>): void {
  for (const [key, fns] of Object.entries(extension)) {
    const k = key as keyof EditorHooks;
    if (!hooks[k]) {
      (hooks as Record<string, unknown>)[k] = [];
    }
    if (Array.isArray(fns)) {
      (hooks as Record<string, unknown[]>)[k]!.push(...fns);
    } else if (fns) {
      (hooks as Record<string, unknown[]>)[k]!.push(fns);
    }
  }
}

/** Get all registered hooks. */
export function getEditorHooks(): EditorHooks {
  return { ...hooks };
}

/** Run field render hooks. */
export function applyFieldRenderHooks(field: Record<string, unknown>, ctx: EditorHookContext): Record<string, unknown> {
  let result = { ...field };
  for (const hook of hooks['editor:field:render'] ?? []) {
    result = hook(result, ctx);
  }
  return result;
}

/** Run beforeSave hooks. */
export async function runBeforeSaveHooks(data: Record<string, unknown>, ctx: EditorHookContext): Promise<BeforeSaveResult> {
  for (const hook of hooks.beforeSave ?? []) {
    const result = await hook(data, ctx);
    if (result.cancelled) return result;
    if (result.data) data = result.data;
  }
  return { cancelled: false, data };
}

/** Run afterSave hooks. */
export async function runAfterSaveHooks(result: { path: string; success: boolean }, ctx: EditorHookContext): Promise<void> {
  for (const hook of hooks.afterSave ?? []) {
    await hook(result, ctx);
  }
}

/** Resolve a transport for a given path, using registered transport hooks. */
export function resolveTransportHooks(path: string, ctx: EditorHookContext): Transport | null {
  for (const hook of hooks.transport ?? []) {
    const transport = hook(path, ctx);
    if (transport) return transport;
  }
  return null;
}

/** Clear all editor hooks (for testing). */
export function clearEditorHooks(): void {
  for (const key of Object.keys(hooks) as (keyof EditorHooks)[]) {
    (hooks as Record<string, unknown>)[key] = undefined;
  }
}
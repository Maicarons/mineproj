import type { MineprojPluginLike } from '../hooks';
import type { ZodType } from 'zod';

/**
 * Plugin contract (M2-01). A mineproj plugin is `{ name, hooks, vite?,
 * components?, optionsSchema? }`; anything without the mineproj shape is
 * treated as a bare Vite plugin and passed through untouched.
 */

export interface PluginSetupContext {
  /** Register a component into a named slot (rendered in registration order). */
  registerSlot: (slot: string, component: unknown) => void;
  logger: {
    log: (message: string) => void;
    warn: (message: string) => void;
  };
}

export interface MineprojPlugin extends MineprojPluginLike {
  /** Short resolution already applied — always a full name. */
  name: string;
  /** Validated user options (set during registration). */
  options?: unknown;
  /** Declarative options schema; user options are parsed with it. */
  optionsSchema?: ZodType;
  /** Bare Vite plugins contributed by this plugin. */
  vite?: unknown[];
  /** Runtime components injected into the theme registry. */
  components?: Record<string, unknown>;
  /** Slots this plugin renders into. */
  slots?: Record<string, unknown[]>;
  /** Optional install-time hook. */
  setup?: (ctx: PluginSetupContext) => void;
}

export type PluginInput = MineprojPlugin | [MineprojPlugin, unknown] | unknown;

/** Identity helper: typed entry point for plugin authors. */
export function definePlugin(plugin: MineprojPlugin): MineprojPlugin {
  return plugin;
}

/**
 * Shape detection: does this object participate in the mineproj hook
 * pipeline, or is it a bare Vite plugin to pass through?
 */
export function isMineprojPlugin(candidate: unknown): candidate is MineprojPlugin {
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    return false;
  }
  const obj = candidate as Record<string, unknown>;
  if (typeof obj.hooks === 'object' && obj.hooks !== null) return true;
  if (typeof obj.setup === 'function') return true;
  if (typeof obj.name === 'string') {
    return obj.name.startsWith('mineproj-plugin-') || obj.name.startsWith('@mineproj/plugin-');
  }
  return false;
}

const BUILTIN_PREFIXES = ['@mineproj/plugin-'];

/**
 * Resolve a plugin shorthand to a package name.
 * `'seo'` → `@mineproj/plugin-seo`; full names pass through untouched.
 */
export function resolvePluginShorthand(reference: string): string {
  if (reference.startsWith('@')) return reference;
  if (BUILTIN_PREFIXES.some((p) => reference.startsWith(p))) return reference;
  if (reference.startsWith('mineproj-plugin-')) return reference;
  return `@mineproj/plugin-${reference}`;
}

/** Normalize the `plugins` config entries into { plugin, options } pairs. */
export function normalizePluginEntry(entry: PluginInput): { plugin: MineprojPlugin; options: unknown } | { vite: unknown } {
  if (Array.isArray(entry) && entry.length >= 1 && isMineprojPlugin(entry[0])) {
    return { plugin: entry[0], options: entry[1] };
  }
  if (isMineprojPlugin(entry)) {
    return { plugin: entry, options: undefined };
  }
  return { vite: entry };
}

/**
 * Lightweight plugin hook engine (~no deps, no tapable).
 *
 * Four call semantics:
 *  - `seq`        — run each hook in order, ignore return values
 *  - `waterfall`  — previous return value feeds the next hook
 *  - `parallel`   — Promise.all over all hooks
 *  - `first`      — first non-`undefined` return wins and short-circuits
 *
 * Ordering is controlled by `enforce` (pre/normal/post) plus `before`/`after`
 * name constraints inside the same tier. Cycles are detected with a readable
 * error listing the offending plugin chain.
 */

export type HookContext = unknown;
export type HookHandler = (value: unknown, ctx: HookContext) => unknown;

export interface MineprojPluginLike {
  name: string;
  enforce?: 'pre' | 'normal' | 'post';
  /** Run before the named plugins (same enforce tier). */
  before?: string[];
  /** Run after the named plugins (same enforce tier). */
  after?: string[];
  /** Hook map: hook name → handler. */
  hooks?: Record<string, HookHandler>;
}

const TIER: Record<'pre' | 'normal' | 'post', number> = { pre: 0, normal: 1, post: 2 };

export class PluginCycleError extends Error {
  constructor(cycle: string[]) {
    super(`Circular plugin dependency: ${cycle.join(' -> ')}`);
    this.name = 'PluginCycleError';
  }
}

/**
 * Topologically sort plugins: `enforce` tiers first, then `before`/`after`
 * constraints within each tier. Stable — ties keep registration order.
 */
export function sortPlugins<T extends MineprojPluginLike>(plugins: T[]): T[] {
  const tiers: T[][] = [[], [], []];
  for (const p of plugins) {
    tiers[TIER[p.enforce ?? 'normal'] ?? 1]!.push(p);
  }

  const sorted: T[] = [];
  for (const tier of tiers) {
    sorted.push(...sortTier(tier));
  }
  return sorted;
}

function sortTier<T extends MineprojPluginLike>(tier: T[]): T[] {
  const byName = new Map<string, T>(tier.map((p) => [p.name, p]));
  const inTier = (name: string) => byName.has(name);

  // Edge u -> v means "u must come before v".
  const edges = new Map<T, Set<T>>();
  const indegree = new Map<T, number>();
  for (const p of tier) {
    edges.set(p, new Set());
    indegree.set(p, 0);
  }
  for (const p of tier) {
    for (const b of p.before ?? []) {
      const target = byName.get(b);
      if (target && !edges.get(p)!.has(target)) {
        edges.get(p)!.add(target);
        indegree.set(target, indegree.get(target)! + 1);
      }
    }
    for (const a of p.after ?? []) {
      const source = byName.get(a);
      if (source && !edges.get(source)!.has(p)) {
        edges.get(source)!.add(p);
        indegree.set(p, indegree.get(p)! + 1);
      }
    }
  }

  const queue: T[] = tier.filter((p) => indegree.get(p) === 0);
  const result: T[] = [];
  while (queue.length > 0) {
    const p = queue.shift()!;
    result.push(p);
    for (const next of edges.get(p)!) {
      const d = indegree.get(next)! - 1;
      indegree.set(next, d);
      if (d === 0) queue.push(next);
    }
  }

  if (result.length !== tier.length) {
    throw new PluginCycleError(findCycle(tier, edges));
  }
  return result;
}

function findCycle<T extends MineprojPluginLike>(tier: T[], edges: Map<T, Set<T>>): string[] {
  const remaining = new Set(tier);
  // Walk greedily inside the unresolved subgraph until we revisit a node.
  let current = tier.find((p) => remaining.has(p))!;
  const seen = new Map<T, number>();
  const path: T[] = [];
  while (current && !seen.has(current)) {
    seen.set(current, path.length);
    path.push(current);
    const next = [...edges.get(current)!].find((n) => remaining.has(n));
    if (!next) break;
    current = next;
  }
  if (current && seen.has(current)) {
    const start = seen.get(current)!;
    return [...path.slice(start), current].map((p) => p.name);
  }
  return tier.map((p) => p.name);
}

type BoundHook = { plugin: MineprojPluginLike; fn: HookHandler };

function handlersOf<T extends MineprojPluginLike>(plugins: T[], hookName: string): BoundHook[] {
  const bound: BoundHook[] = [];
  for (const p of sortPlugins(plugins)) {
    const fn = p.hooks?.[hookName];
    if (typeof fn === 'function') bound.push({ plugin: p, fn });
  }
  return bound;
}

/** `seq`: run each hook in order; return values are ignored. */
export async function applySeq<T extends MineprojPluginLike>(
  plugins: T[],
  hookName: string,
  ctx: HookContext,
): Promise<void> {
  for (const { fn } of handlersOf(plugins, hookName)) {
    await fn(undefined, ctx);
  }
}

/** `waterfall`: each hook receives the previous return value. */
export async function applyWaterfall<V, T extends MineprojPluginLike>(
  plugins: T[],
  hookName: string,
  value: V,
  ctx: HookContext,
): Promise<V> {
  let acc: unknown = value;
  for (const { fn } of handlersOf(plugins, hookName)) {
    acc = await fn(acc, ctx);
  }
  return acc as V;
}

/** `parallel`: all hooks run concurrently. */
export async function applyParallel<T extends MineprojPluginLike>(
  plugins: T[],
  hookName: string,
  ctx: HookContext,
): Promise<void> {
  const fns = handlersOf(plugins, hookName).map(({ fn }) => fn(undefined, ctx));
  await Promise.all(fns);
}

/** `first`: short-circuits on the first non-`undefined` return. */
export async function applyFirst<V, T extends MineprojPluginLike>(
  plugins: T[],
  hookName: string,
  value: V,
  ctx: HookContext,
): Promise<V> {
  for (const { fn } of handlersOf(plugins, hookName)) {
    const result = await fn(value, ctx);
    if (result !== undefined) return result as V;
  }
  return value;
}

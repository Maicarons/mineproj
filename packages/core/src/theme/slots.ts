import type { Theme } from './contract';
import type { MineprojPlugin } from '../plugin/contract';

/**
 * Slot system (M2-09): themes declare the slots they render; plugins (and
 * theme setup hooks) contribute components per slot; consumers render in
 * registration order — plugins first (registry order), then theme setup.
 */

export interface SlotRegistry {
  /** Slot names the theme declares it renders. */
  declared: string[];
  /** Slot name → contributing components in render order. */
  consumers: Map<string, unknown[]>;
  /** Warnings for contributions to undeclared slots. */
  warnings: string[];
}

export function createSlotRegistry(
  theme: Theme,
  plugins: MineprojPlugin[] = [],
): SlotRegistry {
  const registry: SlotRegistry = {
    declared: theme.slots ?? [],
    consumers: new Map(),
    warnings: [],
  };

  for (const plugin of plugins) {
    for (const [slot, components] of Object.entries(plugin.slots ?? {})) {
      if (!registry.declared.includes(slot)) {
        registry.warnings.push(
          `Plugin "${plugin.name}" contributes to slot "${slot}" which the theme does not declare`,
        );
      }
      for (const component of components) {
        registerSlot(registry, slot, component);
      }
    }
  }
  return registry;
}

/** Runtime registration (also used by theme `setup(ctx)` / plugin `setup(ctx)`). */
export function registerSlot(registry: SlotRegistry, slot: string, component: unknown): void {
  const list = registry.consumers.get(slot) ?? [];
  list.push(component);
  registry.consumers.set(slot, list);
}

export function getSlotComponents(registry: SlotRegistry, slot: string): unknown[] {
  return registry.consumers.get(slot) ?? [];
}

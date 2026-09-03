import type { ComponentType } from 'react';
import type { Theme } from './contract';

/**
 * Component registry (M2-08). Resolution order (later wins):
 * theme → plugin components (in plugin order) → user overrides.
 * Overrides for names the theme does not know produce build-time warnings.
 */

export interface ComponentRegistry {
  components: Record<string, ComponentType<Record<string, unknown>>>;
  warnings: string[];
}

export function createComponentRegistry(
  theme: Theme,
  overrides: Record<string, unknown> = {},
  pluginComponents: Record<string, unknown>[] = [],
  logger?: { warn: (message: string) => void },
): ComponentRegistry {
  const warnings: string[] = [];
  const components: Record<string, ComponentType<Record<string, unknown>>> = {
    ...(theme.components ?? {}),
  };

  for (const fromPlugin of pluginComponents) {
    for (const [name, component] of Object.entries(fromPlugin)) {
      components[name] = component as ComponentType<Record<string, unknown>>;
    }
  }

  for (const [name, component] of Object.entries(overrides)) {
    if (!(name in components)) {
      const message = `Component override "${name}" is not a known theme component and will be ignored`;
      warnings.push(message);
      logger?.warn(message);
      continue;
    }
    components[name] = component as ComponentType<Record<string, unknown>>;
  }

  return { components, warnings };
}

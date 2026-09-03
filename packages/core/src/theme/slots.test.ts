import { describe, expect, it } from 'vitest';
import { definePlugin } from '../plugin/contract';
import { defineTheme, type Theme } from './contract';
import { createSlotRegistry, getSlotComponents, registerSlot } from './slots';

const A = () => null;
const B = () => null;

const theme: Theme = defineTheme({
  name: 'slot-theme',
  layouts: { home: () => null },
  slots: ['card-badge', 'nav-end'],
});

describe('createSlotRegistry', () => {
  it('declares theme slots with no consumers initially', () => {
    const registry = createSlotRegistry(theme);
    expect(registry.declared).toEqual(['card-badge', 'nav-end']);
    expect(getSlotComponents(registry, 'card-badge')).toEqual([]);
    expect(registry.warnings).toEqual([]);
  });

  it('collects plugin contributions in registration order', () => {
    const registry = createSlotRegistry(theme, [
      definePlugin({ name: 'first', slots: { 'card-badge': [A] } }),
      definePlugin({ name: 'second', slots: { 'card-badge': [B] } }),
    ]);
    expect(getSlotComponents(registry, 'card-badge')).toEqual([A, B]);
  });

  it('warns when a plugin contributes to an undeclared slot', () => {
    const registry = createSlotRegistry(theme, [
      definePlugin({ name: 'mineproj-plugin-rogue', slots: { 'nowhere': [A] } }),
    ]);
    expect(registry.warnings).toHaveLength(1);
    expect(registry.warnings[0]).toContain('mineproj-plugin-rogue');
    expect(registry.warnings[0]).toContain('nowhere');
    // Contribution is still recorded so opt-in themes can render it.
    expect(getSlotComponents(registry, 'nowhere')).toEqual([A]);
  });

  it('supports runtime registration via registerSlot', () => {
    const registry = createSlotRegistry(theme);
    registerSlot(registry, 'nav-end', A);
    registerSlot(registry, 'nav-end', B);
    expect(getSlotComponents(registry, 'nav-end')).toEqual([A, B]);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { defineTheme, type Theme } from './contract';
import { createComponentRegistry } from './registry';

const Card = () => null;
const MyCard = () => null;
const Badge = () => null;

const theme: Theme = defineTheme({
  name: 'registry-theme',
  layouts: { home: () => null },
  components: { ProjectCard: Card },
});

describe('createComponentRegistry', () => {
  it('starts from the theme components', () => {
    const { components, warnings } = createComponentRegistry(theme);
    expect(components.ProjectCard).toBe(Card);
    expect(warnings).toEqual([]);
  });

  it('applies user overrides over theme components', () => {
    const { components } = createComponentRegistry(theme, { ProjectCard: MyCard });
    expect(components.ProjectCard).toBe(MyCard);
  });

  it('applies plugin components between theme and user overrides', () => {
    const { components } = createComponentRegistry(theme, { ProjectCard: MyCard }, [
      { ProjectCard: Badge },
    ]);
    expect(components.ProjectCard).toBe(MyCard);
    expect(components.ProjectCard).not.toBe(Badge);
  });

  it('warns on overrides for unknown component names', () => {
    const warn = vi.fn();
    const { warnings } = createComponentRegistry(
      theme,
      { NoSuchWidget: MyCard },
      [],
      { warn },
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('NoSuchWidget');
    expect(warn).toHaveBeenCalled();
    expect('NoSuchWidget' in createComponentRegistry(theme).components).toBe(false);
  });
});

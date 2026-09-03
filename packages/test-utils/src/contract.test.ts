import { describe, expect, it } from 'vitest';
import { definePlugin } from '@mineproj/core';
import { runPluginContract, runThemeContract } from '../src/index';

const fullTheme = {
  name: 'full-theme',
  layouts: {
    home: () => null,
    list: () => null,
    detail: () => null,
    tag: () => null,
    collection: () => null,
    about: () => null,
    notFound: () => null,
  },
};

describe('runThemeContract', () => {
  it('passes a complete theme with no warnings', () => {
    const result = runThemeContract(fullTheme);
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('passes a mini theme implementing only home, with fallback warnings', () => {
    const mini = { name: 'mini-theme', layouts: { home: () => null } };
    const result = runThemeContract(mini);
    expect(result.ok).toBe(true);
    expect(result.warnings).toHaveLength(6);
  });

  it('fails for themes without a name or layouts', () => {
    expect(runThemeContract({ layouts: { home: () => null } }).ok).toBe(false);
    expect(runThemeContract({ name: 'x' }).ok).toBe(false);
    expect(runThemeContract({ name: 'x', layouts: { home: 'not-a-function' } }).ok).toBe(false);
    expect(runThemeContract(null).ok).toBe(false);
  });

  it('fails for non-function layout values and bad configSchema', () => {
    expect(runThemeContract({ name: 'x', layouts: { home: 42 }, configSchema: { parse: 1 } }).ok).toBe(false);
  });
});

describe('runPluginContract', () => {
  it('passes a well-formed plugin', () => {
    const result = runPluginContract(
      definePlugin({ name: 'mineproj-plugin-test', hooks: { 'build:done': () => {} } }),
    );
    expect(result.ok).toBe(true);
  });

  it('warns for plugins that do nothing', () => {
    const result = runPluginContract({ name: 'mineproj-plugin-idle' });
    expect(result.ok).toBe(true);
    expect(result.warnings[0]).toContain('neither hooks nor setup');
  });

  it('fails for non-function hooks and non-objects', () => {
    expect(runPluginContract({ name: 'x', hooks: { 'build:done': 42 } }).ok).toBe(false);
    expect(runPluginContract('bare-string').ok).toBe(false);
  });
});

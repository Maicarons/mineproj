import { describe, expect, it } from 'vitest';
import { parseArgs, USAGE } from './args';

describe('parseArgs', () => {
  it('parses the three main commands', () => {
    expect(parseArgs(['dev']).command).toBe('dev');
    expect(parseArgs(['build']).command).toBe('build');
    expect(parseArgs(['preview']).command).toBe('preview');
  });

  it('parses flags with values', () => {
    const { command, flags } = parseArgs([
      'build',
      '--root',
      'examples/basic',
      '--config',
      'mineproj.config.json',
      '--outDir',
      'site-out',
    ]);
    expect(command).toBe('build');
    expect(flags.root).toBe('examples/basic');
    expect(flags.config).toBe('mineproj.config.json');
    expect(flags.outDir).toBe('site-out');
  });

  it('parses a numeric port and validates its range', () => {
    expect(parseArgs(['dev', '--port', '5173']).flags.port).toBe(5173);
    expect(() => parseArgs(['dev', '--port', 'not-a-number'])).toThrow(/port/);
    expect(() => parseArgs(['dev', '--port', '99999'])).toThrow(/port/);
  });

  it('accepts boolean flags', () => {
    expect(parseArgs(['dev', '--open']).flags.open).toBe(true);
  });

  it('maps help and version flags', () => {
    expect(parseArgs(['--help']).command).toBe('help');
    expect(parseArgs(['-v']).command).toBe('version');
    expect(parseArgs([]).command).toBe('help');
  });

  it('rejects missing flag values', () => {
    expect(() => parseArgs(['dev', '--root'])).toThrow(/expects a value/);
  });

  it('rejects unknown flags and commands with usage hint', () => {
    expect(() => parseArgs(['dev', '--wat'])).toThrow(/Unknown flag/);
    expect(() => parseArgs(['deploy'])).toThrow(/Unknown command/);
    expect(() => parseArgs(['deploy'])).toThrow(USAGE.split('\n')[0]!);
  });

  it('rejects extra positional arguments', () => {
    expect(() => parseArgs(['build', 'extra'])).toThrow(/Unexpected extra argument/);
  });
});

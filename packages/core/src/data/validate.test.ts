import { describe, expect, it } from 'vitest';
import { formatDataIssue, formatDataIssues, validateProject, zodIssuesToDataIssues } from './validate';

const validProject = {
  slug: 'voxel-tool',
  name: 'Voxel Tool',
  tagline: 'Tiny voxel editor',
  summary: 'A tiny voxel editor that runs entirely in the browser with zero install.',
  createdAt: '2026-01-15T00:00:00.000Z',
};

describe('validateProject', () => {
  it('returns the parsed project for valid data', () => {
    const p = validateProject('data/projects/voxel-tool/index.json', validProject);
    expect(p.slug).toBe('voxel-tool');
    expect(p.status).toBe('released');
  });

  it('reports file path and field path for invalid data', () => {
    const file = 'data/projects/bad/index.json';
    try {
      validateProject(file, { ...validProject, name: 42, tags: 'not-an-array' });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect((err as Error).name).toBe('DataValidationError');
      const message = (err as Error).message;
      expect(message).toContain(file);
      expect(message).toContain('name');
      expect(message).toContain('tags');
      // expected/actual detail from zod flows through
      expect(message).toMatch(/expected/);
    }
  });

  it('uses (root) as field when the payload is not an object', () => {
    const issues = zodIssuesToDataIssues('x.json', { issues: [{ path: [], message: 'expected object' }] });
    expect(issues[0]?.field).toBe('(root)');
  });

  it('joins nested array indices into the field path', () => {
    const file = 'data/projects/x.json';
    try {
      validateProject(file, {
        ...validProject,
        links: [{ type: 'repo', url: 'https://ok.example.com', primary: true }, { type: 'nope', url: 'bad' }],
      });
      expect.unreachable('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('links.1');
    }
  });
});

describe('formatDataIssue', () => {
  it('renders file:field: message', () => {
    expect(formatDataIssue({ file: 'a.json', field: 'name', message: 'expected string' })).toBe(
      '  a.json:name: expected string',
    );
  });

  it('formatDataIssues joins with newlines', () => {
    expect(
      formatDataIssues([
        { file: 'a.json', field: 'name', message: 'e1' },
        { file: 'b.json', field: 'slug', message: 'e2' },
      ]),
    ).toBe('  a.json:name: e1\n  b.json:slug: e2');
  });
});

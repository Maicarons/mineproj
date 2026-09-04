import { describe, expect, it } from 'vitest';
import { describeFields } from './describe';
import { createFsTransport, createMemoryTransport } from './transport';
import { projectSchema } from '@mineproj/schema';

describe('describeFields (M9-02)', () => {
  it('generates fields from the project schema', () => {
    const descriptor = describeFields(projectSchema);
    expect(descriptor.fields.length).toBeGreaterThan(10);
    const slugField = descriptor.fields.find((f) => f.path === 'slug');
    expect(slugField?.label).toBe('Slug');
    expect(slugField?.widget).toBe('text');
    expect(slugField?.required).toBe(true);
    const nameField = descriptor.fields.find((f) => f.path === 'name');
    expect(nameField?.label).toBe('Project Name');
    expect(nameField?.group).toBe('identity');
    const featuredField = descriptor.fields.find((f) => f.path === 'featured');
    expect(featuredField?.widget).toBe('switch');
    const statusField = descriptor.fields.find((f) => f.path === 'status');
    expect(statusField?.widget).toBe('select');
    expect(statusField?.options).toContain('released');
  });

  it('creates group definitions in display order', () => {
    const descriptor = describeFields(projectSchema);
    expect(descriptor.groups['identity']).toBeDefined();
    expect(descriptor.groups['classification']).toBeDefined();
    expect(descriptor.groups['general']).toBeDefined();
  });
});

describe('transport (M9-11/13)', () => {
  it('FsTransport validates paths and rejects traversal', async () => {
    const transport = createFsTransport('/tmp/test-editor');
    const result = await transport.write('../../etc/passwd', 'content');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Path traversal');
  });

  it('FsTransport rejects disallowed file extensions', async () => {
    const transport = createFsTransport('/tmp/test-editor');
    const result = await transport.write('test.exe', 'content');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('MemoryTransport stores and retrieves files', async () => {
    const transport = createMemoryTransport();
    await transport.write('data/projects/test/index.json', '{"name": "Test"}');
    const content = await transport.read('data/projects/test/index.json');
    expect(content).toBe('{"name": "Test"}');
    const snapshot = transport.exportSnapshot();
    expect(snapshot['data/projects/test/index.json']).toBe('{"name": "Test"}');
  });

  it('MemoryTransport lists files in a directory', async () => {
    const transport = createMemoryTransport();
    await transport.write('data/projects/a/index.json', '{}');
    await transport.write('data/projects/b/index.json', '{}');
    const files = await transport.list('data/projects/');
    expect(files).toHaveLength(2);
  });
});
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Project } from '@mineproj/schema';
import { DataError } from './loader';
import { bodySourceOf, createMarkdownRenderer, loadProjectBody } from './body';

let root: string;

beforeEach(async () => {
  root = join(tmpdir(), `mineproj-body-${Math.random().toString(36).slice(2)}`);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const baseProject: Project = {
  slug: 'x',
  name: 'X',
  tagline: 't',
  summary: 'A summary long enough to satisfy schema validation rules.',
  createdAt: '2026-01-01T00:00:00.000Z',
  status: 'released',
  coverFit: 'cover',
  screenshots: [],
  highlights: [],
  docs: [],
  changelog: [],
  faq: [],
  tags: [],
  platforms: [],
  techStack: [],
  languages: [],
  links: [],
  stats: { custom: [] },
  collaborators: [],
  seo: { keywords: [], noindex: false },
  i18n: {},
  ext: {},
  bodyFile: 'body.md',
  featured: false,
  weight: 0,
  hidden: false,
};

describe('createMarkdownRenderer', () => {
  it('renders headings, paragraphs and links', async () => {
    const render = await createMarkdownRenderer();
    const html = render('# Hello\n\nSome [text](https://example.com).');
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<a href="https://example.com"');
  });

  it('highlights code blocks at build time with dual-theme CSS variables', async () => {
    const render = await createMarkdownRenderer();
    const html = render('```ts\nconst answer: number = 42;\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('shiki-themes');
    expect(html).toContain('--shiki-dark');
  });

  it('escapes raw HTML (html: false)', async () => {
    const render = await createMarkdownRenderer();
    const html = render('hello <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('adds rel="noopener noreferrer" to external links only', async () => {
    const render = await createMarkdownRenderer();
    const html = render('[gh](https://github.com/x) and [local](/projects/voxel-tool/)');
    expect(html).toContain('rel="noopener noreferrer"');
    const localPart = html.split('and')[1] ?? '';
    expect(localPart).not.toContain('noopener');
  });

  it('renders GFM tables and strikethrough', async () => {
    const render = await createMarkdownRenderer();
    const html = render('| a | b |\n| - | - |\n| 1 | 2 |\n\n~~gone~~');
    expect(html).toContain('<table>');
    expect(html).toContain('<s>gone</s>');
  });

  it('renders unknown languages without failing the build', async () => {
    const render = await createMarkdownRenderer();
    const html = render('```not-a-lang\nplain\n```');
    expect(html).toContain('<pre');
  });
});

describe('bodySourceOf', () => {
  it('prefers the external bodyFile', () => {
    expect(bodySourceOf({ ...baseProject, description: 'inline', bodyFile: 'body.md' })).toEqual({
      kind: 'file',
      file: 'body.md',
    });
  });

  it('falls back to the inline description', () => {
    expect(bodySourceOf({ ...baseProject, bodyFile: '', description: '# Inline' })).toEqual({
      kind: 'inline',
      markdown: '# Inline',
    });
  });

  it('returns null when no body exists', () => {
    expect(bodySourceOf({ ...baseProject, bodyFile: '' })).toBeNull();
  });
});

describe('loadProjectBody', () => {
  const project: Project = { ...baseProject, slug: 'voxel-tool', name: 'Voxel Tool' };

  it('loads and renders an external body.md', async () => {
    await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
    await writeFile(
      join(root, 'data', 'projects', 'voxel-tool', 'body.md'),
      '# Voxel Tool\n\n```ts\nlet x = 1;\n```',
      'utf-8',
    );
    const body = await loadProjectBody(root, project, 'data/projects/voxel-tool');
    expect(body?.markdown).toContain('# Voxel Tool');
    expect(body?.html).toContain('<h1>Voxel Tool</h1>');
    expect(body?.html).toContain('shiki-themes');
  });

  it('throws a readable error when the declared bodyFile is missing', async () => {
    await mkdir(join(root, 'data', 'projects', 'voxel-tool'), { recursive: true });
    await expect(
      loadProjectBody(root, project, 'data/projects/voxel-tool'),
    ).rejects.toThrow(DataError);
    await expect(loadProjectBody(root, project, 'data/projects/voxel-tool')).rejects.toThrow(
      /Missing body file "body\.md"[\s\S]*voxel-tool/,
    );
  });

  it('renders inline description when no bodyFile is set', async () => {
    const inline: Project = {
      ...baseProject,
      slug: 'tiny',
      name: 'Tiny',
      bodyFile: '',
      description: 'Built with **care**.',
    };
    const body = await loadProjectBody(root, inline, 'data/projects/tiny');
    expect(body?.markdown).toBe('Built with **care**.');
    expect(body?.html).toContain('<strong>care</strong>');
  });

  it('returns null for a project without any body', async () => {
    const bare: Project = { ...baseProject, slug: 'bare', name: 'Bare', bodyFile: '' };
    expect(await loadProjectBody(root, bare, 'data/projects/bare')).toBeNull();
  });
});

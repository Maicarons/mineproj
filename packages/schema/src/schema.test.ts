import { describe, expect, it } from 'vitest';
import {
  SCHEMA_VERSION,
  collectionSchema,
  profileSchema,
  projectSchema,
  siteConfigSchema,
  tagSchema,
} from '../src/index';

const validProject = {
  slug: 'voxel-tool',
  name: 'Voxel Tool',
  tagline: 'A tiny voxel editor',
  summary: 'A tiny voxel editor that runs entirely in the browser with zero install.',
  createdAt: '2026-01-15T00:00:00.000Z',
};

describe('projectSchema', () => {
  it('parses a minimal project and applies defaults', () => {
    const p = projectSchema.parse(validProject);
    expect(p.status).toBe('released');
    expect(p.weight).toBe(0);
    expect(p.featured).toBe(false);
    expect(p.hidden).toBe(false);
    expect(p.tags).toEqual([]);
    expect(p.screenshots).toEqual([]);
    expect(p.bodyFile).toBe('body.md');
    expect(p.coverFit).toBe('cover');
    expect(p.stats).toEqual({ custom: [] });
    expect(p.i18n).toEqual({});
    expect(p.ext).toEqual({});
  });

  it('keeps every plan §5.1 field group on the output type', () => {
    const p = projectSchema.parse({
      ...validProject,
      cover: 'cover.png',
      screenshots: [{ src: 'gallery/01.png', caption: 'Main view' }],
      video: { src: 'demo.mp4', type: 'video/mp4' },
      description: 'Some **markdown**',
      highlights: ['Fast', 'Tiny'],
      docs: [{ title: 'Design doc', file: 'docs/design.pdf' }],
      changelog: [{ version: '0.1.0', date: '2026-02-01', notes: ['Initial'] }],
      faq: [{ q: 'Is it free?', a: 'Yes.' }],
      category: 'web',
      tags: ['web', 'game'],
      platforms: ['web', 'windows'],
      techStack: ['TypeScript'],
      languages: ['zh-CN'],
      status: 'wip',
      featured: true,
      weight: 10,
      links: [{ type: 'repo', url: 'https://github.com/x/y', primary: true }],
      playable: { type: 'iframe', entry: '/demos/voxel-tool/index.html' },
      stats: { stars: 42, custom: [{ label: 'Builds', value: '17' }] },
      role: '独立完成',
      collaborators: [{ name: 'Alice', url: 'https://example.com' }],
      license: 'Apache-2.0',
      seo: { title: 'Voxel Tool', keywords: ['voxel'] },
      i18n: { en: { name: 'Voxel Tool EN' } },
      availableLocales: ['zh-CN', 'en'],
      ext: { custom: 1 },
    });
    expect(p.docs[0]?.kind).toBe('pdf');
    expect(p.docs[0]?.preview).toBe('viewer');
    expect(p.playable?.sandbox).not.toContain('allow-same-origin');
    expect(p.playable?.requirements.mobileFriendly).toBe(false);
    expect(p.links[0]?.primary).toBe(true);
    expect(p.seo.noindex).toBe(false);
    expect(p.i18n.en?.name).toBe('Voxel Tool EN');
  });

  it('rejects an invalid slug with the field name in the error', () => {
    const result = projectSchema.safeParse({ ...validProject, slug: 'Bad Slug!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('slug');
    }
  });

  it('rejects a missing name and reports the field path', () => {
    const { name: _omit, ...withoutName } = validProject;
    const result = projectSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('name'))).toBe(true);
    }
  });

  it('rejects non-URL link values with the field path', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      links: [{ type: 'repo', url: 'not-a-url' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.').startsWith('links'))).toBe(true);
    }
  });

  it('rejects invalid platform enums', () => {
    const result = projectSchema.safeParse({ ...validProject, platforms: ['msdos'] });
    expect(result.success).toBe(false);
  });

  it('enforces summary length bounds', () => {
    expect(projectSchema.safeParse({ ...validProject, summary: 'too short' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validProject, summary: 'x'.repeat(401) }).success).toBe(false);
  });
});

describe('siteConfigSchema', () => {
  it('applies locale defaults', () => {
    const s = siteConfigSchema.parse({ title: 'My Projects' });
    expect(s.defaultLocale).toBe('zh-CN');
    expect(s.locales).toEqual(['zh-CN']);
    expect(s.keywords).toEqual([]);
  });
});

describe('profileSchema', () => {
  it('parses a profile with socials', () => {
    const p = profileSchema.parse({
      name: 'Mai',
      url: 'https://example.com',
      socials: [{ type: 'github', url: 'https://github.com/maicarons' }],
    });
    expect(p.socials).toHaveLength(1);
    expect(p.skills).toEqual([]);
  });

  it('rejects a bad social URL with field path', () => {
    const result = profileSchema.safeParse({
      name: 'Mai',
      socials: [{ type: 'github', url: 'nope' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.').startsWith('socials'))).toBe(true);
    }
  });
});

describe('tagSchema', () => {
  it('applies weight default and rejects empty name', () => {
    expect(tagSchema.parse({ name: 'web' }).weight).toBe(0);
    expect(tagSchema.safeParse({ name: '' }).success).toBe(false);
  });
});

describe('collectionSchema', () => {
  it('parses a collection with defaults', () => {
    const c = collectionSchema.parse({
      slug: 'frontend-2026',
      name: 'Frontend 2026',
      projectSlugs: ['voxel-tool'],
    });
    expect(c.featured).toBe(false);
    expect(c.weight).toBe(0);
  });

  it('rejects an invalid slug', () => {
    expect(collectionSchema.safeParse({ slug: 'X Y', name: 'n' }).success).toBe(false);
  });
});

describe('SCHEMA_VERSION', () => {
  it('is exported for the API manifest', () => {
    expect(SCHEMA_VERSION).toBe('1.0.0');
  });
});

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '@mineproj/schema';

import { coverHue, ProjectCard, relativeTime } from './ProjectCard';

function project(extra: Record<string, unknown> = {}): Project {
  return projectSchema.parse({
    slug: 'voxel-tool',
    name: 'Voxel Tool',
    tagline: 'A tiny voxel editor for the browser',
    summary: 'Summary text long enough to satisfy schema validation rules.',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
    tags: ['web', 'game', 'tool', 'extra'],
    cover: '/projects/voxel-tool/cover.png',
    ...extra,
  });
}

const NOW = new Date('2026-09-03T00:00:00.000Z');

describe('ProjectCard (M3-03)', () => {
  it('renders cover image, name, tagline and a link', () => {
    const html = renderToString(<ProjectCard project={project()} now={NOW} />);
    expect(html).toContain('mp-card');
    expect(html).toContain('src="/projects/voxel-tool/cover.png"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('Voxel Tool');
    expect(html).toContain('href="/projects/voxel-tool/"');
  });

  it('shows at most 3 tags plus an overflow counter', () => {
    const html = renderToString(<ProjectCard project={project()} now={NOW} />);
    expect(html).toContain('#web');
    expect(html).toContain('#game');
    expect(html).toContain('#tool');
    expect(html).toMatch(/\+<!-- -->1/);
    expect(html).not.toContain('#extra');
  });

  it('derives a stable gradient hue from the slug for coverless projects', () => {
    expect(coverHue('voxel-tool')).toBe(coverHue('voxel-tool'));
    expect(coverHue('aaa')).not.toBe(coverHue('zzz'));
    const html = renderToString(
      <ProjectCard project={project({ slug: 'no-cover', cover: undefined, name: 'No Cover' })} now={NOW} />,
    );
    expect(html).toContain('mp-card__placeholder');
    expect(html).toContain('linear-gradient');
    expect(html).toContain('>N<');
  });

  it('shows an UPDATED badge for recently updated projects', () => {
    const html = renderToString(<ProjectCard project={project()} now={NOW} />);
    expect(html).toContain('UPDATED');
  });

  it('marks archived projects even when recently touched', () => {
    const html = renderToString(
      <ProjectCard project={project({ status: 'archived', updatedAt: '2026-09-01T00:00:00.000Z' })} now={NOW} />,
    );
    expect(html).toContain('ARCHIVED');
    expect(html).not.toContain('UPDATED');
  });

  it('formats relative time', () => {
    expect(relativeTime('2026-09-01T00:00:00.000Z', NOW)).toBe('2d ago');
    expect(relativeTime('2026-06-01T00:00:00.000Z', NOW)).toBe('3mo ago');
    expect(relativeTime('2024-01-01T00:00:00.000Z', NOW)).toBe('2y ago');
  });

  it('flags playable projects with a badge', () => {
    const html = renderToString(
      <ProjectCard project={project({ playable: { type: 'iframe', entry: '/demos/x/' } })} now={NOW} />,
    );
    expect(html).toContain('Playable');
  });
});

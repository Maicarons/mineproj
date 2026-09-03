import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import theme from './index';
import {
  HomeLayout,
  DetailLayout,
  TagLayout,
  CollectionLayout,
  AboutLayout,
  NotFoundLayout,
} from './layouts';
import type { LayoutProps } from '@mineproj/core';

function makeProps(over: Partial<LayoutProps> = {}): LayoutProps {
  return {
    route: { path: '/', layout: 'home' },
    data: {
      projects: [
        {
          slug: 'voxel-tool',
          name: 'Voxel Tool',
          tagline: 'Tiny voxel editor',
          tags: ['web'],
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      tagCounts: [{ name: 'web', count: 1 }],
      stats: {
        total: 1,
        byStatus: { released: 1 },
        featured: 0,
        playable: 0,
        openSource: 0,
        platforms: [],
        timeline: [{ year: 2026, count: 1 }],
      },
      profile: { name: 'Mai', bio: 'Builder' },
      collections: [],
      ...over.data,
    },
    config: { title: 'Classic Test', defaultLocale: 'zh-CN' },
    themeConfig: {},
    ...over,
  } as LayoutProps;
}

describe('theme-classic layouts', () => {
  it('implements all seven core layouts', () => {
    for (const layout of ['home', 'list', 'detail', 'tag', 'collection', 'about', 'notFound']) {
      expect(theme.layouts[layout], `missing ${layout}`).toBeDefined();
    }
  });

  it('renders the home page with projects and site title', () => {
    const html = renderToString(<HomeLayout {...makeProps()} />);
    expect(html).toContain('Classic Test');
    expect(html).toContain('Voxel Tool');
    expect(html).toContain('/projects/voxel-tool/');
  });

  it('renders detail pages with meta and tag links', () => {
    const props = makeProps({
      route: { path: '/projects/voxel-tool/', layout: 'detail', slug: 'voxel-tool' },
      data: {
        project: {
          ...makeProps().data.projects[0]!,
          summary: 'Summary here',
          license: 'Apache-2.0',
          highlights: ['Fast'],
          links: [],
        },
      },
    } as Partial<LayoutProps>);
    const html = renderToString(<DetailLayout {...props} />);
    expect(html).toContain('<h1');
    expect(html).toContain('Apache-2.0');
    expect(html).toContain('href="/tags/web/"');
  });

  it('renders tag pages with only matching projects', () => {
    const props = makeProps({
      route: { path: '/tags/web/', layout: 'tag', tag: 'web' },
      data: { tag: 'web', projects: makeProps().data.projects },
    } as Partial<LayoutProps>);
    const html = renderToString(<TagLayout {...props} />);
    expect(html).toContain('#web');
    expect(html).toContain('Voxel Tool');
  });

  it('renders collection pages', () => {
    const props = makeProps({
      route: { path: '/collections/picks/', layout: 'collection', collection: 'picks' },
      data: {
        collection: { slug: 'picks', name: 'Picks', projectSlugs: ['voxel-tool'] },
        projects: makeProps().data.projects,
      },
    } as Partial<LayoutProps>);
    const html = renderToString(<CollectionLayout {...props} />);
    expect(html).toContain('Picks');
    expect(html).toContain('Voxel Tool');
  });

  it('renders the about page from the profile', () => {
    const html = renderToString(<AboutLayout {...makeProps()} />);
    expect(html).toContain('Mai');
    expect(html).toContain('Builder');
  });

  it('renders the 404 page', () => {
    const html = renderToString(<NotFoundLayout />);
    expect(html).toContain('404');
  });
});

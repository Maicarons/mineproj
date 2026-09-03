import type { LayoutProps } from '@mineproj/core';

/** Shared fixture props for layout tests/snapshots. */
export function makeProps(over: Partial<LayoutProps> = {}): LayoutProps {
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
  } as unknown as LayoutProps;
}

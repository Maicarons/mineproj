import { describe, expect, it } from 'vitest';
import { localizedRoutes, prefixPath } from './routes';

const routes = [
  { path: '/', layout: 'home', title: 'Home' },
  { path: '/projects/voxel-tool/', layout: 'detail', slug: 'voxel-tool', title: 'VT' },
  { path: '/404.html', layout: 'notFound' },
] as never[];

describe('M5-06 localized routing', () => {
  it('keeps the default locale unprefixed and prefixes others', () => {
    const result = localizedRoutes(routes, {
      locales: ['zh-CN', 'en'],
      defaultLocale: 'zh-CN',
      prefixAll: false,
    });
    const enHome = result.find((r) => r.locale === 'en' && r.layout === 'home');
    expect(enHome?.path).toBe('/en/');
    const zhHome = result.find((r) => r.locale === 'zh-CN' && r.layout === 'home');
    expect(zhHome?.path).toBe('/');
    const enDetail = result.find((r) => r.locale === 'en' && r.slug === 'voxel-tool');
    expect(enDetail?.path).toBe('/en/projects/voxel-tool/');
  });

  it('prefixes the 404 fallback per locale so switching never 404s', () => {
    const result = localizedRoutes(routes, {
      locales: ['zh-CN', 'en'],
      defaultLocale: 'zh-CN',
      prefixAll: false,
    });
    expect(result.find((r) => r.locale === 'en' && r.layout === 'notFound')?.path).toBe('/en/404.html');
  });

  it('prefixes every locale when prefixAll is set', () => {
    const result = localizedRoutes(routes, {
      locales: ['zh-CN', 'en'],
      defaultLocale: 'zh-CN',
      prefixAll: true,
    });
    expect(result.find((r) => r.locale === 'zh-CN' && r.layout === 'home')?.path).toBe('/zh-CN/');
  });

  it('records hreflang alternates incl. x-default pointing at the default locale', () => {
    const result = localizedRoutes(routes, {
      locales: ['zh-CN', 'en'],
      defaultLocale: 'zh-CN',
      prefixAll: false,
    });
    const enDetail = result.find((r) => r.locale === 'en' && r.slug === 'voxel-tool');
    expect(enDetail?.alternates).toEqual([
      { locale: 'zh-CN', href: '/projects/voxel-tool/' },
      { locale: 'en', href: '/en/projects/voxel-tool/' },
      { locale: 'x-default', href: '/projects/voxel-tool/' },
    ]);
  });

  it('derives dir from the locale', () => {
    const result = localizedRoutes(
      [{ path: '/', layout: 'home' } as never],
      { locales: ['ar', 'en'], defaultLocale: 'en', prefixAll: false },
    );
    expect(result.find((r) => r.locale === 'ar')?.dir).toBe('rtl');
  });
});

describe('prefixPath', () => {
  it('handles root and inner paths', () => {
    expect(prefixPath('/', 'en')).toBe('/en/');
    expect(prefixPath('/projects/a/', 'en')).toBe('/en/projects/a/');
    expect(prefixPath('/projects/a/', null)).toBe('/projects/a/');
  });
});

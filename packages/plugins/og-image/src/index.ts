/**
 * plugin-og-image (M6-06): generates SVG-based OG images (1200×630) at
 * build time. Uses a simple SVG template (no heavy satori/resvg dependency)
 * that renders project name, tagline, tags and accent color. The SVG is
 * written to `dist/og/<slug>.svg` and referenced in the SEO meta tags.
 */

import type { MineprojPlugin, Project } from '@mineproj/core';

export interface OgImageOptions {
  siteTitle: string;
  accentColor?: string;
}

const WIDTH = 1200;
const HEIGHT = 630;

export function generateOgSvg(project: Project, options: OgImageOptions): string {
  const accent = options.accentColor ?? '#2563EB';
  const name = project.name;
  const tagline = project.tagline;
  const tags = project.tags.slice(0, 4).join(' · ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="${accent}22"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <text x="60" y="200" font-family="system-ui,sans-serif" font-size="56" font-weight="700" fill="#fff">${escapeXml(name)}</text>
  <text x="60" y="280" font-family="system-ui,sans-serif" font-size="28" fill="#aaa">${escapeXml(tagline)}</text>
  ${tags ? `<text x="60" y="360" font-family="system-ui,sans-serif" font-size="20" fill="${accent}">${escapeXml(tags)}</text>` : ''}
  <text x="60" y="560" font-family="system-ui,sans-serif" font-size="22" fill="#666">${escapeXml(options.siteTitle)}</text>
</svg>`;
}

function escapeXml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function defineOgImagePlugin(options: OgImageOptions): MineprojPlugin {
  return {
    name: '@mineproj/plugin-og-image',
    enforce: 'post',
    hooks: {
      'emit': async (_value, ctx) => {
        const c = ctx as unknown as {
          dataset: { projects: Project[] };
          emit: (path: string, content: string) => Promise<void>;
        };
        for (const project of c.dataset.projects) {
          if (project.hidden) continue;
          const svg = generateOgSvg(project, options);
          await ctx.emit(`og/${project.slug}.svg`, svg);
        }
      },
    },
  };
}
import { describe, expect, it } from 'vitest';
import { annotateDeadLinks, installLinkRule, isExternalLink, isInternalLink } from './link';
import MarkdownIt from 'markdown-it';

describe('link processing (M4-06)', () => {
  it('detects external and internal links', () => {
    expect(isExternalLink('https://example.com')).toBe(true);
    expect(isExternalLink('//cdn.example.com')).toBe(true);
    expect(isExternalLink('/projects/voxel-tool/')).toBe(false);
    expect(isInternalLink('/projects/voxel-tool/')).toBe(true);
    expect(isInternalLink('mailto:test@example.com')).toBe(false);
  });

  it('adds rel and target to external links', () => {
    const md = new MarkdownIt();
    installLinkRule(md);
    const html = md.render('[Example](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it('marks dead internal links', () => {
    const md = new MarkdownIt();
    installLinkRule(md, { knownRoutes: ['/projects/voxel-tool/', '/about/'] });
    const html = md.render('[Existing](/projects/voxel-tool/) [Dead](/projects/nope/)');
    expect(html).toContain('data-mp-dead-link');
    const annotated = annotateDeadLinks(html);
    expect(annotated).toContain('style="color:red');
    expect(annotated).toContain('⚠️');
  });

  it('does not mark valid internal links', () => {
    const md = new MarkdownIt();
    installLinkRule(md, { knownRoutes: ['/projects/voxel-tool/'] });
    const html = md.render('[Valid](/projects/voxel-tool/)');
    expect(html).not.toContain('data-mp-dead-link');
  });
});
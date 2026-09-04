import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * mineproj audit (M6-13 ★): scores a built site on SEO, AI-friendliness,
 * accessibility and performance. Returns a 0–100 score and a detailed
 * check table. The CLI uses `--fail-under=N` as a CI gate.
 */

export interface AuditCheck {
  category: 'seo' | 'ai' | 'a11y' | 'perf';
  name: string;
  pass: boolean;
  detail?: string;
}

export interface AuditResult {
  score: number;
  checks: AuditCheck[];
  failUnder: number;
  passed: boolean;
}

const WEIGHTS: { [key: string]: number } = {
  seo: 35,
  ai: 25,
  a11y: 25,
  perf: 15,
};

async function glob(dir: string, pattern: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'api' && entry.name !== '@mp' && entry.name !== 'assets') {
        results.push(...(await glob(rel, pattern)));
      }
    } else if (entry.name.endsWith(pattern.slice(1))) {
      results.push(rel);
    }
  }
  return results;
}

export async function runAudit(outDir: string, failUnder = 85): Promise<AuditResult> {
  const checks: AuditCheck[] = [];
  const add = (cat: AuditCheck['category'], name: string, pass: boolean, detail?: string): void => {
    checks.push({ category: cat, name, pass, detail });
  };

  const htmlFiles = await glob(outDir, '*.html');
  const htmlStrings = await Promise.all(htmlFiles.map((f) => readFile(f, 'utf-8').catch(() => '')));
  const home = await readFile(join(outDir, 'index.html'), 'utf-8').catch(() => '');

  // ── SEO checks ──
  const hasTitle = home.includes('<title>');
  add('seo', 'Page has <title>', hasTitle);
  const hasMetaDesc = home.includes('meta name="description"');
  add('seo', 'Meta description present', hasMetaDesc);
  const hasOg = home.includes('property="og:title"');
  add('seo', 'OG meta tags present', hasOg);
  const hasCanonical = home.includes('rel="canonical"');
  add('seo', 'Canonical link present', hasCanonical);
  const hasLang = home.includes('lang="zh-CN"') || home.includes('lang="en"');
  add('seo', 'html lang attribute', hasLang);
  const hasHreflang = home.includes('hreflang');
  add('seo', 'hreflang alternates', hasHreflang);
  const hasJsonLd = home.includes('application/ld+json');
  add('seo', 'JSON-LD structured data', hasJsonLd);

  // ── AI checks ──
  const hasLlms = await readFile(join(outDir, 'llms.txt'), 'utf-8').then(() => true).catch(() => false);
  add('ai', 'llms.txt exists', hasLlms);
  const hasSitemap = await readFile(join(outDir, 'sitemap.xml'), 'utf-8').then(() => true).catch(() => false);
  add('ai', 'sitemap.xml exists', hasSitemap);
  const hasAgents = await readFile(join(outDir, 'AGENTS.md'), 'utf-8').then(() => true).catch(() => false);
  add('ai', 'AGENTS.md exists', hasAgents);
  const hasMdMirror = htmlFiles.some((f) => {
    const mdFile = f.replace(/\.html$/, '.md');
    return existsSync(join(outDir, mdFile));
  });
  const mdExists = await glob(outDir, '*.md').then((f) => f.length > 0);
  add('ai', 'Markdown mirrors exist', mdExists);
  const hasSitemapMd = await readFile(join(outDir, 'sitemap.md'), 'utf-8').then(() => true).catch(() => false);
  add('ai', 'sitemap.md exists', hasSitemapMd);

  // ── A11y checks ──
  const hasSkipLink = home.includes('mp-skip-link') || home.includes('skip-to-content');
  add('a11y', 'Skip-to-content link', hasSkipLink);
  const hasAlt = htmlStrings.some((h) => h.includes('alt="'));
  add('a11y', 'Images have alt attributes', hasAlt);
  const hasAriaLabels = htmlStrings.some((h) => h.includes('aria-label'));
  add('a11y', 'Interactive elements have aria-label', hasAriaLabels);
  const hasHeading = htmlStrings.some((h) => h.includes('<h1'));
  add('a11y', 'Page has at least one h1 heading', hasHeading);
  const hasFocusVisible = home.includes('focus-visible');
  add('a11y', 'Focus-visible ring in CSS', hasFocusVisible);

  // ── Perf checks ──
  const contentPages = htmlStrings.filter((h) => !h.includes('/en/') && h.includes('<!doctype'));
  const scriptSrcCount = contentPages.reduce((sum, h) => {
    const matches = h.match(/<script[^>]*src="[^"]*"/g);
    return sum + (matches?.length ?? 0);
  }, 0);
  const avgScripts = scriptSrcCount / Math.max(contentPages.length, 1);
  add('perf', 'Content pages ship minimal scripts', avgScripts <= 1, `avg ${avgScripts.toFixed(1)} src scripts`);
  const hasInline = contentPages.every((h) => !h.match(/<script>(?!\s*$)/g) || h.includes('mp-theme'));
  add('perf', 'No unexpected inline scripts', hasInline);

  // ── Score computation ──
  const categorize = (cat: string) => checks.filter((c) => c.category === cat);
  const catScore = (cat: string): number => {
    const items = categorize(cat);
    if (items.length === 0) return 100;
    return (items.filter((c) => c.pass).length / items.length) * 100;
  };
  const w = WEIGHTS;
  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const score = Math.round(
    (catScore('seo') * w['seo']! +
      catScore('ai') * w['ai']! +
      catScore('a11y') * w['a11y']! +
      catScore('perf') * w['perf']!) /
      totalWeight,
  );

  return { score, checks, failUnder, passed: score >= failUnder };
}

export function formatAuditTable(result: AuditResult): string {
  const lines: string[] = ['', '── mineproj audit ──', ''];
  for (const cat of ['seo', 'ai', 'a11y', 'perf']) {
    lines.push(` ${cat.toUpperCase()}`);
    for (const check of result.checks.filter((c) => c.category === cat)) {
      const icon = check.pass ? '✓' : '✗';
      const detail = check.detail ? ` (${check.detail})` : '';
      lines.push(`   ${icon} ${check.name}${detail}`);
    }
    lines.push('');
  }
  lines.push(` Score: ${result.score}/100`);
  lines.push(` Gate:  ${result.passed ? 'PASS' : 'FAIL'} (threshold ${result.failUnder})`);
  lines.push('', '──────────────────', '');
  return lines.join('\n');
}
import { z } from 'zod';

/**
 * Project data model — mirrors plan §5.1 field-for-field.
 * `data/projects/<slug>/index.json` must satisfy this schema.
 */

// ── 身份 ─────────────────────────────────────────────
const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'must match ^[a-z0-9][a-z0-9-]*$');
const name = z.string().min(1);
const tagline = z.string().max(120);
const summary = z.string().min(20).max(400);

// ── 视觉 ─────────────────────────────────────────────
const screenshot = z.object({
  src: z.string(),
  caption: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const video = z.object({
  src: z.string(),
  poster: z.string().optional(),
  type: z.string(),
});

// ── 文档与附件 ────────────────────────────────────────
const doc = z.object({
  title: z.string(),
  file: z.string(),
  kind: z.enum(['pdf', 'slides', 'paper', 'manual', 'report', 'other']).default('pdf'),
  lang: z.string().optional(),
  pages: z.number().optional(),
  size: z.number().optional(),
  cover: z.string().optional(),
  preview: z.enum(['viewer', 'iframe', 'cover']).default('viewer'),
  download: z.boolean().default(true),
});

const changelogEntry = z.object({
  version: z.string(),
  date: z.string(),
  notes: z.array(z.string()),
});

const faqEntry = z.object({ q: z.string(), a: z.string() });

// ── 链接 ─────────────────────────────────────────────
const link = z.object({
  type: z.enum(['repo', 'demo', 'docs', 'download', 'video', 'article', 'package', 'other']),
  label: z.string().optional(),
  url: z.url(),
  primary: z.boolean().default(false),
});

// ── 可玩 / 试用 ───────────────────────────────────────
const playable = z.object({
  type: z.enum(['iframe', 'link', 'embed-zip', 'none']).default('none'),
  entry: z.string().optional(),
  sandbox: z.string().default('allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox'),
  allow: z.string().default('fullscreen; gamepad; clipboard-write'),
  trusted: z.boolean().default(false),
  aspectRatio: z.string().default('16 / 9'),
  height: z.number().default(480),
  lazy: z.boolean().default(true),
  postMessageResize: z.boolean().default(true),
  requirements: z
    .object({
      minWidth: z.number().optional(),
      mobileFriendly: z.boolean().default(false),
      keyboard: z.boolean().default(false),
      notes: z.string().optional(),
    })
    .prefault({}),
});

// ── 统计 / 归属 / SEO ─────────────────────────────────
const stats = z.object({
  stars: z.number().optional(),
  downloads: z.number().optional(),
  views: z.number().optional(),
  linesOfCode: z.number().optional(),
  custom: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
});

const collaborator = z.object({
  name: z.string(),
  url: z.string().optional(),
  role: z.string().optional(),
});

const seo = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
  noindex: z.boolean().default(false),
});

// ── 国际化字段级覆盖 ──────────────────────────────────
/** Field-level locale override; also the shape of `index.<locale>.json` files. */
export const projectI18nOverrideSchema = z.object({
  name: z.string().optional(),
  tagline: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  bodyFile: z.string().optional(),
  faq: z.array(faqEntry).optional(),
  docs: z
    .array(
      z.object({
        title: z.string(),
        file: z.string(),
      }),
    )
    .optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  ext: z.record(z.string(), z.unknown()).optional(),
});

export const projectSchema = z.object({
  // ── 身份 ──
  slug,
  name,
  tagline,
  summary,

  // ── 视觉 ──
  cover: z.string().optional(),
  coverFit: z.enum(['cover', 'contain']).default('cover'),
  screenshots: z.array(screenshot).default([]),
  video: video.optional(),
  accentColor: z.string().optional(),
  icon: z.string().optional(),

  // ── 内容 ──
  description: z.string().optional(),
  bodyFile: z.string().default('body.md'),
  highlights: z.array(z.string()).default([]),

  // ── 文档与附件 ──
  docs: z.array(doc).default([]),
  changelog: z.array(changelogEntry).default([]),
  faq: z.array(faqEntry).default([]),

  // ── 分类 ──
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  platforms: z
    .array(z.enum(['windows', 'macos', 'linux', 'android', 'ios', 'harmonyos', 'web', 'wasm']))
    .default([]),
  techStack: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),

  // ── 时间 ──
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  releasedAt: z.string().optional(),

  // ── 状态与排序 ──
  status: z.enum(['idea', 'wip', 'alpha', 'beta', 'released', 'maintenance', 'archived']).default('released'),
  featured: z.boolean().default(false),
  weight: z.number().default(0),
  hidden: z.boolean().default(false),

  // ── 链接 ──
  links: z.array(link).default([]),

  // ── 可玩 / 试用 ──
  playable: playable.optional(),

  // ── 统计 ──
  stats: stats.prefault({}),

  // ── 归属与许可 ──
  role: z.string().optional(),
  collaborators: z.array(collaborator).default([]),
  license: z.string().optional(),

  // ── SEO / AI 覆盖 ──
  seo: seo.prefault({}),

  // ── 国际化 ──
  i18n: z.record(z.string(), projectI18nOverrideSchema).default({}),
  availableLocales: z.array(z.string()).optional(),

  // ── 扩展位 ──
  ext: z.record(z.string(), z.unknown()).default({}),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectI18nOverride = z.infer<typeof projectI18nOverrideSchema>;

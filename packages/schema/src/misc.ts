import { z } from 'zod';

/**
 * Auxiliary data models: `data/profile.json`, `data/tags.json`, `data/collections.json`.
 */

export const profileSchema = z.object({
  name: z.string().min(1),
  /** Headline identity, e.g. "Full-stack developer". */
  title: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
  url: z.url().optional(),
  /** Social links: GitHub, X, Bilibili, etc. */
  socials: z
    .array(
      z.object({
        type: z.string(),
        label: z.string().optional(),
        url: z.url(),
      }),
    )
    .default([]),
  /** Resume-style highlights shown on the About section. */
  skills: z.array(z.string()).default([]),
  ext: z.record(z.string(), z.unknown()).default({}),
});

export type Profile = z.infer<typeof profileSchema>;

export const tagSchema = z.object({
  /** Dictionary key — referenced from project `tags` arrays. */
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  group: z.string().optional(),
  weight: z.number().default(0),
});

export type Tag = z.infer<typeof tagSchema>;

export const collectionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  name: z.string().min(1),
  description: z.string().optional(),
  cover: z.string().optional(),
  /** Ordered project slugs in this collection. */
  projectSlugs: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  weight: z.number().default(0),
  ext: z.record(z.string(), z.unknown()).default({}),
});

export type Collection = z.infer<typeof collectionSchema>;

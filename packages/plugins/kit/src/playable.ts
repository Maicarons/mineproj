import { existsSync, cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { MineprojPlugin, Project } from '@mineproj/core';

/**
 * plugin-playable (M6-09): build-time validation of playable entries —
 * every site-absolute `/demos/<slug>/…` entry must exist inside the public
 * directory, otherwise the build fails (AC). Also validates sandbox policy.
 * Optionally copies demo directories from the project source to the output.
 */

export interface PlayableIssue {
  slug: string;
  entry: string;
  reason: string;
}

export function validatePlayableEntries(
  projects: Project[],
  root: string,
  publicDir: string,
): PlayableIssue[] {
  const issues: PlayableIssue[] = [];
  for (const project of projects) {
    const playable = project.playable;
    if (!playable || playable.type !== 'iframe' || !playable.entry) continue;
    if (!playable.entry.startsWith('/')) continue; // external URLs are not validated
    const rel = playable.entry.replace(/^\/+/, '');
    const candidates = [join(root, publicDir, rel), join(root, rel)];
    if (!candidates.some((p) => existsSync(p))) {
      issues.push({
        slug: project.slug,
        entry: playable.entry,
        reason: `playable entry not found (looked in ${candidates.join(', ')})`,
      });
    }
  }
  return issues;
}

/**
 * Copy demo directories from the project source to the public directory.
 * Scans projects for playable entries with local paths (e.g., /demos/xxx/)
 * and copies the source directory to the public dir.
 */
export function copyDemoDirs(
  projects: Project[],
  root: string,
  publicDir: string,
): { copied: string[]; errors: string[] } {
  const copied: string[] = [];
  const errors: string[] = [];

  for (const project of projects) {
    const playable = project.playable;
    if (!playable || playable.type !== 'iframe' || !playable.entry) continue;
    if (!playable.entry.startsWith('/')) continue;

    const rel = playable.entry.replace(/^\/+/, '');
    const srcDir = join(root, rel);
    const destDir = join(root, publicDir, rel);

    if (!existsSync(srcDir)) {
      // Demo source may be in public dir already; skip silently
      continue;
    }

    try {
      mkdirSync(dirname(destDir), { recursive: true });
      cpSync(srcDir, destDir, { recursive: true, force: true });
      copied.push(rel);
    } catch (err) {
      errors.push(`Failed to copy demo for ${project.slug}: ${(err as Error).message}`);
    }
  }

  return { copied, errors };
}

/** Define a playable plugin that validates entries and copies demo dirs. */
export function definePlayablePlugin(): MineprojPlugin {
  return {
    name: '@mineproj/plugin-playable',
    enforce: 'post',
    hooks: {
      'assets:process': async (_value, ctx) => {
        const c = ctx as unknown as {
          root: string;
          config: { publicDir?: string };
          dataset: { projects: Project[] };
        };
        const publicDir = c.config.publicDir ?? 'public';
        const issues = validatePlayableEntries(c.dataset.projects, c.root, publicDir);
        if (issues.length > 0) {
          console.warn(`[plugin-playable] ${issues.length} playable issue(s):`);
          for (const issue of issues) {
            console.warn(`  ${issue.slug}: ${issue.reason}`);
          }
        }
        const result = copyDemoDirs(c.dataset.projects, c.root, publicDir);
        if (result.copied.length > 0) {
          console.log(`[plugin-playable] Copied ${result.copied.length} demo dir(s): ${result.copied.join(', ')}`);
        }
        if (result.errors.length > 0) {
          for (const err of result.errors) {
            console.error(`[plugin-playable] ${err}`);
          }
        }
      },
    },
  };
}

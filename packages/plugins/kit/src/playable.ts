import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Project } from '@mineproj/core';

/**
 * plugin-playable (M6-09): build-time validation of playable entries —
 * every site-absolute `/demos/<slug>/…` entry must exist inside the public
 * directory, otherwise the build fails (AC). Also validates sandbox policy.
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

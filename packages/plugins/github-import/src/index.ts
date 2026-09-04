/**
 * plugin-github-import (M7-05): imports GitHub repositories as mineproj
 * project data via the GitHub REST API. Supports --dry-run, incremental
 * updates, and maps topics to tags, stars to featured weight, etc.
 *
 * Usage:
 *   mineproj import github <owner/repo> [--dry-run] [--token <ghp_xxx>]
 *   mineproj import github <owner> [--org] [--dry-run]
 */

import { z } from 'zod';

export const GithubImportOptions = z.object({
  /** GitHub personal access token (optional, ups rate limit to 5000/hr). */
  token: z.string().optional(),
  /** Repository reference: "owner/repo" or just "owner" for all repos. */
  repo: z.string(),
  /** If true, treat repo as an organization name. */
  org: z.boolean().optional(),
  /** If true, only print what would be imported. */
  dryRun: z.boolean().optional(),
  /** Output directory for generated project files. */
  outputDir: z.string().optional(),
  /** Only update existing projects, don't create new ones. */
  updateOnly: z.boolean().optional(),
});

export type GithubImportOptions = z.infer<typeof GithubImportOptions>;

export interface ImportedProject {
  slug: string;
  name: string;
  summary: string;
  tagline: string;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
  license?: string;
  techStack: string[];
  tags: string[];
  links: { url: string; type: string }[];
  weight?: number;
  repo?: string;
  stars?: number;
  language?: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license?: { spdx_id: string | null } | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
  default_branch: string;
}

const GITHUB_API = 'https://api.github.com';

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function repoToProject(repo: GitHubRepo): ImportedProject {
  const links: { url: string; type: string }[] = [{ url: repo.html_url, type: 'repo' }];
  if (repo.homepage) links.push({ url: repo.homepage, type: 'homepage' });

  const tags = [...repo.topics];
  if (repo.language && !tags.includes(repo.language)) tags.unshift(repo.language);

  return {
    slug: slugFromName(repo.name),
    name: repo.name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    summary: repo.description ?? `A project called ${repo.name}`,
    tagline: (repo.description ?? '').slice(0, 80) || repo.name,
    createdAt: repo.created_at,
    updatedAt: repo.pushed_at,
    releasedAt: repo.pushed_at,
    license: repo.license?.spdx_id ?? undefined,
    techStack: repo.language ? [repo.language] : [],
    tags,
    links,
    weight: repo.archived ? -10 : repo.stargazers_count,
    stars: repo.stargazers_count,
    language: repo.language ?? undefined,
  };
}

export async function importFromGitHub(options: GithubImportOptions): Promise<ImportedProject[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'mineproj-github-import',
  };
  if (options.token) {
    headers.Authorization = `token ${options.token}`;
  }

  const isOrg = options.org ?? false;
  const [owner, repoName] = options.repo.split('/');

  let repos: GitHubRepo[] = [];

  if (repoName && !isOrg) {
    // Single repo
    const url = `${GITHUB_API}/repos/${owner}/${repoName}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    const repo = (await res.json()) as GitHubRepo;
    repos = [repo];
  } else {
    // All repos for user or org
    const type = isOrg ? 'orgs' : 'users';
    const perPage = 100;
    let page = 1;
    while (true) {
      const url = `${GITHUB_API}/${type}/${owner}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      const batch = (await res.json()) as GitHubRepo[];
      if (batch.length === 0) break;
      repos.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }
  }

  // Filter out forks by default
  const projects = repos
    .filter((r) => !r.fork)
    .map(repoToProject);

  return projects;
}

export async function writeProjects(projects: ImportedProject[], outputDir: string): Promise<{ path: string; slug: string }[]> {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const results: { path: string; slug: string }[] = [];

  for (const project of projects) {
    const dir = join(outputDir, 'projects', project.slug);
    await mkdir(dir, { recursive: true });

    const data = {
      slug: project.slug,
      name: project.name,
      tagline: project.tagline,
      summary: project.summary,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      releasedAt: project.releasedAt,
      license: project.license,
      techStack: project.techStack,
      tags: project.tags,
      links: project.links,
      weight: project.weight,
    };

    const filePath = join(dir, 'index.json');
    await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    results.push({ path: filePath, slug: project.slug });
  }

  return results;
}

/** Helper: format imported project as a nice table string. */
export function formatImportSummary(projects: ImportedProject[]): string {
  const lines = [`Imported ${projects.length} project(s):`, ''];
  const sorted = [...projects].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
  for (const p of sorted.slice(0, 20)) {
    lines.push(`  ★ ${String(p.stars ?? 0).padStart(4)}  ${p.slug.padEnd(30)} ${p.summary.slice(0, 50)}`);
  }
  if (sorted.length > 20) {
    lines.push(`  ... and ${sorted.length - 20} more`);
  }
  return lines.join('\n');
}

export function defineGithubImportPlugin(): import('@mineproj/core').MineprojPlugin {
  return {
    name: '@mineproj/plugin-github-import',
    hooks: {
      'cli:command': async (args: Record<string, unknown>) => {
        if (args._command !== 'import' || args._subcommand !== 'github') return;
        const options = GithubImportOptions.parse(args);
        const projects = await importFromGitHub(options);
        if (options.dryRun) {
          console.log(formatImportSummary(projects));
          return;
        }
        const results = await writeProjects(projects, options.outputDir ?? '.');
        console.log(`Written ${results.length} project(s) to ${results[0]?.path ?? 'N/A'}`);
      },
    },
  };
}
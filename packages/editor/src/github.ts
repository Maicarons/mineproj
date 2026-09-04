import type { Transport } from './transport';

/**
 * GitHubTransport (M9-14): reads/writes files via the GitHub Contents API
 * and opens a Pull Request. Token is stored in memory only (sessionStorage).
 */

export interface GitHubTransportOptions {
  owner: string;
  repo: string;
  branch?: string;
  token: string;
  baseBranch?: string;
}

export function createGitHubTransport(options: GitHubTransportOptions): Transport & { createPr(title: string, body: string): Promise<{ url: string }> } {
  const { owner, repo, token, baseBranch = 'main' } = options;
  const branch = options.branch ?? `editor-${Date.now()}`;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  async function api(path: string, method = 'GET', body?: unknown): Promise<unknown> {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`GitHub API error: ${(err as { message: string }).message}`);
    }
    return response.json();
  }

  return {
    async read(path) {
      try {
        const data = await api(`/contents/${path}?ref=${branch}`) as { content?: string; encoding?: string };
        if (data.content && data.encoding === 'base64') {
          return Buffer.from(data.content, 'base64').toString('utf-8');
        }
        return null;
      } catch {
        return null;
      }
    },

    async write(path, content) {
      try {
        // Try to get existing file SHA
        let sha: string | undefined;
        try {
          const existing = await api(`/contents/${path}?ref=${branch}`) as { sha?: string };
          sha = existing.sha;
        } catch {
          // File doesn't exist yet
        }

        await api(`/contents/${path}`, 'PUT', {
          message: `Edit ${path} via mineproj editor`,
          content: Buffer.from(content, 'utf-8').toString('base64'),
          branch,
          sha,
        });
        return { success: true, path };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    },

    async delete(path) {
      try {
        const existing = await api(`/contents/${path}?ref=${branch}`) as { sha?: string };
        await api(`/contents/${path}`, 'DELETE', {
          message: `Delete ${path} via mineproj editor`,
          branch,
          sha: existing.sha,
        });
        return { success: true, path };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    },

    async list(dir) {
      try {
        const data = await api(`/contents/${dir}?ref=${branch}`) as { name: string }[];
        return data.map((item) => item.name);
      } catch {
        return [];
      }
    },

    async createPr(title, body) {
      // Ensure branch exists
      try {
        const base = await api(`/git/ref/heads/${baseBranch}`) as { object: { sha: string } };
        await api('/git/refs', 'POST', {
          ref: `refs/heads/${branch}`,
          sha: base.object.sha,
        });
      } catch {
        // Branch might already exist
      }

      const pr = await api('/pulls', 'POST', {
        title,
        body,
        head: branch,
        base: baseBranch,
      }) as { html_url: string };
      return { url: pr.html_url };
    },
  };
}
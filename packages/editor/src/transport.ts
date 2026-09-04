import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname, resolve, normalize } from 'node:path';

/**
 * Editor transports (M9-11/13/14): write data to different backends with
 * security hardening. FsTransport is the primary transport for local
 * development; it validates paths, creates backups, and rejects traversal.
 */

export interface TransportResult {
  success: boolean;
  path?: string;
  error?: string;
  backupPath?: string;
}

export interface Transport {
  /** Read a file from the content directory. */
  read(path: string): Promise<string | null>;
  /** Write a file with backup and validation. */
  write(path: string, content: string): Promise<TransportResult>;
  /** Delete a file with backup. */
  delete(path: string): Promise<TransportResult>;
  /** List files in a directory. */
  list(dir: string): Promise<string[]>;
}

const ALLOWED_EXTENSIONS = new Set(['.json', '.md', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.yaml', '.yml', '.toml']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validatePath(root: string, filePath: string): string | null {
  const normalized = normalize(join(root, filePath));
  if (!normalized.startsWith(root)) {
    return 'Path traversal detected';
  }
  const ext = normalized.slice(normalized.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return `File extension "${ext}" is not allowed`;
  }
  return null;
}

async function backupPath(root: string, filePath: string): Promise<string> {
  const backupDir = join(root, '.mineproj', 'backup');
  await mkdir(backupDir, { recursive: true });
  const timestamp = Date.now();
  const relPath = filePath.replace(/[/\\]/g, '_');
  return join(backupDir, `${timestamp}_${relPath}`);
}

export function createFsTransport(root: string): Transport {
  const contentDir = resolve(root);

  return {
    async read(path) {
      const error = validatePath(contentDir, path);
      if (error) throw new Error(error);
      try {
        return await readFile(join(contentDir, path), 'utf-8');
      } catch {
        return null;
      }
    },

    async write(path, content) {
      const error = validatePath(contentDir, path);
      if (error) return { success: false, error };

      const fullPath = join(contentDir, path);
      const backPath = await backupPath(contentDir, path);

      // Check file size
      if (Buffer.byteLength(content, 'utf-8') > MAX_FILE_SIZE) {
        return { success: false, error: 'File exceeds maximum size of 10 MB' };
      }

      // Create backup of existing file
      try {
        await copyFile(fullPath, backPath);
      } catch {
        // No existing file to backup
      }

      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, 'utf-8');
      return { success: true, path, backupPath: backPath };
    },

    async delete(path) {
      const error = validatePath(contentDir, path);
      if (error) return { success: false, error };

      const fullPath = join(contentDir, path);
      const backPath = await backupPath(contentDir, path);

      try {
        await copyFile(fullPath, backPath);
        await writeFile(fullPath, Buffer.alloc(0), 'utf-8');
        return { success: true, path, backupPath: backPath };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    },

    async list(dir) {
      const error = validatePath(contentDir, dir);
      if (error) throw new Error(error);
      const { readdir } = await import('node:fs/promises');
      const entries = await readdir(join(contentDir, dir), { withFileTypes: true });
      return entries.map((e) => e.name);
    },
  };
}

/** MemoryTransport (M9-13): in-memory store for testing and static export. */
export function createMemoryTransport(): Transport & { exportSnapshot(): Record<string, string> } {
  const store = new Map<string, string>();
  return {
    async read(path) { return store.get(path) ?? null; },
    async write(path, content) { store.set(path, content); return { success: true, path }; },
    async delete(path) { store.delete(path); return { success: true, path }; },
    async list(dir) { return [...store.keys()].filter((k) => k.startsWith(dir)).map((k) => k.slice(dir.length)); },
    exportSnapshot() { return Object.fromEntries(store); },
  };
}
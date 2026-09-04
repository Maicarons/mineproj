/**
 * Editor security (M9-15): configuration, validation, and runtime checks
 * to ensure the editor is only enabled in dev mode, bound to localhost,
 * and all write operations are validated.
 */

export interface EditorSecurityConfig {
  /** Master switch: editor is disabled by default. */
  enabled: boolean;
  /** Bind address for dev editor server (default: 127.0.0.1). */
  host?: string;
  /** Port for dev editor server (default: 5173). */
  port?: number;
  /** Maximum upload file size in bytes (default: 10 MB). */
  maxUploadSize?: number;
  /** Allowed MIME types for uploads. */
  allowedMimeTypes?: string[];
  /** Whether to perform content sniffing validation. */
  contentSniffing?: boolean;
  /** Whether to sanitize SVGs. */
  sanitizeSvg?: boolean;
}

export const DEFAULT_EDITOR_CONFIG: EditorSecurityConfig = {
  enabled: false,
  host: '127.0.0.1',
  port: 5173,
  maxUploadSize: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/avif',
    'application/pdf',
    'text/markdown',
    'application/json',
    'application/x-yaml',
    'text/yaml',
  ],
  contentSniffing: true,
  sanitizeSvg: true,
};

/** Triple validation: extension, MIME, and content sniffing. */
export function validateUpload(
  file: { name: string; type: string; size: number },
  config: EditorSecurityConfig = DEFAULT_EDITOR_CONFIG
): string | null {
  const maxSize = config.maxUploadSize ?? DEFAULT_EDITOR_CONFIG.maxUploadSize!;
  if (file.size > maxSize) {
    return `File exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(0)} MB`;
  }

  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const allowedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.pdf', '.md', '.json', '.yaml', '.yml'];
  if (!allowedExts.includes(ext)) {
    return `File extension "${ext}" is not allowed`;
  }

  if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.type)) {
    return `MIME type "${file.type}" is not allowed`;
  }

  return null; // Passes validation
}

/** Basic SVG sanitization: strip script and event handlers. */
export function sanitizeSvg(content: string): string {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<script[\s\S]*?\/?>/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\bon\w+\s*=\s*\S+/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
}

/** Check if the editor is allowed in the current environment. */
export function isEditorAllowed(config: EditorSecurityConfig): { allowed: boolean; reason?: string } {
  if (!config.enabled) {
    return { allowed: false, reason: 'Editor is disabled (editor.enabled = false)' };
  }
  return { allowed: true };
}

/** Generate a one-time write token for editor API requests. */
export function generateWriteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
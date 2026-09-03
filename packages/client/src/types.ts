/**
 * Client-side types mirroring the `/api/v1` response envelopes.
 * Kept local (not imported from @mineproj/core) so the SDK stays
 * dependency-light and browser-safe.
 */

export interface Envelope<T = unknown> {
  apiVersion: string;
  kind: string;
  generatedAt: string;
  schemaVersion: string;
  total?: number;
  page?: number;
  pageSize?: number;
  data: T;
  facets?: Record<string, Record<string, number>>;
}

export interface ApiErrorEnvelope {
  apiVersion: string;
  error: { code: string; message: string };
}

export type ApiErrorCode = 'NOT_FOUND' | 'TIMEOUT' | 'NETWORK' | 'HTTP' | 'INTERNAL';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** Query parameters accepted by `/api/v1/projects`. */
export interface ProjectQuery {
  q?: string;
  tag?: string[];
  tagMode?: 'and' | 'or';
  category?: string;
  status?: string;
  platform?: string[];
  playable?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
  fields?: string[];
}

export interface SearchDocument {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  tags: string;
}

export interface SearchIndexPayload {
  index: unknown;
  documents: SearchDocument[];
}

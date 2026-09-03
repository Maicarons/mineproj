import { projectSchema, type Project } from '@mineproj/schema';

/**
 * Data validation with file-level error reporting.
 * Every issue is rendered as `file:field: expected/actual` so build logs
 * point straight at the offending JSON field.
 */

export interface DataIssue {
  /** File the problem was found in (relative to site root). */
  file: string;
  /** Field path inside the file, e.g. `tags.0` or `links.1.url`. */
  field: string;
  /** Zod message, carries the expected/received detail. */
  message: string;
}

export function formatDataIssue(issue: DataIssue): string {
  return `  ${issue.file}:${issue.field}: ${issue.message}`;
}

export function formatDataIssues(issues: DataIssue[]): string {
  return issues.map(formatDataIssue).join('\n');
}

interface ZodLikeIssue {
  path: (string | number | symbol)[];
  message: string;
}

interface ZodLikeError {
  issues: ZodLikeIssue[];
}

export function zodIssuesToDataIssues(file: string, error: ZodLikeError): DataIssue[] {
  return error.issues.map((issue) => ({
    file,
    field: issue.path.length > 0 ? issue.path.join('.') : '(root)',
    message: issue.message,
  }));
}

export class DataValidationError extends Error {
  readonly issues: DataIssue[];

  constructor(file: string, error: ZodLikeError) {
    const issues = zodIssuesToDataIssues(file, error);
    super(`Invalid data:\n${formatDataIssues(issues)}`);
    this.name = 'DataValidationError';
    this.issues = issues;
  }
}

/**
 * Parse and validate a raw project payload. Throws `DataValidationError`
 * whose message contains the file path and every invalid field path.
 */
export function validateProject(file: string, raw: unknown): Project {
  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    throw new DataValidationError(file, result.error);
  }
  return result.data;
}

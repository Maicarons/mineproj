/**
 * JSON Schema export (M7-09): converts Zod schemas to JSON Schema format
 * and writes them to .mineproj/schema.json with VSCode settings mapping.
 */

import { z } from 'zod';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/**
 * Convert a Zod type to a rough JSON Schema representation.
 * Uses `as never` casts for Zod 4 compatibility.
 */
function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const s = schema as any;
  const typeName = s?._def?.typeName as string | undefined;

  if (typeName === 'ZodString') {
    const result: Record<string, unknown> = { type: 'string' };
    const min = (s as { minLength?: number | null }).minLength;
    const max = (s as { maxLength?: number | null }).maxLength;
    if (min != null) result.minLength = min;
    if (max != null) result.maxLength = max;
    return result;
  }
  if (typeName === 'ZodNumber') {
    const result: Record<string, unknown> = { type: 'number' };
    const min = (s as { minValue?: number | null }).minValue;
    const max = (s as { maxValue?: number | null }).maxValue;
    if (min != null) result.minimum = min;
    if (max != null) result.maximum = max;
    return result;
  }
  if (typeName === 'ZodBoolean') {
    return { type: 'boolean' };
  }
  if (typeName === 'ZodArray') {
    const element = s.element as z.ZodType;
    return { type: 'array', items: zodToJsonSchema(element) };
  }
  if (typeName === 'ZodObject') {
    const shape = s.shape as Record<string, z.ZodType>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, fieldSchema] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(fieldSchema);
      if (!fieldSchema.isOptional()) {
        required.push(key);
      }
    }
    const result: Record<string, unknown> = { type: 'object', properties };
    if (required.length > 0) result.required = required;
    return result;
  }
  if (typeName === 'ZodEnum') {
    const values = s._def.values as readonly string[];
    return { type: 'string', enum: [...values] };
  }
  if (typeName === 'ZodDefault') {
    const innerType = s._def.innerType as z.ZodType;
    const result = zodToJsonSchema(innerType);
    const defaultValue = s._def.defaultValue;
    if (defaultValue !== undefined) result.default = defaultValue;
    return result;
  }
  if (typeName === 'ZodOptional') {
    const innerType = s._def.innerType as z.ZodType;
    return zodToJsonSchema(innerType);
  }
  if (typeName === 'ZodUnion') {
    const options = s._def.options as z.ZodType[];
    return { anyOf: options.map((opt: z.ZodType) => zodToJsonSchema(opt)) };
  }
  return {};
}

/**
 * Export all schemas to JSON Schema format and write to output directory.
 */
export async function exportJsonSchema(
  schemas: Record<string, z.ZodType>,
  outputDir: string,
  projectRoot: string,
): Promise<{ schemaPath: string; vscodeSettingsPath: string }> {
  const dir = resolve(outputDir, '.mineproj');
  await mkdir(dir, { recursive: true });

  const schemaDoc: Record<string, unknown> = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://mineproj.dev/schemas/project.json',
    title: 'mineproj Project Schema',
    description: 'Schema for mineproj project data files',
    definitions: {},
  };

  for (const [name, schema] of Object.entries(schemas)) {
    (schemaDoc.definitions as Record<string, unknown>)[name] = zodToJsonSchema(schema);
  }

  const schemaPath = join(dir, 'schema.json');
  await writeFile(schemaPath, JSON.stringify(schemaDoc, null, 2) + '\n', 'utf-8');

  const vscodeDir = join(resolve(projectRoot), '.vscode');
  await mkdir(vscodeDir, { recursive: true });
  const vscodeSettingsPath = join(vscodeDir, 'settings.json');

  const vscodeSettings = {
    'json.schemas': [
      { fileMatch: ['data/projects/**/index.json'], url: './.mineproj/schema.json' },
      { fileMatch: ['data/profile.json'], url: './.mineproj/schema.json' },
      { fileMatch: ['data/tags.json'], url: './.mineproj/schema.json' },
    ],
  };

  await writeFile(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2) + '\n', 'utf-8');
  return { schemaPath, vscodeSettingsPath };
}
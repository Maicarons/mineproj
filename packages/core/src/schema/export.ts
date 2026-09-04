/**
 * JSON Schema export (M7-09): converts Zod schemas to JSON Schema format
 * and writes them to .mineproj/schema.json with VSCode settings mapping
 * for autocompletion and hover documentation.
 */

import { z } from 'zod';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/**
 * Convert a Zod type to a rough JSON Schema representation.
 * This is a simplified converter that handles the common types used
 * in mineproj schemas.
 */
function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodString) {
    const result: Record<string, unknown> = { type: 'string' };
    if (schema.minLength !== null && schema.minLength !== undefined) result.minLength = schema.minLength;
    if (schema.maxLength !== null && schema.maxLength !== undefined) result.maxLength = schema.maxLength;
    if (schema.isNullable) result.type = ['string', 'null'];
    return result;
  }
  if (schema instanceof z.ZodNumber) {
    const result: Record<string, unknown> = { type: 'number' };
    if (schema.minValue !== null && schema.minValue !== undefined) result.minimum = schema.minValue;
    if (schema.maxValue !== null && schema.maxValue !== undefined) result.maximum = schema.maxValue;
    return result;
  }
  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }
  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema.element),
    };
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
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
  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema._def.values as string[],
    };
  }
  if (schema instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(schema._def.innerType);
    if (schema._def.defaultValue !== undefined) {
      inner.default = schema._def.defaultValue;
    }
    return inner;
  }
  if (schema instanceof z.ZodOptional) {
    const inner = zodToJsonSchema(schema._def.innerType);
    return inner;
  }
  if (schema instanceof z.ZodUnion) {
    return {
      anyOf: schema._def.options.map((opt: z.ZodType) => zodToJsonSchema(opt)),
    };
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

  // Build the JSON Schema document
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

  // Write VSCode settings for autocompletion
  const vscodeDir = join(resolve(projectRoot), '.vscode');
  await mkdir(vscodeDir, { recursive: true });
  const vscodeSettingsPath = join(vscodeDir, 'settings.json');

  const vscodeSettings = {
    'json.schemas': [
      {
        fileMatch: ['data/projects/**/index.json'],
        url: './.mineproj/schema.json',
      },
      {
        fileMatch: ['data/profile.json'],
        url: './.mineproj/schema.json',
      },
      {
        fileMatch: ['data/tags.json'],
        url: './.mineproj/schema.json',
      },
    ],
  };

  await writeFile(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2) + '\n', 'utf-8');

  return { schemaPath, vscodeSettingsPath };
}
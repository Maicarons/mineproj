import { zodToJsonSchema } from 'zod-to-json-schema';
import { projectSchema, siteConfigSchema, profileSchema, tagSchema, collectionSchema } from './index';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/** Generate JSON Schema files for all data contracts. */
export function generateAllJsonSchemas(): Record<string, ReturnType<typeof zodToJsonSchema>> {
  return {
    'project': zodToJsonSchema(projectSchema),
    'site-config': zodToJsonSchema(siteConfigSchema),
    'profile': zodToJsonSchema(profileSchema),
    'tag': zodToJsonSchema(tagSchema),
    'collection': zodToJsonSchema(collectionSchema),
  };
}

/** Write JSON Schema files to the given output directory. */
export async function emitJsonSchemas(outDir: string): Promise<void> {
  const schemas = generateAllJsonSchemas();
  await mkdir(outDir, { recursive: true });
  for (const [name, schema] of Object.entries(schemas)) {
    const file = join(outDir, `${name}.schema.json`);
    await writeFile(file, JSON.stringify(schema, null, 2), 'utf-8');
  }
}

/** Generate VSCode settings for auto-completion on JSON files. */
export function generateVscodeSettings(relativeSchemaDir: string): Record<string, unknown> {
  return {
    'json.schemas': [
      {
        fileMatch: ['data/projects/**/index.json'],
        url: `./${relativeSchemaDir}/project.schema.json`,
      },
      {
        fileMatch: ['data/profile.json'],
        url: `./${relativeSchemaDir}/profile.schema.json`,
      },
      {
        fileMatch: ['data/tags.json'],
        url: `./${relativeSchemaDir}/tag.schema.json`,
      },
      {
        fileMatch: ['data/collections.json'],
        url: `./${relativeSchemaDir}/collection.schema.json`,
      },
      {
        fileMatch: ['mineproj.config.json'],
        url: `./${relativeSchemaDir}/site-config.schema.json`,
      },
    ],
  };
}
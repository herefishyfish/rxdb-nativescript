import { RxJsonSchema, toTypedRxJsonSchema, ExtractDocumentTypeFromTypedRxJsonSchema } from 'rxdb';

export const HERO_SCHEMA_LITERAL = {
  title: 'hero schema',
  description: 'describes a simple hero',
  version: 0,
  keyCompression: false,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
      maxLength: 100,
    },
    color: {
      type: 'string',
      maxLength: 30,
    },
    createdAt: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
    // deleted: {
    //   type: 'boolean',
    // }
  },
  required: ['id', 'name', 'color'],
} as const;

const schemaTyped = toTypedRxJsonSchema(HERO_SCHEMA_LITERAL);
export type RxHeroDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const HERO_SCHEMA: RxJsonSchema<RxHeroDocumentType> = HERO_SCHEMA_LITERAL;

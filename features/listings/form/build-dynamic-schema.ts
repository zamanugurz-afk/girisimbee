/**
 * Dynamic Zod schema builder — generates validators from ListingFieldSchema.
 * Core engine: never hardcode category fields; always derive from config.
 */
import { z } from 'zod';
import type { ListingFieldDefinition, ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import { remotePolicySchema } from '@/features/listings/validation/listing.schema';
import { uuidSchema } from '@/lib/domain/validation';

function fieldToZod(field: ListingFieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'string':
      schema = z.string();
      if (field.max !== undefined) schema = (schema as z.ZodString).max(field.max);
      break;
    case 'number':
    case 'currency':
      schema = z.coerce.number();
      if (field.min !== undefined) schema = (schema as z.ZodNumber).min(field.min);
      if (field.max !== undefined) schema = (schema as z.ZodNumber).max(field.max);
      break;
    case 'percentage':
      schema = z.coerce.number().min(field.min ?? 0).max(field.max ?? 100);
      break;
    case 'boolean':
      schema = z.boolean();
      break;
    case 'date':
      schema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
      break;
    case 'enum':
      if (!field.options?.length) {
        schema = z.string();
      } else {
        schema = z.enum(field.options as [string, ...string[]]);
      }
      break;
    default:
      schema = z.unknown();
  }

  if (!field.required) {
    schema = schema.optional().nullable();
  }

  return schema;
}

/** Build Zod object schema for customFields from a field schema config. */
export function buildDynamicFieldsSchema(fieldSchema: ListingFieldSchema): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fieldSchema.fields) {
    shape[field.key] = fieldToZod(field);
  }
  return z.object(shape);
}

/** Accept http(s) URLs and data URLs (mock/local uploads). */
export const listingImageUrlSchema = z.string().refine(
  (value) => {
    if (value.startsWith('data:image/')) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'Geçerli bir görsel URL girin.' },
);

/** Core listing fields — shared across all categories. */
export const coreListingFieldsSchema = z.object({
  title: z.string().min(5, 'Başlık en az 5 karakter olmalı.').max(200),
  shortDescription: z.string().min(20, 'Kısa açıklama en az 20 karakter olmalı.').max(500),
  longDescription: z.string().max(10000).optional().default(''),
  location: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().default('TR'),
  remotePolicy: remotePolicySchema.nullable().optional(),
  companyId: uuidSchema.nullable().optional(),
});

/** Relaxed core fields for draft saves. */
export const draftCoreListingFieldsSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı.').max(200),
  shortDescription: z.string().max(500).optional().default(''),
  longDescription: z.string().max(10000).optional().default(''),
  location: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().default('TR'),
  remotePolicy: remotePolicySchema.nullable().optional(),
  companyId: uuidSchema.nullable().optional(),
});

export type CoreListingFieldsInput = z.infer<typeof coreListingFieldsSchema>;

/** Tags and images — optional metadata on create/update */
export const listingMetaSchema = z.object({
  tags: z.array(z.string().min(2).max(50)).max(20).optional().default([]),
  images: z.array(z.object({
    url: listingImageUrlSchema,
    alt: z.string().max(200).nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })).max(10).optional().default([]),
});

export type ListingMetaInput = z.infer<typeof listingMetaSchema>;

/**
 * Build draft create-listing schema — relaxed validation for partial saves.
 */
export function buildDraftListingFormSchema(fieldSchema: ListingFieldSchema) {
  const dynamicSchema = buildDynamicFieldsSchema(fieldSchema).partial();
  return z.object({
    categoryId: uuidSchema,
    listingTypeId: uuidSchema,
    core: draftCoreListingFieldsSchema,
    customFields: dynamicSchema,
    tags: listingMetaSchema.shape.tags,
    images: listingMetaSchema.shape.images,
  });
}

/**
 * Build complete create-listing Zod schema for a specific listing type.
 * Merges core fields + dynamic customFields + meta.
 */
export function buildCreateListingFormSchema(fieldSchema: ListingFieldSchema) {
  const dynamicSchema = buildDynamicFieldsSchema(fieldSchema);
  return z.object({
    categoryId: uuidSchema,
    listingTypeId: uuidSchema,
    core: coreListingFieldsSchema,
    customFields: dynamicSchema,
    tags: listingMetaSchema.shape.tags,
    images: listingMetaSchema.shape.images,
  });
}

/**
 * Build update-listing Zod schema — all sections optional.
 */
export function buildUpdateListingFormSchema(fieldSchema: ListingFieldSchema) {
  const dynamicSchema = buildDynamicFieldsSchema(fieldSchema).partial();
  return z.object({
    core: coreListingFieldsSchema.partial().optional(),
    customFields: dynamicSchema.optional(),
    tags: listingMetaSchema.shape.tags.optional(),
    images: listingMetaSchema.shape.images.optional(),
  });
}

/** Validate custom fields and return typed result or throw ZodError */
export function validateCustomFields(
  fieldSchema: ListingFieldSchema,
  values: Record<string, unknown>,
): Record<string, unknown> {
  return buildDynamicFieldsSchema(fieldSchema).parse(values);
}

/** Validate full create payload against listing type config */
export function validateCreateListingForm(
  fieldSchema: ListingFieldSchema,
  input: unknown,
) {
  return buildCreateListingFormSchema(fieldSchema).parse(input);
}

/** Validate draft create/update payload */
export function validateDraftListingForm(
  fieldSchema: ListingFieldSchema,
  input: unknown,
) {
  return buildDraftListingFormSchema(fieldSchema).parse(input);
}

/** Validate update payload */
export function validateUpdateListingForm(
  fieldSchema: ListingFieldSchema,
  input: unknown,
) {
  return buildUpdateListingFormSchema(fieldSchema).parse(input);
}

/** Extract default values for dynamic fields (for form initialization) */
export function getDynamicFieldDefaults(fieldSchema: ListingFieldSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of fieldSchema.fields) {
    switch (field.type) {
      case 'boolean':
        defaults[field.key] = false;
        break;
      case 'number':
      case 'currency':
      case 'percentage':
        defaults[field.key] = field.min ?? undefined;
        break;
      case 'enum':
        defaults[field.key] = field.options?.[0] ?? '';
        break;
      default:
        defaults[field.key] = '';
    }
  }
  return defaults;
}

/** Default values for core fields */
export function getCoreFieldDefaults(): CoreListingFieldsInput {
  return {
    title: '',
    shortDescription: '',
    longDescription: '',
    location: null,
    city: null,
    country: 'TR',
    remotePolicy: null,
    companyId: null,
  };
}

/** Full form defaults for a listing type */
export function getListingFormDefaults(fieldSchema: ListingFieldSchema) {
  return {
    core: getCoreFieldDefaults(),
    customFields: getDynamicFieldDefaults(fieldSchema),
    tags: [] as string[],
    images: [] as { url: string; alt?: string | null; sortOrder?: number }[],
  };
}

type FormStepPayload = {
  core: CoreListingFieldsInput;
  customFields: Record<string, unknown>;
  tags: string[];
  images: { url: string; alt?: string | null; sortOrder?: number }[];
};

/**
 * Validate a single wizard step — partial core + subset of custom fields.
 */
export function validateListingFormStep(
  fieldSchema: ListingFieldSchema,
  step: {
    coreFields?: (keyof CoreListingFieldsInput)[];
    customFieldKeys?: string[];
    meta?: ('tags' | 'images')[];
  },
  payload: FormStepPayload,
  mode: 'draft' | 'full',
): void {
  const coreBase = mode === 'draft' ? draftCoreListingFieldsSchema : coreListingFieldsSchema;

  if (step.coreFields?.length) {
    const pick = Object.fromEntries(step.coreFields.map((k) => [k, true])) as Record<
      keyof CoreListingFieldsInput,
      true
    >;
    coreBase.pick(pick).parse(
      Object.fromEntries(step.coreFields.map((k) => [k, payload.core[k]])),
    );
  }

  if (step.customFieldKeys?.length) {
    const subset: ListingFieldSchema = {
      fields: fieldSchema.fields.filter((f) => step.customFieldKeys!.includes(f.key)),
    };
    if (subset.fields.length > 0) {
      const schema =
        mode === 'draft'
          ? buildDynamicFieldsSchema(subset).partial()
          : buildDynamicFieldsSchema(subset);
      const picked: Record<string, unknown> = {};
      for (const key of step.customFieldKeys) {
        picked[key] = payload.customFields[key];
      }
      schema.parse(picked);
    }
  }

  if (step.meta?.includes('tags')) {
    listingMetaSchema.shape.tags.parse(payload.tags);
  }
  if (step.meta?.includes('images')) {
    listingMetaSchema.shape.images.parse(payload.images);
  }
}

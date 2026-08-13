/**
 * Dynamic Zod schema builder — generates validators from ListingFieldSchema.
 * Core engine: never hardcode category fields; always derive from config.
 */
import { z } from 'zod';
import type { ListingFieldDefinition, ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import {
  resolveStepCustomFields,
  type ListingFormStepDef,
} from '@/features/listings/config/listing-form-steps.config';
import { remotePolicySchema } from '@/features/listings/validation/listing.schema';
import { uuidSchema } from '@/lib/domain/validation';
import {
  contentPolicyIssuesToFieldErrors,
  validateListingContentPolicy,
} from '@/features/listings/lib/listing-content-policy';
import { evaluateListingContentQuality } from '@/features/listings/lib/listing-content-quality';

const STAGE_FIELD_KEY = 'stage';

function normalizeEnumValue(value: string): string {
  return value.trim().normalize('NFC');
}

/** Match a stored enum value to its canonical option (trim + Unicode NFC). */
export function resolveEnumOption(
  value: unknown,
  options: readonly string[],
): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;

  const normalized = normalizeEnumValue(String(value));
  return options.find((option) => normalizeEnumValue(option) === normalized);
}

function logStagePipeline(
  step: string,
  data: {
    'payload.customFields.stage'?: unknown;
    'defaults.stage'?: unknown;
    'merged.stage'?: unknown;
    'picked.stage'?: unknown;
    'schema.stage'?: unknown;
  },
) {
  console.log(`[ListingForm:stage] ${step}`, data);
}

function fieldToZod(field: ListingFieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'string': {
      let stringSchema = z.string();
      if (field.max !== undefined) {
        stringSchema = stringSchema.max(field.max);
      }
      if (field.min !== undefined) {
        const min = field.min;
        const message = `${field.label} en az ${min} karakter olmalıdır.`;
        if (field.required) {
          stringSchema = stringSchema.min(min, message);
        } else {
          schema = stringSchema.refine(
            (val) => !val.trim() || val.trim().length >= min,
            { message },
          );
          break;
        }
      }
      schema = stringSchema;
      break;
    }
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
    case 'enum': {
      const options = field.options ?? [];
      const message = `${field.label} seçilmelidir.`;

      if (!options.length) {
        schema = z.string();
        break;
      }

      const enumSchema = z
        .string()
        .superRefine((val, ctx) => {
          if (!val) {
            if (field.required) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message });
            }
            return;
          }

          if (!resolveEnumOption(val, options)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message });
          }
        })
        .transform((val) => resolveEnumOption(val, options) ?? val);

      if (field.required) {
        schema = z.preprocess(
          (val) => (val === undefined || val === null ? '' : String(val)),
          enumSchema,
        );
      } else {
        schema = z.preprocess(
          (val) => {
            if (val === undefined || val === null || val === '') return undefined;
            return String(val);
          },
          enumSchema.optional(),
        );
      }
      break;
    }
    case 'multi-enum': {
      const options = field.options ?? [];
      const message = `${field.label} için en az bir seçenek işaretleyin.`;

      const multiSchema = z
        .array(z.string())
        .superRefine((values, ctx) => {
          const normalized = values
            .map((value) => resolveEnumOption(value, options) ?? value.trim())
            .filter(Boolean);

          if (field.required && normalized.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message });
            return;
          }

          for (const value of normalized) {
            if (options.length && !resolveEnumOption(value, options)) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message });
            }
          }
        })
        .transform((values) =>
          values
            .map((value) => resolveEnumOption(value, options) ?? value.trim())
            .filter(Boolean),
        );

      schema = field.required ? multiSchema : multiSchema.optional();
      break;
    }
    default:
      schema = z.unknown();
  }

  if (!field.required) {
    schema = schema.optional().nullable();
  }

  return schema;
}

/** Build Zod object schema for a subset of custom fields. */
export function buildPartialDynamicFieldsSchema(
  fieldSchema: ListingFieldSchema,
  fieldKeys: string[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fieldSchema.fields) {
    if (fieldKeys.includes(field.key)) {
      shape[field.key] = fieldToZod(field);
    }
  }
  return z.object(shape);
}

/** Build Zod object schema for customFields from a field schema config. */
export function buildDynamicFieldsSchema(fieldSchema: ListingFieldSchema): z.ZodObject<Record<string, z.ZodTypeAny>> {
  return buildPartialDynamicFieldsSchema(
    fieldSchema,
    fieldSchema.fields.map((field) => field.key),
  );
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
  title: z
    .string({ required_error: 'Başlık zorunludur.' })
    .trim()
    .min(5, 'Başlık en az 5 karakter olmalı.')
    .max(200),
  shortDescription: z
    .string({ required_error: 'Kısa açıklama zorunludur.' })
    .trim()
    .min(30, 'Kısa açıklama en az 30 karakter olmalı.')
    .max(500),
  longDescription: z
    .string({ required_error: 'Detaylı açıklama zorunludur.' })
    .trim()
    .min(100, 'Detaylı açıklama en az 100 karakter olmalı.')
    .max(10000),
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
  tags: z.array(z.string().min(1).max(50)).max(10).optional().default([]),
  images: z.array(z.object({
    url: listingImageUrlSchema,
    alt: z.string().max(200).nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })).max(10).optional().default([]),
});

export type ListingMetaInput = z.infer<typeof listingMetaSchema>;

/**
 * Build create-listing schema limited to fields shown in the wizard.
 * Hidden/system fields are excluded from validation.
 */
export function buildWizardVisibleListingFormSchema(
  fieldSchema: ListingFieldSchema,
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
) {
  const visibleCore = new Set<keyof CoreListingFieldsInput>();
  const visibleCustom = new Set<string>();
  let includeTags = false;
  let includeImages = false;

  for (const step of steps) {
    if (step.preview || step.publish || step.package) continue;
    step.coreFields?.forEach((key) => visibleCore.add(key));
    resolveStepCustomFields(step, allFieldKeys).forEach((key) => visibleCustom.add(key));
    if (step.meta?.includes('tags')) includeTags = true;
    if (step.meta?.includes('images')) includeImages = true;
  }

  const coreShape: Record<string, z.ZodTypeAny> = {};
  for (const key of visibleCore) {
    const coreField = coreListingFieldsSchema.shape[key];
    if (coreField) {
      coreShape[key] = coreField;
    }
  }

  const shape: Record<string, z.ZodTypeAny> = {
    core: z.object(coreShape),
    customFields: buildPartialDynamicFieldsSchema(fieldSchema, [...visibleCustom]),
  };

  if (includeTags) {
    shape.tags = listingMetaSchema.shape.tags;
  }
  if (includeImages) {
    shape.images = listingMetaSchema.shape.images;
  }

  return z.object(shape);
}

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
        defaults[field.key] = field.required ? '' : undefined;
        break;
      case 'multi-enum':
        defaults[field.key] = [];
        break;
      default:
        defaults[field.key] = '';
    }
  }
  return defaults;
}

/** Merge persisted custom field values onto category defaults (keeps every schema key). */
export function mergeCustomFieldDefaults(
  fieldSchema: ListingFieldSchema,
  customFields: Record<string, unknown>,
): Record<string, unknown> {
  const defaults = getDynamicFieldDefaults(fieldSchema);
  const merged: Record<string, unknown> = { ...defaults };

  for (const field of fieldSchema.fields) {
    const incoming = customFields[field.key];
    const hasIncoming =
      field.type === 'multi-enum'
        ? Array.isArray(incoming) && incoming.length > 0
        : incoming !== undefined
          && incoming !== null
          && !(typeof incoming === 'string' && incoming === '');

    if (hasIncoming) {
      merged[field.key] = incoming;
    }
  }

  // Preserve non-schema keys (e.g. experiences[]) used by career-profile editor.
  for (const [key, value] of Object.entries(customFields)) {
    if (!fieldSchema.fields.some((field) => field.key === key) && value !== undefined) {
      merged[key] = value;
    }
  }

  for (const field of fieldSchema.fields) {
    if (field.type === 'multi-enum' && field.options?.length) {
      let raw = merged[field.key];
      if (typeof raw === 'string' && raw.trim()) {
        raw = raw.split(',').map((value) => value.trim()).filter(Boolean);
        merged[field.key] = raw;
      }
      if (!Array.isArray(raw)) {
        if (!field.required) merged[field.key] = [];
        continue;
      }
      merged[field.key] = (raw as unknown[])
        .map((value) => resolveEnumOption(value, field.options!) ?? String(value).trim())
        .filter(Boolean);
      continue;
    }

    if (field.type !== 'enum' || !field.options?.length) continue;

    const raw = merged[field.key];
    if (raw === null || raw === undefined || raw === '') {
      if (!field.required) {
        merged[field.key] = undefined;
      }
      continue;
    }

    const canonical = resolveEnumOption(raw, field.options);
    if (canonical) {
      merged[field.key] = canonical;
      continue;
    }

    // Keep non-empty user values — do not silently replace with undefined.
    merged[field.key] = String(raw);
  }

  if (STAGE_FIELD_KEY in defaults || STAGE_FIELD_KEY in customFields) {
    const stageField = fieldSchema.fields.find((field) => field.key === STAGE_FIELD_KEY);
    logStagePipeline('mergeCustomFieldDefaults', {
      'payload.customFields.stage': customFields[STAGE_FIELD_KEY],
      'defaults.stage': defaults[STAGE_FIELD_KEY],
      'merged.stage': merged[STAGE_FIELD_KEY],
      'schema.stage': stageField
        ? { type: stageField.type, required: stageField.required, options: stageField.options }
        : undefined,
    });
  }

  return merged;
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
    const defaults = getDynamicFieldDefaults(fieldSchema);
    const mergedCustomFields = mergeCustomFieldDefaults(fieldSchema, payload.customFields);
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
        const mergedValue = mergedCustomFields[key];
        picked[key] =
          mergedValue !== undefined && mergedValue !== null
            ? mergedValue
            : defaults[key];
      }

      if (step.customFieldKeys.includes(STAGE_FIELD_KEY)) {
        const stageField = fieldSchema.fields.find((field) => field.key === STAGE_FIELD_KEY);
        logStagePipeline('validateListingFormStep', {
          'payload.customFields.stage': payload.customFields[STAGE_FIELD_KEY],
          'defaults.stage': defaults[STAGE_FIELD_KEY],
          'merged.stage': mergedCustomFields[STAGE_FIELD_KEY],
          'picked.stage': picked[STAGE_FIELD_KEY],
          'schema.stage': stageField
            ? { type: stageField.type, required: stageField.required, options: stageField.options }
            : undefined,
        });
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

  if (mode === 'full' && step.coreFields?.length) {
    const policyIssues = validateListingContentPolicy({
      title: step.coreFields.includes('title') ? payload.core.title : undefined,
      shortDescription: step.coreFields.includes('shortDescription')
        ? payload.core.shortDescription
        : undefined,
      longDescription: step.coreFields.includes('longDescription')
        ? payload.core.longDescription
        : undefined,
      tags: step.meta?.includes('tags') ? payload.tags : undefined,
      imageFileNames: step.meta?.includes('images')
        ? payload.images.map((img) => img.alt ?? '').filter(Boolean)
        : undefined,
    });

    const quality = evaluateListingContentQuality({
      title: step.coreFields.includes('title') ? payload.core.title : undefined,
      shortDescription: step.coreFields.includes('shortDescription')
        ? payload.core.shortDescription
        : undefined,
      longDescription: step.coreFields.includes('longDescription')
        ? payload.core.longDescription
        : undefined,
      applyNormalization: true,
    });

    const qualityOnStep = quality.blocks.filter(
      (issue) =>
        issue.field
        && step.coreFields!.includes(issue.field as keyof CoreListingFieldsInput),
    );

    const fieldErrors = {
      ...contentPolicyIssuesToFieldErrors(policyIssues),
      ...contentPolicyIssuesToFieldErrors(qualityOnStep),
    };
    if (Object.keys(fieldErrors).length > 0) {
      throw new z.ZodError(
        Object.entries(fieldErrors).map(([path, message]) => ({
          code: z.ZodIssueCode.custom,
          path: path.includes('.') ? path.split('.') : [path],
          message,
        })),
      );
    }
  }
}

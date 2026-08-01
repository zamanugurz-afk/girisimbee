import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';
import { buildWizardVisibleListingFormSchema } from '@/features/listings/form/build-dynamic-schema';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import {
  collectWizardVisibleFieldPaths,
  resolveStepCustomFields,
  type ListingFormStepDef,
} from '@/features/listings/config/listing-form-steps.config';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';
import { formatSupabaseErrorMessages, isSupabaseError } from '@/lib/persistence/supabase-payload';
import { ZodError } from 'zod';
import {
  validateKvkkConsents,
  type KvkkConsentValues,
} from '@/features/listings/form/fields/kvkk-consent-fields';
import { isValidCvStorageRef } from '@/features/listings/lib/normalize-cv-storage-ref';

export interface ValidationFormSnapshot {
  core: Record<string, unknown>;
  customFields: Record<string, unknown>;
  tags?: unknown;
  images?: unknown;
  cvUrl?: unknown;
  kvkkConsents?: unknown;
}

const HIDDEN_SYSTEM_PATHS = new Set(['categoryId', 'listingTypeId']);

const CORE_FIELD_KEYS = new Set([
  'title',
  'shortDescription',
  'longDescription',
  'city',
  'remotePolicy',
  'location',
  'country',
  'companyId',
]);

export function parseZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

export function errorFieldKey(path: string): string {
  if (path.startsWith('core.')) return path.replace('core.', '');
  if (path.startsWith('customFields.')) return path.replace('customFields.', '');
  if (path.startsWith('tags.')) return 'tags';
  if (path.startsWith('images.')) return 'images';
  return path;
}

export function resolveFieldError(
  errors: Record<string, string>,
  key: string,
): string | undefined {
  return (
    errors[key]
    ?? errors[`core.${key}`]
    ?? errors[`customFields.${key}`]
  );
}

const CORE_FIELD_DOM_IDS: Partial<Record<string, string>> = {
  title: 'core-title',
  shortDescription: 'core-short',
  longDescription: 'core-long',
  city: 'core-city',
  remotePolicy: 'core-remote',
};

export function scheduleScrollToFirstError(errors: Record<string, string>) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => scrollToFirstError(errors));
  });
}

export function scrollToFirstError(errors: Record<string, string>) {
  const firstPath = Object.keys(errors)[0];
  if (!firstPath) return;

  const fieldKey = errorFieldKey(firstPath);

  const candidates = [
    CORE_FIELD_DOM_IDS[fieldKey] ? `#${CORE_FIELD_DOM_IDS[fieldKey]}` : null,
    `#field-${fieldKey}`,
  ].filter(Boolean) as string[];

  for (const selector of candidates) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus({ preventScroll: true });
      return;
    }
  }
}

export function isVisibleWizardFieldPath(path: string, visiblePaths: Set<string>): boolean {
  const fieldKey = errorFieldKey(path);

  return (
    visiblePaths.has(path)
    || visiblePaths.has(fieldKey)
    || visiblePaths.has(`core.${fieldKey}`)
    || visiblePaths.has(`customFields.${fieldKey}`)
    || (path.startsWith('tags') && visiblePaths.has('tags'))
    || (path.startsWith('images') && visiblePaths.has('images'))
  );
}

function isCategoryFieldPath(path: string, categoryFieldKeys: Set<string>): boolean {
  const fieldKey = errorFieldKey(path);

  if (path.startsWith('core.') || HIDDEN_SYSTEM_PATHS.has(fieldKey)) {
    return true;
  }

  if (path.startsWith('tags') || path.startsWith('images')) {
    return true;
  }

  if (path.startsWith('customFields.')) {
    return categoryFieldKeys.has(fieldKey);
  }

  return categoryFieldKeys.has(fieldKey);
}

/**
 * Drop validation errors for hidden, system, or non-category fields.
 * Only wizard-visible fields for the active category are kept.
 */
export function filterErrorsToVisibleFields(
  errors: Record<string, string>,
  visiblePaths: Set<string>,
  categoryFieldKeys: Set<string>,
): Record<string, string> {
  const filtered: Record<string, string> = {};

  for (const [path, message] of Object.entries(errors)) {
    const fieldKey = errorFieldKey(path);

    if (HIDDEN_SYSTEM_PATHS.has(path) || HIDDEN_SYSTEM_PATHS.has(fieldKey)) {
      continue;
    }

    if (!isCategoryFieldPath(path, categoryFieldKeys)) {
      continue;
    }

    if (!isVisibleWizardFieldPath(path, visiblePaths)) {
      continue;
    }

    filtered[path] = message;
  }

  return filtered;
}

function findMediaStepIndex(steps: ListingFormStepDef[]): number | null {
  const index = steps.findIndex(
    (step) => step.meta?.includes('tags') || step.meta?.includes('images'),
  );
  return index >= 0 ? index : null;
}

/** Find the wizard step that contains the first validation error, or null to stay put. */
export function findStepIndexForErrors(
  errors: Record<string, string>,
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
): number | null {
  const firstPath = Object.keys(errors)[0];
  if (!firstPath) return null;

  const fieldKey = errorFieldKey(firstPath);

  if (
    firstPath === 'tags'
    || firstPath.startsWith('tags.')
    || firstPath === 'images'
    || firstPath.startsWith('images.')
  ) {
    return findMediaStepIndex(steps);
  }

  if (firstPath === 'categoryId' || firstPath === 'listingTypeId') {
    return null;
  }

  if (fieldKey === 'cvUrl') {
    const cvStep = steps.findIndex((step) => step.cv);
    return cvStep >= 0 ? cvStep : null;
  }

  if (fieldKey === 'kvkkConsents') {
    const kvkkStep = steps.findIndex((step) => step.kvkk);
    return kvkkStep >= 0 ? kvkkStep : null;
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.preview || step.publish || step.package) continue;

    if (step.coreFields?.includes(fieldKey as keyof CoreListingFieldsInput)) {
      return i;
    }

    const customKeys = resolveStepCustomFields(step, allFieldKeys);
    if (customKeys.includes(fieldKey)) {
      return i;
    }
  }

  return null;
}

export function getFieldValueFromSnapshot(
  snapshot: ValidationFormSnapshot,
  path: string,
  fieldKey: string,
): unknown {
  if (path.startsWith('core.') || CORE_FIELD_KEYS.has(fieldKey)) {
    return snapshot.core[fieldKey];
  }
  if (path.startsWith('customFields.') || fieldKey in snapshot.customFields) {
    return snapshot.customFields[fieldKey];
  }
  if (path.startsWith('tags') || fieldKey === 'tags') {
    return snapshot.tags;
  }
  if (path.startsWith('images') || fieldKey === 'images') {
    return snapshot.images;
  }
  if (fieldKey === 'cvUrl') {
    return snapshot.cvUrl;
  }
  if (fieldKey === 'kvkkConsents') {
    return snapshot.kvkkConsents;
  }
  return snapshot.customFields[fieldKey] ?? snapshot.core[fieldKey];
}

function formatLogValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (value === '') return '(empty)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const CORE_FIELD_LABELS: Record<string, string> = {
  title: 'Başlık',
  shortDescription: 'Kısa açıklama',
  longDescription: 'Detaylı açıklama',
  city: 'Şehir',
  remotePolicy: 'Çalışma modeli',
  location: 'Konum',
  country: 'Ülke',
  companyId: 'Şirket',
  tags: 'Etiketler',
  images: 'Görseller',
  cvUrl: 'Özgeçmiş',
  kvkkConsents: 'KVKK onayları',
  desiredRole: 'Aranan pozisyon',
  experienceLevel: 'Deneyim seviyesi',
  salaryExpectation: 'Maaş beklentisi',
  workType: 'Çalışma tipi',
};

/** User-facing publish hints — shown instead of generic "Doğrulama hatası". */
const PUBLISH_FIELD_HINTS: Record<string, string> = {
  cvUrl: 'Özgeçmiş yüklenmedi.',
  kvkkConsents: 'KVKK onayları tamamlanmadı.',
  desiredRole: 'Aranan pozisyon eksik.',
  experienceLevel: 'Deneyim bilgileri eksik.',
  workType: 'Çalışma tipi eksik.',
  salaryExpectation: 'Maaş beklentisi eksik.',
  title: 'Başlık eksik veya çok kısa.',
  shortDescription: 'Kısa açıklama eksik veya çok kısa.',
  longDescription: 'Detaylı açıklama eksik veya çok kısa.',
  city: 'Şehir seçilmedi.',
  'core.title': 'Başlık eksik veya çok kısa.',
  'core.shortDescription': 'Kısa açıklama eksik veya çok kısa.',
  'core.longDescription': 'Detaylı açıklama eksik veya çok kısa.',
  'core.city': 'Şehir seçilmedi.',
  'customFields.desiredRole': 'Aranan pozisyon eksik.',
  'customFields.experienceLevel': 'Deneyim bilgileri eksik.',
  'customFields.workType': 'Çalışma tipi eksik.',
};

const GENERIC_VALIDATION_MESSAGES = new Set([
  'Doğrulama hatası',
  'Doğrulama hatası.',
  'Validation error',
]);

export function formatPublishFieldMessage(path: string, fallback: string): string {
  return PUBLISH_FIELD_HINTS[path] ?? PUBLISH_FIELD_HINTS[errorFieldKey(path)] ?? fallback;
}

export function flattenFieldErrors(fieldErrors: Record<string, string[]>): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [path, messages] of Object.entries(fieldErrors)) {
    const message = messages.find(Boolean);
    if (message) flat[path] = message;
  }
  return flat;
}

export function extractValidationErrorMap(error: unknown): Record<string, string> | null {
  if (error instanceof ZodError) {
    return parseZodErrors(error);
  }

  if (error instanceof ValidationError) {
    return flattenFieldErrors(error.fieldErrors);
  }

  if (error && typeof error === 'object' && 'fieldErrors' in error) {
    const fieldErrors = (error as { fieldErrors?: Record<string, string[]> }).fieldErrors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const flat = flattenFieldErrors(fieldErrors);
      if (Object.keys(flat).length > 0) {
        return flat;
      }
    }
  }

  return null;
}

export function resolveValidationFieldLabel(
  path: string,
  customFieldLabels?: ReadonlyMap<string, string>,
): string {
  const fieldKey = errorFieldKey(path);
  return customFieldLabels?.get(fieldKey) ?? CORE_FIELD_LABELS[fieldKey] ?? fieldKey;
}

export interface ValidationErrorDetail {
  path: string;
  fieldName: string;
  value: unknown;
  message: string;
  stepNumber: number | null;
}

export function buildValidationErrorDetails(
  errors: Record<string, string>,
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
  categoryLabel: string,
  snapshot: ValidationFormSnapshot,
  customFieldLabels?: ReadonlyMap<string, string>,
): ValidationErrorDetail[] {
  return Object.entries(errors).map(([path, message]) => {
    const fieldKey = errorFieldKey(path);
    const errorStep = findStepIndexForErrors({ [path]: message }, steps, allFieldKeys);

    return {
      path,
      fieldName: resolveValidationFieldLabel(path, customFieldLabels),
      value: getFieldValueFromSnapshot(snapshot, path, fieldKey),
      message: formatPublishFieldMessage(path, message),
      stepNumber: errorStep !== null ? errorStep + 1 : null,
    };
  });
}

/** Log publish/final-step validation failures and return user-facing error messages. */
export function logPublishValidationFailure(
  error: unknown,
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
  categoryLabel: string,
  snapshot: ValidationFormSnapshot,
  customFieldLabels?: ReadonlyMap<string, string>,
): string[] {
  console.error('[ListingForm] publish validation failed', error);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }

  const errorMap = extractValidationErrorMap(error);
  if (!errorMap || Object.keys(errorMap).length === 0) {
    return [];
  }

  const details = buildValidationErrorDetails(
    errorMap,
    steps,
    allFieldKeys,
    categoryLabel,
    snapshot,
    customFieldLabels,
  );

  for (const detail of details) {
    console.log(`Field: ${detail.fieldName}`);
    console.log(`Value: ${formatLogValue(detail.value)}`);
    console.log(`Category: ${categoryLabel}`);
    console.log(`Step: ${detail.stepNumber ?? '—'}`);
    console.log(`Error: ${detail.message}`);
  }

  return [...new Set(details.map((detail) => detail.message))];
}

/** Resolve user-facing publish errors — Zod/Validation, then Supabase, then generic. */
export function resolvePublishErrorMessages(
  error: unknown,
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
  categoryLabel: string,
  snapshot: ValidationFormSnapshot,
  customFieldLabels?: ReadonlyMap<string, string>,
): string[] {
  const validationMessages = logPublishValidationFailure(
    error,
    steps,
    allFieldKeys,
    categoryLabel,
    snapshot,
    customFieldLabels,
  );
  if (validationMessages.length > 0) {
    return validationMessages;
  }

  if (isSupabaseError(error) || (error instanceof Error && error.message.toLowerCase().includes('uuid'))) {
    return formatSupabaseErrorMessages(error);
  }

  if (error instanceof Error && error.message && !GENERIC_VALIDATION_MESSAGES.has(error.message)) {
    return [error.message];
  }

  return ['Yayınlama tamamlanamadı. Lütfen zorunlu alanları kontrol edin.'];
}

/** Full publish-time validation for wizard + job-seeker CV/KVKK. */
export function validateListingFormBeforePublish(options: {
  categoryId: CategoryId;
  fieldSchema: ListingFieldSchema;
  steps: ListingFormStepDef[];
  allFieldKeys: string[];
  snapshot: ValidationFormSnapshot;
  cvUrl?: string | null;
  kvkkConsents?: KvkkConsentValues;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (options.categoryId === CATEGORY_IDS.isBul) {
    if (!options.cvUrl) {
      errors.cvUrl = PUBLISH_FIELD_HINTS.cvUrl;
    } else if (!isValidCvStorageRef(options.cvUrl)) {
      errors.cvUrl = 'Özgeçmiş geçersiz. Lütfen yeniden yükleyin.';
    }
    if (!options.kvkkConsents || !validateKvkkConsents(options.kvkkConsents)) {
      errors.kvkkConsents = PUBLISH_FIELD_HINTS.kvkkConsents;
    }
  }

  try {
    const schema = buildWizardVisibleListingFormSchema(
      options.fieldSchema,
      options.steps,
      options.allFieldKeys,
    );
    schema.parse({
      core: options.snapshot.core,
      customFields: options.snapshot.customFields,
      tags: options.snapshot.tags ?? [],
      images: options.snapshot.images ?? [],
    });
  } catch (err) {
    if (err instanceof ZodError) {
      Object.assign(errors, parseZodErrors(err));
    }
  }

  const friendly: Record<string, string> = {};
  for (const [path, message] of Object.entries(errors)) {
    friendly[path] = formatPublishFieldMessage(path, message);
  }
  return friendly;
}

/** Keep only errors belonging to the active wizard step. */
export function filterErrorsToCurrentStep(
  errors: Record<string, string>,
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
  currentStepIndex: number,
): Record<string, string> {
  const filtered: Record<string, string> = {};

  for (const [path, message] of Object.entries(errors)) {
    const errorStep = findStepIndexForErrors({ [path]: message }, steps, allFieldKeys);
    if (errorStep === currentStepIndex) {
      filtered[path] = message;
    }
  }

  return filtered;
}

/** Log each validation failure — Field / Value / Category / Step / Error. */
export function logValidationErrors(
  errors: Record<string, string>,
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
  currentStepIndex: number,
  categoryLabel: string,
  snapshot: ValidationFormSnapshot,
) {
  for (const [path, message] of Object.entries(errors)) {
    const fieldKey = errorFieldKey(path);
    const errorStep = findStepIndexForErrors({ [path]: message }, steps, allFieldKeys);
    const stepNumber = errorStep !== null ? errorStep + 1 : currentStepIndex + 1;
    const value = getFieldValueFromSnapshot(snapshot, path, fieldKey);

    console.log(`Field: ${fieldKey}`);
    console.log(`Value: ${formatLogValue(value)}`);
    console.log(`Category: ${categoryLabel}`);
    console.log(`Step: ${stepNumber}`);
    console.log(`Error: ${message}`);
  }
}

export function getWizardVisibleFieldPaths(
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
): Set<string> {
  return collectWizardVisibleFieldPaths(steps, allFieldKeys);
}

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
import {
  validatePublishConsents,
  type PublishConsentValues,
} from '@/features/listings/form/fields/publish-consent-fields';
import { isValidCvStorageRef } from '@/features/listings/lib/normalize-cv-storage-ref';
import {
  parseCareerExperiences,
  validateCareerExperiences,
} from '@/features/candidates/config/career-profile-fields';
import { findCareerProfileContentViolation } from '@/features/candidates/lib/career-profile-content-policy';
import { polishCareerSummary } from '@/features/candidates/lib/career-summary';
import {
  materializeCareerEducationFields,
  materializeCareerSkillsFields,
  validateCareerEducationStep,
  validateCareerManualOther,
  validateCareerSkillsStep,
} from '@/features/candidates/lib/career-form-step-validation';
import {
  contentPolicyIssuesToFieldErrors,
  validateListingContentPolicy,
} from '@/features/listings/lib/listing-content-policy';
import { evaluateListingContentQuality } from '@/features/listings/lib/listing-content-quality';
import { getListingTextFingerprints } from '@/features/listings/lib/listing-duplicate-registry';

export interface ValidationFormSnapshot {
  core: Record<string, unknown>;
  customFields: Record<string, unknown>;
  tags?: unknown;
  images?: unknown;
  cvUrl?: unknown;
  kvkkConsents?: unknown;
  publishConsents?: unknown;
  contactPhone?: unknown;
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

  if (fieldKey === 'experiences') {
    const experienceStep = steps.findIndex((step) => step.experienceEditor);
    return experienceStep >= 0 ? experienceStep : null;
  }

  if (fieldKey === 'kvkkConsents' || fieldKey === 'publishConsents' || fieldKey === 'contactPhone') {
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
  if (fieldKey === 'publishConsents') {
    return snapshot.publishConsents;
  }
  if (fieldKey === 'contactPhone') {
    return snapshot.contactPhone;
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
  publishConsents: 'Yayın onayları',
  contactPhone: 'Telefon',
  desiredRole: 'Aranan pozisyon',
  experienceLevel: 'Deneyim seviyesi',
  salaryExpectation: 'Maaş beklentisi',
  workType: 'Çalışma tipi',
};

/** User-facing publish hints — shown instead of generic "Doğrulama hatası". */
const PUBLISH_FIELD_HINTS: Record<string, string> = {
  cvUrl: 'Özgeçmiş yüklenmedi.',
  kvkkConsents: 'KVKK onayları tamamlanmadı.',
  publishConsents: 'Yayın onayları tamamlanmadı.',
  contactPhone: 'Telefon numarası eksik — Yayın Onayları adımından ekleyin.',
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
  const hint = PUBLISH_FIELD_HINTS[path] ?? PUBLISH_FIELD_HINTS[errorFieldKey(path)];
  const trimmed = fallback.trim();
  // Prefer specific Zod / quality messages over generic publish hints.
  if (
    trimmed
    && trimmed !== 'Required'
    && trimmed !== 'Invalid'
    && !GENERIC_VALIDATION_MESSAGES.has(trimmed)
    && !trimmed.toLowerCase().includes('invalid_type')
  ) {
    return trimmed;
  }
  return hint ?? fallback;
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

/** Full publish-time validation for wizard + job-seeker CV/KVKK + phone consents. */
export function validateListingFormBeforePublish(options: {
  categoryId: CategoryId;
  fieldSchema: ListingFieldSchema;
  steps: ListingFormStepDef[];
  allFieldKeys: string[];
  snapshot: ValidationFormSnapshot;
  cvUrl?: string | null;
  kvkkConsents?: KvkkConsentValues;
  publishConsents?: PublishConsentValues;
  contactPhone?: string | null;
}): {
  errors: Record<string, string>;
  normalizedCore: {
    title: string;
    shortDescription: string;
    longDescription: string;
  };
} {
  const errors: Record<string, string> = {};

  if (options.categoryId === CATEGORY_IDS.isBul) {
    const experiences = parseCareerExperiences(options.snapshot.customFields.experiences);
    const expError = validateCareerExperiences(experiences);
    if (expError) errors.experiences = expError;

    const summary =
      typeof options.snapshot.core.longDescription === 'string'
        ? options.snapshot.core.longDescription
        : '';
    const summaryViolation = findCareerProfileContentViolation(summary);
    if (summaryViolation) errors.longDescription = summaryViolation;

    Object.assign(errors, validateCareerSkillsStep(options.snapshot.customFields));
    Object.assign(errors, validateCareerEducationStep(options.snapshot.customFields));
    const roleOtherError = validateCareerManualOther(
      options.snapshot.customFields.desiredRole,
      options.snapshot.customFields.desiredRoleOther,
      'Pozisyon açıklaması',
    );
    if (roleOtherError) errors.desiredRoleOther = roleOtherError;

    // Materialize taxonomy selections into display strings before schema checks.
    Object.assign(
      options.snapshot.customFields,
      materializeCareerSkillsFields(options.snapshot.customFields),
      materializeCareerEducationFields(options.snapshot.customFields),
    );
    options.snapshot.customFields.experiences = experiences;
  }

  if (!options.publishConsents || !validatePublishConsents(options.publishConsents)) {
    errors.publishConsents = PUBLISH_FIELD_HINTS.publishConsents;
  }

  if (!options.contactPhone?.trim()) {
    errors.contactPhone = PUBLISH_FIELD_HINTS.contactPhone;
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

  const core = options.snapshot.core ?? {};
  const images = Array.isArray(options.snapshot.images) ? options.snapshot.images : [];
  const tags = Array.isArray(options.snapshot.tags)
    ? options.snapshot.tags.map((t) => String(t))
    : [];

  let rawTitle = typeof core.title === 'string' ? core.title : undefined;
  let rawShort =
    typeof core.shortDescription === 'string' ? core.shortDescription : undefined;
  let rawLong =
    typeof core.longDescription === 'string' ? core.longDescription : undefined;

  if (options.categoryId === CATEGORY_IDS.isBul) {
    if (rawLong) rawLong = polishCareerSummary(rawLong);
    const role = String(options.snapshot.customFields.desiredRole ?? '').trim();
    const level = String(options.snapshot.customFields.experienceLevel ?? '').trim();
    if (!rawTitle?.trim() && role) rawTitle = role;
    if (!rawShort?.trim() && (role || level)) {
      rawShort = [role, level].filter(Boolean).join(' · ').slice(0, 200);
    }
  }

  const quality = evaluateListingContentQuality({
    title: rawTitle,
    shortDescription: rawShort,
    longDescription: rawLong,
    applyNormalization: true,
  });

  Object.assign(errors, contentPolicyIssuesToFieldErrors(quality.blocks));

  const policyIssues = validateListingContentPolicy({
    title: quality.normalized.title || rawTitle,
    shortDescription: quality.normalized.shortDescription || rawShort,
    longDescription: quality.normalized.longDescription || rawLong,
    tags,
    imageFileNames: images
      .map((img) => {
        if (img && typeof img === 'object' && 'alt' in img && typeof (img as { alt?: unknown }).alt === 'string') {
          return (img as { alt: string }).alt;
        }
        return '';
      })
      .filter(Boolean),
    existingFingerprints: getListingTextFingerprints(),
  });

  // Title-case is handled by normalization — skip redundant title_case blocks
  const policyWithoutTitleCase = policyIssues.filter((i) => i.code !== 'title_case');
  Object.assign(errors, contentPolicyIssuesToFieldErrors(policyWithoutTitleCase));

  const friendly: Record<string, string> = {};
  for (const [path, message] of Object.entries(errors)) {
    friendly[path] = formatPublishFieldMessage(path, message);
  }
  return {
    errors: friendly,
    normalizedCore: quality.normalized,
  };
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

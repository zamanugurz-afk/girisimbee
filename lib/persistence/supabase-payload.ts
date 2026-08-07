/**
 * Supabase write helpers — UUID sanitization and payload logging.
 */
import { uuidSchema } from '@/lib/domain/validation';
import { ids, type CompanyId } from '@/lib/domain/ids';

/** Deterministic listing-type seed IDs stored in Postgres (lt000001-*). */
const SEED_LISTING_TYPE_UUID = /^lt000001-[0-9a-f]{4}-4000-8000-[0-9a-f]{12}$/i;

function acceptsAsUuid(value: string): boolean {
  const trimmed = value.trim();
  return uuidSchema.safeParse(trimmed).success || SEED_LISTING_TYPE_UUID.test(trimmed);
}

const EXPLICIT_UUID_FIELD_KEYS = new Set([
  'user_id',
  'userId',
  'company_id',
  'companyId',
  'listing_id',
  'listingId',
  'publisher_company_id',
  'publisherCompanyId',
  'organization_id',
  'organizationId',
  'owner_id',
  'ownerId',
  'category_id',
  'categoryId',
  'listing_type_id',
  'listingTypeId',
  'actor_id',
  'actorId',
  'entity_id',
  'entityId',
  'tag_id',
  'tagId',
  'consumed_listing_id',
  'consumedListingId',
  'id',
]);

export function isUuidFieldKey(key: string): boolean {
  return EXPLICIT_UUID_FIELD_KEYS.has(key) || key.endsWith('_id') || key.endsWith('Id');
}

export function isValidUuidValue(value: unknown): value is string {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') {
    if (value === 0) return false;
    return uuidSchema.safeParse(String(value)).success;
  }
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed || trimmed === '0') return false;

  return acceptsAsUuid(trimmed);
}

/** Normalize a UUID value or return null when empty/invalid. */
export function coerceUuidValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (value === 0) return null;
    return isValidUuidValue(String(value)) ? String(value) : null;
  }
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed === '0') return null;

  return acceptsAsUuid(trimmed) ? trimmed : null;
}

export function coerceCompanyId(value: unknown): CompanyId | null {
  const uuid = coerceUuidValue(value);
  return uuid ? ids.company(uuid) : null;
}

export interface SanitizeSupabaseRowOptions {
  /** UUID columns that must be present and valid — throws before write. */
  requiredUuidFields?: string[];
  /** UUID columns allowed to be omitted/null (default: omit invalid optional UUID keys). */
  nullableUuidFields?: string[];
}

function shouldUseNullForMissingUuid(key: string, nullableUuidFields?: string[]): boolean {
  if (!nullableUuidFields) {
    return key === 'company_id' || key === 'companyId' || key === 'actor_id' || key === 'actorId';
  }
  return nullableUuidFields.includes(key);
}

/** Remove invalid UUID strings; never send "", undefined, "0", or malformed values. */
export function sanitizeSupabaseRow(
  row: Record<string, unknown>,
  options: SanitizeSupabaseRowOptions = {},
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    if (!isUuidFieldKey(key)) {
      sanitized[key] = value;
      continue;
    }

    const uuid = coerceUuidValue(value);
    if (uuid) {
      sanitized[key] = uuid;
      continue;
    }

    if (value !== null && value !== undefined && value !== '') {
      console.error('Invalid UUID field:', key, value);
    }

    if (shouldUseNullForMissingUuid(key, options.nullableUuidFields)) {
      sanitized[key] = null;
      continue;
    }

    // Omit invalid optional UUID properties entirely.
  }

  for (const field of options.requiredUuidFields ?? []) {
    const value = sanitized[field];
    if (!isValidUuidValue(value)) {
      console.error('Invalid UUID field:', field, row[field]);
      throw new Error(`Geçersiz UUID alanı: ${field}`);
    }
  }

  return sanitized;
}

export function logInvalidUuidFields(
  original: Record<string, unknown>,
  sanitized: Record<string, unknown>,
): void {
  for (const key of Object.keys(original)) {
    if (!isUuidFieldKey(key)) continue;
    const raw = original[key];
    const next = sanitized[key];
    if (raw === next) continue;
    if (!isValidUuidValue(raw)) {
      console.error('Invalid UUID field:', key, raw);
    }
  }
}

export function prepareSupabaseWrite(
  operation: 'insert' | 'update' | 'upsert',
  table: string,
  payload: Record<string, unknown>,
  options: SanitizeSupabaseRowOptions = {},
): Record<string, unknown> {
  const debug =
    process.env.DEBUG_LISTINGS === '1' || process.env.NEXT_PUBLIC_DEBUG_LISTINGS === '1';
  if (debug) {
    console.log(`[Supabase] ${operation} ${table}`, JSON.stringify(payload, null, 2));
  }
  const sanitized = sanitizeSupabaseRow(payload, options);
  logInvalidUuidFields(payload, sanitized);
  if (debug) {
    console.log(`[Supabase] ${operation} ${table} (sanitized)`, JSON.stringify(sanitized, null, 2));
  }
  return sanitized;
}

export interface SupabaseErrorLike {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

export function isSupabaseError(error: unknown): error is SupabaseErrorLike {
  return typeof error === 'object' && error !== null && 'message' in error;
}

/** True when PostgREST/Postgres reports a missing table or schema-cache miss. */
export function isMissingRelationError(error: unknown): boolean {
  if (!isSupabaseError(error)) return false;
  const code = error.code ?? '';
  const message = (error.message ?? '').toLowerCase();
  const details = (error.details ?? '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST204' ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    details.includes('does not exist')
  );
}

/** Full Supabase/PostgREST error text for UI and logs. */
export function formatSupabaseErrorMessages(error: unknown): string[] {
  if (!isSupabaseError(error)) {
    return error instanceof Error ? [error.message] : ['Bilinmeyen veritabanı hatası.'];
  }

  const parts = [
    error.message,
    error.details ? `Detay: ${error.details}` : null,
    error.hint ? `İpucu: ${error.hint}` : null,
    error.code ? `Kod: ${error.code}` : null,
  ].filter(Boolean) as string[];

  return parts.length > 0 ? [parts.join(' — ')] : ['Bilinmeyen veritabanı hatası.'];
}

export function logSupabaseError(error: unknown, context: string): void {
  console.error(`[Supabase] ${context}`, error);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  for (const message of formatSupabaseErrorMessages(error)) {
    console.error('[Supabase] error message:', message);
  }
}

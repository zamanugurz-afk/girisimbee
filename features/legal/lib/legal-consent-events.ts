import type { SupabaseClient } from '@supabase/supabase-js';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';

export type LegalConsentEventInput = {
  userId: string;
  consentType: string;
  purpose: string;
  status: 'accepted' | 'withdrawn' | 'acknowledged';
  version: string;
  documentKey?: string | null;
  source?: string;
  listingId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  acceptedAt?: string | null;
  withdrawnAt?: string | null;
};

/**
 * Best-effort audit insert. Missing table (migration not applied) is ignored.
 */
export async function recordLegalConsentEvent(
  supabase: SupabaseClient | null | undefined,
  input: LegalConsentEventInput,
): Promise<void> {
  if (!supabase) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from('marketplace_legal_consent_events').insert({
    user_id: input.userId,
    consent_type: input.consentType,
    purpose: input.purpose,
    status: input.status,
    document_key: input.documentKey ?? null,
    version: input.version,
    source: input.source ?? 'web',
    listing_id: input.listingId ?? null,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    accepted_at: input.acceptedAt ?? (input.status === 'accepted' || input.status === 'acknowledged' ? now : null),
    withdrawn_at: input.withdrawnAt ?? (input.status === 'withdrawn' ? now : null),
  });
  if (error && !isMissingRelationError(error)) {
    console.warn('[legal-consent-events]', error.message);
  }
}

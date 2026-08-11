import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import { createClient } from '@/lib/supabase/server';
import { recordLegalConsentEvent } from '@/features/legal/lib/legal-consent-events';

const bodySchema = z.object({
  acceptTerms: z.literal(true),
  acknowledgeKvkk: z.literal(true),
  acceptPrivacy: z.literal(true),
  acknowledgeCookies: z.literal(true),
  source: z.string().max(64).optional(),
});

/** POST — record signup/OAuth legal acceptance with document versions. */
export const POST = withAuth(async (ctx, request) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError('Geçersiz istek gövdesi.', 400);
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiError('Zorunlu yasal alanlar eksik.', 400);
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? null;
  const userAgent = request.headers.get('user-agent');
  const source = parsed.data.source ?? 'legal_acceptance';

  const accountService = ctx.container.accountService;
  try {
    await accountService.recordLegalAcceptance({
      userId: ctx.userId,
      termsAccepted: true,
      privacyAccepted: true,
      kvkkAcknowledged: true,
      cookiesAcknowledged: true,
      termsVersion: LEGAL_DOCUMENT_VERSIONS.user_terms.version,
      privacyVersion: LEGAL_DOCUMENT_VERSIONS.privacy.version,
      kvkkAckVersion: LEGAL_DOCUMENT_VERSIONS.kvkk_clarification.version,
      cookiesVersion: LEGAL_DOCUMENT_VERSIONS.cookie_policy.version,
      source,
      ipAddress: ip,
      userAgent,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Yasal onay kaydedilemedi';
    console.error('[legal-acceptance] record failed', message);
    return apiError(
      /column|schema cache|PGRST/i.test(message)
        ? 'Yasal onay kaydı için veritabanı güncellemesi eksik. Lütfen tekrar deneyin veya destek ile iletişime geçin.'
        : message,
      500,
    );
  }

  // Audit events are best-effort (table may be missing until migration).
  try {
    const supabase = createClient();
    const events = [
      {
        consentType: 'user_terms',
        purpose: 'platform_membership',
        status: 'accepted' as const,
        version: LEGAL_DOCUMENT_VERSIONS.user_terms.version,
        documentKey: 'user_terms',
      },
      {
        consentType: 'privacy',
        purpose: 'privacy_policy_acceptance',
        status: 'accepted' as const,
        version: LEGAL_DOCUMENT_VERSIONS.privacy.version,
        documentKey: 'privacy',
      },
      {
        consentType: 'kvkk_clarification',
        purpose: 'kvkk_article_10_information',
        status: 'acknowledged' as const,
        version: LEGAL_DOCUMENT_VERSIONS.kvkk_clarification.version,
        documentKey: 'kvkk_clarification',
      },
      {
        consentType: 'cookie_policy',
        purpose: 'cookie_policy_acknowledgment',
        status: 'acknowledged' as const,
        version: LEGAL_DOCUMENT_VERSIONS.cookie_policy.version,
        documentKey: 'cookie_policy',
      },
    ];

    for (const event of events) {
      await recordLegalConsentEvent(supabase, {
        userId: String(ctx.userId),
        ...event,
        source,
        ipAddress: ip,
        userAgent,
      });
    }
  } catch (error) {
    console.warn('[legal-acceptance] audit events skipped', error);
  }

  return ok({ recorded: true });
});

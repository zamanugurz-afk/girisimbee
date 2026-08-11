import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { LEGAL_COMMERCIAL_MESSAGE_STATUS } from '@/features/legal/config/legal-third-party.config';
import { createClient } from '@/lib/supabase/server';
import { recordLegalConsentEvent } from '@/features/legal/lib/legal-consent-events';

const bodySchema = z.object({
  marketingAccepted: z.boolean().optional(),
  smsAccepted: z.boolean().optional(),
  emailAccepted: z.boolean().optional(),
});

/** PATCH — withdraw / update optional commercial & channel consents. */
export const PATCH = withAuth(async (ctx, request) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError('Geçersiz istek gövdesi.', 400);
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiError('Geçersiz izin alanları.', 400);
  }

  if (
    parsed.data.marketingAccepted === true
    && !LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled
  ) {
    // Allow storing intent, but surface that sends are gated.
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? null;
  const userAgent = request.headers.get('user-agent');

  const consent = await ctx.container.accountService.updateOptionalConsents({
    userId: ctx.userId,
    marketingAccepted: parsed.data.marketingAccepted,
    smsAccepted: parsed.data.smsAccepted,
    emailAccepted: parsed.data.emailAccepted,
    ipAddress: ip,
    userAgent,
    source: 'account_preferences',
  });

  const supabase = createClient();
  const pairs: Array<{ key: 'marketing' | 'sms' | 'email'; accepted?: boolean }> = [
    { key: 'marketing', accepted: parsed.data.marketingAccepted },
    { key: 'sms', accepted: parsed.data.smsAccepted },
    { key: 'email', accepted: parsed.data.emailAccepted },
  ];
  for (const pair of pairs) {
    if (pair.accepted === undefined) continue;
    await recordLegalConsentEvent(supabase, {
      userId: String(ctx.userId),
      consentType: `optional_${pair.key}`,
      purpose: pair.key === 'marketing' ? 'commercial_electronic_message' : `${pair.key}_notifications`,
      status: pair.accepted ? 'accepted' : 'withdrawn',
      version: 'OPTIONAL_CONSENT_V1',
      source: 'account_preferences',
      ipAddress: ip,
      userAgent,
    });
  }

  return ok({
    consent,
    marketingSendEnabled: LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled,
    iysConfigured: LEGAL_COMMERCIAL_MESSAGE_STATUS.iysConfigured,
  });
});

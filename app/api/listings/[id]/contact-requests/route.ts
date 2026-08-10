import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { createClient } from '@/lib/supabase/server';
import { recordLegalConsentEvent } from '@/features/legal/lib/legal-consent-events';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import { CONTACT_REQUEST_CONFIG } from '@/features/contact-requests/config/contact-request.config';

const bodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(CONTACT_REQUEST_CONFIG.messageMinLength, {
      message: `Mesaj en az ${CONTACT_REQUEST_CONFIG.messageMinLength} karakter olmalıdır.`,
    })
    .max(CONTACT_REQUEST_CONFIG.messageMaxLength),
  acceptTerms: z.literal(true),
});

/** POST — create contact request for a listing */
export const POST = withAuth(async (ctx, request, { params }) => {
  const listingId = ids.listing(params.id);
  const body = await parseJsonBody(request);
  const parsed = bodySchema.parse(body);

  const { view } = await ctx.container.contactRequestService.create({
    listingId,
    requesterUserId: ctx.userId,
    message: parsed.message ?? null,
    acceptTerms: parsed.acceptTerms,
  });

  const supabase = createClient();
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? null;
  const userAgent = request.headers.get('user-agent');

  await recordLegalConsentEvent(supabase, {
    userId: String(ctx.userId),
    consentType: 'contact_communication',
    purpose: 'listing_contact_request',
    status: 'accepted',
    version: LEGAL_DOCUMENT_VERSIONS.contact_communication.version,
    documentKey: 'contact_communication',
    source: 'contact_request_create',
    listingId: String(listingId),
    ipAddress: ip,
    userAgent,
  });

  return created({ request: view });
});

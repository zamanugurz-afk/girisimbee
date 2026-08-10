import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { createClient } from '@/lib/supabase/server';
import { recordLegalConsentEvent } from '@/features/legal/lib/legal-consent-events';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';

const bodySchema = z.object({
  acceptTerms: z.literal(true),
});

/** POST — owner accepts a contact request */
export const POST = withAuth(async (ctx, request, { params }) => {
  const requestId = ids.contactRequest(params.id);
  const body = await parseJsonBody(request);
  const parsed = bodySchema.parse(body);

  const { view } = await ctx.container.contactRequestService.accept({
    requestId,
    actorUserId: ctx.userId,
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
    purpose: 'listing_contact_request_accept',
    status: 'accepted',
    version: LEGAL_DOCUMENT_VERSIONS.contact_communication.version,
    documentKey: 'contact_communication',
    source: 'contact_request_accept',
    listingId: view.listingId,
    ipAddress: ip,
    userAgent,
  });

  return ok({ request: view });
});

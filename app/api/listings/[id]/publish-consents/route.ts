import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';
import { PUBLISH_CONSENT_KEYS } from '@/features/kvkk/constants/publish-consent-policy';

const bodySchema = z.object({
  publishConsents: z.record(z.boolean()),
});

/**
 * POST /api/listings/[id]/publish-consents
 * Persist publish-consent audit snapshot after a listing is created/published.
 */
export const POST = withAuth(async (ctx, request, { params }) => {
  const listingId = ids.listing(params.id);
  const body = await parseJsonBody(request);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Yayın onayları eksik veya geçersiz', 400);
  }

  for (const key of PUBLISH_CONSENT_KEYS) {
    if (parsed.data.publishConsents[key] !== true) {
      return apiError('Tüm yayın onay kutularını işaretlemeniz gerekmektedir.', 400);
    }
  }

  const listing = await ctx.container.listingRepository.findById(listingId);
  if (!listing) return apiError('İlan bulunamadı', 404);
  if (String(listing.ownerId) !== String(ctx.userId)) {
    return apiError('Bu ilan için yetkiniz yok', 403);
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? null;
  const userAgent = request.headers.get('user-agent');

  try {
    const record = await ctx.container.ecosystem.kvkkConsentService.recordPublishPolicyConsent({
      userId: ctx.userId,
      profileId: ctx.profileId,
      listingId,
      consents: parsed.data.publishConsents,
      ipAddress: ip,
      userAgent,
    });
    return ok({ recorded: true, id: record.id });
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError(error.message, 400);
    }
    console.error('[publish-consents] persist failed', error);
    return apiError('Yayın onayları kaydedilemedi', 500);
  }
});

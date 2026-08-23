import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import type { CareerProfileFormValues } from '@/features/career-profile/types';
import type { CareerPersonaKind } from '@/features/career-profile/components/career-persona-selector';

/**
 * POST /api/career/profile/confirm
 * Explicitly confirms and persists user-verified Career Profile fields
 * marking the profile as CONFIRMED and saving provenance metadata.
 */
export const POST = withAuth(async (ctx, request) => {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      listingId?: string;
      persona?: CareerPersonaKind;
      values?: CareerProfileFormValues;
      confirmedFieldKeys?: string[];
    };

    if (!body.values) {
      return apiError('Onaylanacak profil verisi bulunamadı.', 400);
    }

    const service = new CareerProfileService(ctx.container.listingRepository);
    const listingId = body.listingId && !body.listingId.startsWith('draft')
      ? ids.listing(body.listingId)
      : undefined;

    const record = await service.saveProfile(ctx.userId, listingId, body.values, body.persona);

    return ok({
      success: true,
      profile: record,
      confirmedAt: new Date().toISOString(),
      confirmedFieldCount: body.confirmedFieldKeys?.length || Object.keys(body.values).length,
    });
  } catch (error: any) {
    console.error('API /api/career/profile/confirm POST error:', error?.message || error);
    return apiError(error instanceof Error ? error.message : 'Profil onaylanırken hata oluştu.', 400);
  }
});

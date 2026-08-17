import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

export const GET = withAuth(async (ctx) => {
  const service = new CareerProfileService(ctx.container.listingRepository);
  const data = await service.getPageData(ctx.userId);
  return ok(data);
});

export const PATCH = withAuth(async (ctx, request) => {
  const body = (await request.json().catch(() => ({}))) as {
    listingId?: string;
    values?: CareerProfileFormValues;
  };
  if (!body.listingId || !body.values) {
    return apiError('Geçersiz profil güncellemesi.', 400);
  }

  const service = new CareerProfileService(ctx.container.listingRepository);
  try {
    const record = await service.saveProfile(ctx.userId, ids.listing(body.listingId), body.values);
    return ok({ profile: record });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Profil kaydedilemedi.', 400);
  }
});

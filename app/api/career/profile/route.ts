import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import type { CareerProfileFormValues } from '@/features/career-profile/types';
import type { CareerPersonaKind } from '@/features/career-profile/components/career-persona-selector';

export const GET = withAuth(async (ctx) => {
  const service = new CareerProfileService(ctx.container.listingRepository);
  const data = await service.getPageData(ctx.userId);
  return ok(data);
});

export const PATCH = withAuth(async (ctx, request) => {
  const body = (await request.json().catch(() => ({}))) as {
    listingId?: string;
    persona?: CareerPersonaKind;
    values?: CareerProfileFormValues;
  };
  if (!body.values) {
    return apiError('Geçersiz profil güncellemesi.', 400);
  }

  const service = new CareerProfileService(ctx.container.listingRepository);
  try {
    const listingId = body.listingId && !body.listingId.startsWith('draft')
      ? ids.listing(body.listingId)
      : undefined;

    const record = await service.saveProfile(ctx.userId, listingId, body.values, body.persona);
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__testCareerProfileData = {
        seek: record,
        hire: null,
      };
    }
    return ok({ profile: record });
  } catch (error: any) {
    console.error('API /api/career/profile PATCH error:', error?.message || error);
    return apiError(error instanceof Error ? error.message : 'Profil kaydedilemedi.', 400);
  }
});

export const DELETE = withAuth(async (ctx, request) => {
  const body = (await request.json().catch(() => ({}))) as {
    listingId?: string;
    persona?: CareerPersonaKind;
  };

  const service = new CareerProfileService(ctx.container.listingRepository);
  try {
    const listingId = body.listingId && !body.listingId.startsWith('draft')
      ? ids.listing(body.listingId)
      : undefined;

    const deleted = await service.deleteProfile(ctx.userId, listingId, body.persona);
    return ok({ success: true, deleted });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Profil silinemedi.', 400);
  }
});

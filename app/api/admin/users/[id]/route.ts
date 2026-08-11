import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, noContent, apiError } from '@/lib/api/response';
import { parseAdminUserAction } from '@/lib/api/validation/admin';
import { ids } from '@/lib/domain/ids';

/** GET — user detail + latest legal consents */
export const GET = withAdmin(async (ctx, _request, { params }) => {
  const userId = ids.user(params.id);
  const user = await ctx.container.userRepository.findById(userId);
  if (!user) return apiError('Kullanıcı bulunamadı', 404);

  const profile = await ctx.container.profileRepository.findByUserId(userId);
  const consent = await ctx.container.accountService.getLatestConsent(userId);

  return ok({
    user,
    profile,
    displayName: profile?.displayName || user.email || params.id,
    consent: consent
      ? {
          termsAccepted: consent.termsAccepted,
          privacyAccepted: consent.privacyAccepted,
          kvkkAccepted: consent.kvkkAccepted,
          cookiesAccepted: consent.cookiesAccepted,
          marketingAccepted: consent.marketingAccepted,
          smsAccepted: consent.smsAccepted,
          emailAccepted: consent.emailAccepted,
          termsVersion: consent.termsVersion ?? null,
          privacyVersion: consent.privacyVersion ?? null,
          kvkkAckVersion: consent.kvkkAckVersion ?? null,
          cookiesVersion: consent.cookiesVersion ?? null,
          createdAt: consent.createdAt,
        }
      : null,
  });
});

/** PATCH — user lifecycle actions */
export const PATCH = withAdmin(async (ctx, request, { params }) => {
  const body = await parseJsonBody(request);
  const action = parseAdminUserAction(body);
  const userId = ids.user(params.id);
  const admin = ctx.container.adminService;

  switch (action.action) {
    case 'activate': {
      const user = await admin.activateUser(userId);
      return ok({ user });
    }
    case 'deactivate': {
      const user = await admin.deactivateUser(userId);
      return ok({ user });
    }
    case 'suspend': {
      const user = await admin.suspendUser(userId);
      return ok({ user });
    }
    case 'delete':
      await admin.deleteUser(userId);
      return noContent();
  }
});

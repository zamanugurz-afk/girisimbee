import { withAuth } from '@/lib/api/with-auth';
import { AccountDataRightsService } from '@/features/account/services/account-data-rights.service';
import { NextResponse } from 'next/server';

/**
 * GET — download own account data as JSON (self-service export).
 * Content-Disposition attachment; no other users' data.
 */
export const GET = withAuth(async (ctx) => {
  const service = new AccountDataRightsService(
    ctx.container.accountProfileRepository,
    ctx.container.userConsentRepository,
    ctx.container.userSettingsRepository,
    ctx.container.userSecurityLogRepository,
  );

  const payload = await service.buildExport(ctx.userId);
  const body = JSON.stringify(payload, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="girisimbee-verilerim-${ctx.userId}.json"`,
      'Cache-Control': 'no-store',
    },
  });
});

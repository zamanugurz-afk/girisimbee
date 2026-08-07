import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { NotFoundError } from '@/lib/domain/errors';
import { ids } from '@/lib/domain/ids';
import type { KvkkConsentRecordId } from '@/features/kvkk/types/kvkk-consent.types';

/** GET — owner's own KVKK consent records (latest first) */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const listingId = url.searchParams.get('listingId');
  const recordId = url.searchParams.get('id');
  const evidence = url.searchParams.get('evidence') === 'true';

  const service = ctx.container.ecosystem.kvkkConsentService;

  if (recordId) {
    const record = await service.getById(recordId as KvkkConsentRecordId);
    if (!record || record.userId !== ctx.userId) {
      throw new NotFoundError('KvkkConsentRecord', recordId);
    }
    if (evidence) {
      return ok({ evidence: await service.getEvidence(record.id) });
    }
    return ok({ record });
  }

  if (listingId) {
    const records = (await service.listForListing(ids.listing(listingId))).filter(
      (r) => r.userId === ctx.userId,
    );
    if (evidence && records[0]) {
      return ok({ evidence: await service.getEvidence(records[0].id), records });
    }
    return ok({ records });
  }

  const records = await service.listForUser(ctx.userId);
  return ok({ records });
});

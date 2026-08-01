import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { NotFoundError } from '@/lib/domain/errors';
import type { KvkkConsentRecordId } from '@/features/kvkk/types/kvkk-consent.types';

/** GET — documentary evidence export for a consent record */
export const GET = withAdmin(async (ctx, _request, { params }) => {
  const service = ctx.container.ecosystem.kvkkConsentService;
  const record = await service.getById(params.id as KvkkConsentRecordId);
  if (!record) throw new NotFoundError('KvkkConsentRecord', params.id);

  const evidence = await service.getEvidence(record.id);
  return ok({ evidence, record });
});

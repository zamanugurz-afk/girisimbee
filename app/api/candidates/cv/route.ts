import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  candidateCvRegisterSchema,
  candidateCvVisibilitySchema,
  candidateCvListQuerySchema,
} from '@/lib/api/validation/candidate-cv';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

/** GET — list CV documents; optional ?documentId for preview */
/** POST — register CV document */
/** PATCH — update CV visibility */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = candidateCvListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const service = ctx.container.ecosystem.candidateCvService;

  if (query.documentId) {
    const preview = await service.previewCv(ids.document(query.documentId), ctx.profileId);
    return ok({ cv: preview });
  }

  const cvs = await service.listCvs(ctx.profileId);
  return ok({ cvs });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = candidateCvRegisterSchema.parse(body);
  const document = await ctx.container.ecosystem.candidateCvService.registerCv(
    ctx.profileId,
    parsed,
  );
  return created({ document });
});

export const PATCH = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = candidateCvVisibilitySchema.parse(body);
  const url = new URL(request.url);
  const documentId = url.searchParams.get('documentId');
  if (!documentId) {
    throw new ValidationError('documentId gerekli.', { documentId: ['Belge kimliği belirtilmeli.'] });
  }
  const document = await ctx.container.ecosystem.candidateCvService.updateVisibility(
    ids.document(documentId),
    ctx.profileId,
    parsed.visibility,
  );
  return ok({ document });
});

import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, noContent } from '@/lib/api/response';
import { idParamSchema, updateDocumentSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = updateDocumentSchema.parse(body);
  const documentId = ids.document(id);
  const { documentService } = ctx.container.ecosystem;

  let document;
  if (parsed.visibility !== undefined) {
    document = await documentService.updateVisibility(documentId, ctx.profileId, parsed.visibility);
  }
  if (parsed.listingId) {
    document = await documentService.linkToListing(
      documentId,
      ids.listing(parsed.listingId),
      ctx.profileId,
    );
  }

  if (!document) {
    document = await documentService.requireById(documentId);
  }

  return ok({ document });
});

export const DELETE = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  await ctx.container.ecosystem.documentService.softDelete(ids.document(id), ctx.profileId);
  return noContent();
});

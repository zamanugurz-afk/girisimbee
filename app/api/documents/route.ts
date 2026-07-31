import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { registerDocumentSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export const GET = withAuth(async (ctx) => {
  const documents = await ctx.container.ecosystem.documentService.listByOwner(ctx.profileId);
  return ok({ documents });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = registerDocumentSchema.parse(body);
  const { documentService } = ctx.container.ecosystem;

  const document = await documentService.register({
    ownerProfileId: ctx.profileId,
    documentType: parsed.documentType,
    name: parsed.name,
    storagePath: parsed.storagePath,
    mimeType: parsed.mimeType,
    sizeBytes: parsed.sizeBytes,
    listingId: parsed.listingId ? ids.listing(parsed.listingId) : null,
    storageBucket: parsed.storageBucket,
    visibility: parsed.visibility,
    metadata: parsed.metadata,
  });

  return created({ document });
});

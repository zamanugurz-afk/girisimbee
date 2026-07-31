'use server';

import { runAuthenticatedAction } from '@/lib/api/action-handler';
import { registerDocumentSchema, updateDocumentSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export async function listDocumentsAction() {
  return runAuthenticatedAction(async (ctx) => {
    const documents = await ctx.container.ecosystem.documentService.listByOwner(ctx.profileId);
    return { documents };
  });
}

export async function registerDocumentAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = registerDocumentSchema.parse(input);
    const document = await ctx.container.ecosystem.documentService.register({
      ownerProfileId: ctx.profileId,
      ...parsed,
      listingId: parsed.listingId ? ids.listing(parsed.listingId) : null,
    });
    return { document };
  });
}

export async function updateDocumentAction(id: string, input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = updateDocumentSchema.parse(input);
    const documentId = ids.document(id);
    const { documentService } = ctx.container.ecosystem;

    if (parsed.visibility) {
      const document = await documentService.updateVisibility(
        documentId,
        ctx.profileId,
        parsed.visibility,
      );
      return { document };
    }

    if (parsed.listingId !== undefined) {
      const document = parsed.listingId
        ? await documentService.linkToListing(documentId, ids.listing(parsed.listingId), ctx.profileId)
        : await documentService.requireById(documentId);
      return { document };
    }

    const document = await documentService.requireById(documentId);
    return { document };
  });
}

export async function deleteDocumentAction(id: string) {
  return runAuthenticatedAction(async (ctx) => {
    await ctx.container.ecosystem.documentService.softDelete(ids.document(id), ctx.profileId);
    return { deleted: true as const };
  });
}

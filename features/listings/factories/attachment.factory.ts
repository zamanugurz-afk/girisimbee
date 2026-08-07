import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Attachment, CreateAttachmentInput } from '@/features/listings/types/attachment.types';

export function createAttachment(
  overrides: Partial<Attachment> & Pick<Attachment, 'listingId' | 'uploadedById' | 'name' | 'type' | 'mimeType' | 'url' | 'sizeBytes'>,
): Attachment {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.attachment(crypto.randomUUID()),
    listingId: overrides.listingId,
    uploadedById: overrides.uploadedById,
    name: overrides.name,
    type: overrides.type,
    mimeType: overrides.mimeType,
    url: overrides.url,
    sizeBytes: overrides.sizeBytes,
    status: overrides.status ?? 'ready',
    sortOrder: overrides.sortOrder ?? 0,
    metadata: overrides.metadata ?? {},
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createAttachmentInput(overrides: Partial<CreateAttachmentInput> = {}): CreateAttachmentInput {
  return {
    listingId: overrides.listingId ?? ids.listing(crypto.randomUUID()),
    uploadedById: overrides.uploadedById ?? ids.user(crypto.randomUUID()),
    name: overrides.name ?? 'pitch-deck.pdf',
    type: overrides.type ?? 'pdf',
    mimeType: overrides.mimeType ?? 'application/pdf',
    url: overrides.url ?? 'https://storage.girisimbee.test/attachments/pitch-deck.pdf',
    sizeBytes: overrides.sizeBytes ?? 1024000,
    sortOrder: overrides.sortOrder,
  };
}

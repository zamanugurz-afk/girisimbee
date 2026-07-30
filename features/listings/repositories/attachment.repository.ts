import type { Repository } from '@/lib/domain/repository';
import type { AttachmentId } from '@/lib/domain/ids';
import type { Attachment, CreateAttachmentInput, UpdateAttachmentInput, AttachmentFilter } from '@/features/listings/types/attachment.types';

export interface AttachmentRepository
  extends Repository<Attachment, AttachmentId, CreateAttachmentInput, UpdateAttachmentInput, AttachmentFilter> {
  findByListingId(listingId: Attachment['listingId']): Promise<Attachment[]>;
  transitionStatus(id: AttachmentId, status: Attachment['status']): Promise<Attachment>;
}

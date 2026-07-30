import type { ListingId, UserId } from '@/lib/domain/ids';
import type { Listing, CreateListingInput, UpdateListingInput, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { Application, CreateApplicationInput } from '@/features/listings/types/application.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface IListingService {
  create(input: CreateListingInput): Promise<Listing>;
  getById(id: ListingId): Promise<Listing | null>;
  getBySlug(slug: string): Promise<Listing | null>;
  update(id: ListingId, input: UpdateListingInput): Promise<Listing>;
  submitForReview(id: ListingId): Promise<Listing>;
  publish(id: ListingId): Promise<Listing>;
  pause(id: ListingId): Promise<Listing>;
  archive(id: ListingId): Promise<Listing>;
  recordView(id: ListingId, viewerId?: UserId): Promise<void>;
  search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  delete(id: ListingId): Promise<void>;
}

export interface IApplicationService {
  submit(input: CreateApplicationInput): Promise<Application>;
  getById(id: string): Promise<Application | null>;
  accept(id: string, ownerId: UserId): Promise<Application>;
  reject(id: string, ownerId: UserId): Promise<Application>;
  withdraw(id: string, applicantId: UserId): Promise<Application>;
  listByListing(listingId: ListingId, pagination?: PaginationParams): Promise<PaginatedResult<Application>>;
  listByApplicant(applicantId: UserId, pagination?: PaginationParams): Promise<PaginatedResult<Application>>;
}

export interface ITagService {
  findOrCreate(name: string): Promise<import('@/features/listings/types/tag.types').Tag>;
  attachToListing(listingId: ListingId, tagNames: string[]): Promise<void>;
  getTagsForListing(listingId: ListingId): Promise<import('@/features/listings/types/tag.types').Tag[]>;
}

export interface IAttachmentService {
  initiateUpload(listingId: ListingId, uploadedById: UserId, file: { name: string; mimeType: string; sizeBytes: number }): Promise<import('@/features/listings/types/attachment.types').Attachment>;
  confirmUpload(attachmentId: string): Promise<import('@/features/listings/types/attachment.types').Attachment>;
  listByListing(listingId: ListingId): Promise<import('@/features/listings/types/attachment.types').Attachment[]>;
  delete(attachmentId: string, requesterId: UserId): Promise<void>;
}

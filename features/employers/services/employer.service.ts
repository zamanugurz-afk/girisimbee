import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import type { ProfileId, UserId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { EmployerProfile, UpsertEmployerProfileInput } from '@/features/profiles/types/employer-profile.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  EmployerJobListingFilter,
  EmployerJobListingPayload,
  EmployerJobListingDetailViewModel,
} from '@/features/employers/types/employer-listing.types';
import {
  extractEmployerListingDetails,
  employerPayloadToCreateInput,
  employerPayloadToUpdateInput,
} from '@/features/employers/lib/employer-listing.mapper';
import { activateModule } from '@/features/shared/lib/module-activation';
import { contactFromEmployerProfile, contactFromListing } from '@/features/shared/lib/external-contact';
import { now } from '@/lib/domain/factory';
import { computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import {
  EMPLOYER_CATEGORY_ID,
  EMPLOYER_LISTING_TYPE_ID,
  EMPLOYER_PERSISTED_CATEGORY_ID,
  EMPLOYER_PERSISTED_LISTING_TYPE_ID,
} from '@/features/employers/constants/employer-listing-ids';

export interface PublishJobListingInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: EmployerJobListingPayload;
}

export interface CreateJobListingInput extends PublishJobListingInput {
  asDraft?: boolean;
}

export interface UpdateJobListingInput {
  ownerId: UserId;
  listingId: ListingId;
  listing: Partial<EmployerJobListingPayload>;
}

export class EmployerService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'employers');
  }

  upsertProfile(input: UpsertEmployerProfileInput) {
    return this.moduleProfileRepo.upsertEmployerProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findEmployerProfile(profileId);
  }

  getExternalContact(profile: EmployerProfile): ExternalContactInfo {
    return contactFromEmployerProfile(profile);
  }

  getListingContact(listing: Listing): ExternalContactInfo {
    return contactFromListing(listing);
  }

  browseJobs(filter: EmployerJobListingFilter = {}) {
    return this.listingRepo.findPublished({
      moduleKey: 'employers',
      city: filter.city,
      district: filter.district,
      industry: filter.sector,
    });
  }

  async createJobListing(input: CreateJobListingInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    const mapped = employerPayloadToCreateInput(input.listing);
    const publishNow = !input.asDraft;

    if (publishNow) {
      await this.moduleProfileRepo.upsertEmployerProfile({
        profileId: input.profileId,
        workflowStatus: 'published',
      });
    }

    console.log('[employers] listingRepo.create', {
      moduleKey: 'employers',
      category_id: EMPLOYER_PERSISTED_CATEGORY_ID,
      listing_type_id: EMPLOYER_PERSISTED_LISTING_TYPE_ID,
    });
    return this.listingRepo.create({
      ...mapped,
      ownerId: input.ownerId,
      categoryId: EMPLOYER_CATEGORY_ID,
      listingTypeId: EMPLOYER_LISTING_TYPE_ID,
      moduleKey: 'employers',
      anonymousMode: true,
      status: publishNow ? 'published' : 'draft',
      workflowStatus: publishNow ? 'published' : 'draft',
    });
  }

  async publishJobListing(input: PublishJobListingInput): Promise<Listing> {
    return this.createJobListing({ ...input, asDraft: false });
  }

  /** @deprecated Use publishJobListing */
  publishJob(input: PublishJobListingInput): Promise<Listing> {
    return this.publishJobListing(input);
  }

  async updateJobListing(input: UpdateJobListingInput): Promise<Listing> {
    const existing = await this.assertOwnedEmployerListing(input.ownerId, input.listingId);
    const update = employerPayloadToUpdateInput(input.listing, existing);
    return this.listingRepo.update(input.listingId, update);
  }

  async publishListingDraft(
    ownerId: UserId,
    profileId: ProfileId,
    listingId: ListingId,
  ): Promise<Listing> {
    const listing = await this.assertOwnedEmployerListing(ownerId, listingId);
    if (listing.status === 'published') return listing;

    await this.activateProfile(profileId);
    await this.moduleProfileRepo.upsertEmployerProfile({
      profileId,
      workflowStatus: 'published',
    });

    return this.listingRepo.update(listingId, {
      status: 'published',
      workflowStatus: 'published',
      publishedAt: listing.publishedAt ?? now(),
      expiresAt: listing.expiresAt ?? computeListingExpiry(),
    });
  }

  async getJobDetail(
    idOrSlug: string,
    options: { trackView?: boolean } = {},
  ): Promise<EmployerJobListingDetailViewModel | null> {
    const listing = await this.resolveListing(idOrSlug);
    if (!listing || listing.moduleKey !== 'employers') return null;

    if (options.trackView && listing.status === 'published') {
      await this.listingRepo.incrementViewCount(listing.id);
    }

    return {
      listing,
      details: extractEmployerListingDetails(listing),
    };
  }

  async incrementViews(listingId: ListingId): Promise<void> {
    const listing = await this.listingRepo.findById(listingId);
    if (listing?.status === 'published') {
      await this.listingRepo.incrementViewCount(listingId);
    }
  }

  private async resolveListing(idOrSlug: string): Promise<Listing | null> {
    const bySlug = await this.listingRepo.findBySlug(idOrSlug);
    if (bySlug) return bySlug;
    return this.listingRepo.findById(idOrSlug as ListingId);
  }

  private async assertOwnedEmployerListing(ownerId: UserId, listingId: ListingId): Promise<Listing> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) throw new NotFoundError('Listing', listingId);
    if (listing.moduleKey !== 'employers') {
      throw new ValidationError('Geçersiz iş ilanı.', { listingId: ['İş ilanı bulunamadı.'] });
    }
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenError('Bu ilan üzerinde işlem yapma yetkiniz yok.');
    }
    return listing;
  }
}

import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import type { ProfileId, UserId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { FranchiseSubcategorySlug } from '@/lib/domain/modules';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ApplicationService } from '@/features/matching/services/application.service';
import type {
  FranchiseBuyProfile,
  FranchiseGiveProfile,
  FranchiseProfile,
  UpsertFranchiseBuyProfileInput,
  UpsertFranchiseGiveProfileInput,
  UpsertFranchiseProfileInput,
} from '@/features/profiles/types/franchise-profile.types';
import type { CreateListingInput, Listing } from '@/features/listings/types/listing.entity.types';
import type {
  FranchiseFlow,
  FranchiseListingFilter,
  FranchiseListingPayload,
  FranchiseListingDetailViewModel,
} from '@/features/franchise/types/franchise-listing.types';
import {
  extractFranchiseListingDetails,
  resolveFranchiseFlow,
  franchisePayloadToCreateInput,
  franchisePayloadToUpdateInput,
} from '@/features/franchise/lib/franchise-listing.mapper';
import { activateModule } from '@/features/shared/lib/module-activation';
import { contactFromFranchiseProfile, contactFromListing } from '@/features/shared/lib/external-contact';
import { now } from '@/lib/domain/factory';
import { computeFranchiseListingExpiry } from '@/features/listings/utils/listing-expiry';
import {
  ECOSYSTEM_CATEGORY_IDS,
  FRANCHISE_SUBCATEGORY_IDS,
  FRANCHISE_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';
import {
  toPersistedCategoryId,
  toPersistedListingTypeId,
} from '@/lib/domain/legacy-category-ids';
import { MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';

const FLOW_TO_SUBCATEGORY: Record<FranchiseFlow, FranchiseSubcategorySlug> = {
  buy: 'franchise-buy',
  give: 'franchise-give',
};

export type { FranchiseFlow };

export interface PublishFranchiseListingInput {
  ownerId: UserId;
  profileId: ProfileId;
  flow: FranchiseFlow;
  listing: FranchiseListingPayload;
}

export interface CreateFranchiseListingInput extends PublishFranchiseListingInput {
  asDraft?: boolean;
}

export interface UpdateFranchiseListingInput {
  ownerId: UserId;
  listingId: ListingId;
  flow: FranchiseFlow;
  listing: Partial<FranchiseListingPayload>;
}

export class FranchiseService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly applicationService: ApplicationService,
  ) {}

  async activateProfile(profileId: ProfileId, flow: FranchiseFlow) {
    await activateModule(this.moduleProfileRepo, profileId, 'franchise');
    return this.moduleProfileRepo.upsertFranchiseProfile({
      profileId,
      subcategorySlug: FLOW_TO_SUBCATEGORY[flow],
    });
  }

  upsertProfile(input: UpsertFranchiseProfileInput) {
    return this.moduleProfileRepo.upsertFranchiseProfile(input);
  }

  upsertBuyProfile(
    profileId: ProfileId,
    input: Omit<UpsertFranchiseBuyProfileInput, 'profileId' | 'subcategorySlug'>,
  ) {
    return this.moduleProfileRepo.upsertFranchiseProfile({
      profileId,
      subcategorySlug: 'franchise-buy',
      ...input,
    });
  }

  upsertGiveProfile(
    profileId: ProfileId,
    input: Omit<UpsertFranchiseGiveProfileInput, 'profileId' | 'subcategorySlug'>,
  ) {
    return this.moduleProfileRepo.upsertFranchiseProfile({
      profileId,
      subcategorySlug: 'franchise-give',
      ...input,
    });
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findFranchiseProfile(profileId);
  }

  async getBuyProfile(profileId: ProfileId): Promise<FranchiseBuyProfile | null> {
    const profile = await this.getProfile(profileId);
    if (!profile || profile.subcategorySlug !== 'franchise-buy') return null;
    return profile as FranchiseBuyProfile;
  }

  async getGiveProfile(profileId: ProfileId): Promise<FranchiseGiveProfile | null> {
    const profile = await this.getProfile(profileId);
    if (!profile || profile.subcategorySlug !== 'franchise-give') return null;
    return profile as FranchiseGiveProfile;
  }

  getExternalContact(profile: FranchiseProfile): ExternalContactInfo {
    return contactFromFranchiseProfile(profile);
  }

  getListingContact(listing: Listing): ExternalContactInfo {
    return contactFromListing(listing);
  }

  /** Franchise listings — match marketplace bayilik browse (type IDs), not subcategory_id. */
  browseBuyOpportunities(filter: FranchiseListingFilter = {}) {
    return this.listingRepo.findPublished({
      listingTypeIds: [
        FRANCHISE_LISTING_TYPE_IDS.give,
        FRANCHISE_LISTING_TYPE_IDS.buy,
        MARKETPLACE_LISTING_TYPE_IDS.bayilikAl,
        MARKETPLACE_LISTING_TYPE_IDS.bayilikVer,
      ],
      city: filter.city,
      district: filter.district,
      industry: filter.sector,
    });
  }

  /** @deprecated Prefer browseBuyOpportunities — Al/Ver split removed */
  browseGiveSeekers(filter: FranchiseListingFilter = {}) {
    return this.browseBuyOpportunities(filter);
  }

  async createListing(input: CreateFranchiseListingInput): Promise<Listing> {
    await this.activateProfile(input.profileId, input.flow);
    const mapped = this.buildCreateInput(input.flow, input.listing);
    const publishNow = !input.asDraft;

    if (publishNow) {
      await this.moduleProfileRepo.upsertFranchiseProfile({
        profileId: input.profileId,
        subcategorySlug: FLOW_TO_SUBCATEGORY[input.flow],
        workflowStatus: 'published',
      });
    }

    console.log('[franchise] listingRepo.create', {
      category_id: toPersistedCategoryId(mapped.categoryId),
      listing_type_id: toPersistedListingTypeId(mapped.listingTypeId),
      moduleKey: mapped.moduleKey,
    });
    return this.listingRepo.create({
      ...mapped,
      ownerId: input.ownerId,
      status: publishNow ? 'published' : 'draft',
      workflowStatus: publishNow ? 'published' : 'draft',
    });
  }

  async publishBuyListing(input: PublishFranchiseListingInput): Promise<Listing> {
    return this.publishListing({ ...input, flow: 'buy' });
  }

  async publishGiveListing(input: PublishFranchiseListingInput): Promise<Listing> {
    return this.publishListing({ ...input, flow: 'give' });
  }

  async publishListing(input: PublishFranchiseListingInput): Promise<Listing> {
    return this.createListing({ ...input, asDraft: false });
  }

  async updateListing(input: UpdateFranchiseListingInput): Promise<Listing> {
    const existing = await this.assertOwnedFranchiseListing(input.ownerId, input.listingId);
    const flow = resolveFranchiseFlow(existing) ?? input.flow;
    const update = franchisePayloadToUpdateInput(flow, input.listing, existing);
    return this.listingRepo.update(input.listingId, update);
  }

  async publishListingDraft(
    ownerId: UserId,
    profileId: ProfileId,
    listingId: ListingId,
    flow: FranchiseFlow,
  ): Promise<Listing> {
    const listing = await this.assertOwnedFranchiseListing(ownerId, listingId);
    if (listing.status === 'published') return listing;

    await this.activateProfile(profileId, flow);
    await this.moduleProfileRepo.upsertFranchiseProfile({
      profileId,
      subcategorySlug: FLOW_TO_SUBCATEGORY[flow],
      workflowStatus: 'published',
    });

    return this.listingRepo.update(listingId, {
      status: 'published',
      workflowStatus: 'published',
      publishedAt: listing.publishedAt ?? now(),
      expiresAt: listing.expiresAt ?? computeFranchiseListingExpiry(),
    });
  }

  async getListingDetail(
    idOrSlug: string,
    options: { trackView?: boolean } = {},
  ): Promise<FranchiseListingDetailViewModel | null> {
    const listing = await this.resolveListing(idOrSlug);
    if (!listing || listing.moduleKey !== 'franchise') return null;

    const flow = resolveFranchiseFlow(listing);
    if (!flow) return null;

    if (options.trackView && listing.status === 'published') {
      // Don't block TTFB on analytics write.
      void this.listingRepo.incrementViewCount(listing.id).catch(() => undefined);
    }

    return {
      listing,
      flow,
      details: extractFranchiseListingDetails(listing),
    };
  }

  /** Apply to opposite flow listing (buy→give listing, give→buy listing) */
  async submitApplication(
    applicantProfileId: ProfileId,
    listingId: ListingId,
    coverMessage?: string,
  ) {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing || listing.moduleKey !== 'franchise') {
      throw new ValidationError('Geçersiz franchise ilanı.', { listingId: ['Franchise ilanı bulunamadı.'] });
    }
    return this.applicationService.submit({
      moduleKey: 'franchise',
      listingId,
      applicantProfileId,
      coverMessage: coverMessage ?? null,
    });
  }

  async contactAfterApplication(
    applicationId: Parameters<ApplicationService['contact']>[0],
    actorProfileId: ProfileId,
  ): Promise<ExternalContactInfo> {
    const result = await this.applicationService.contact(applicationId, actorProfileId);
    return result.contact;
  }

  assertFlowProfile(profileId: ProfileId, expected: FranchiseFlow) {
    return this.getProfile(profileId).then((profile) => {
      if (!profile || profile.subcategorySlug !== FLOW_TO_SUBCATEGORY[expected]) {
        throw new ForbiddenError(`Profil ${expected} akışı için yapılandırılmamış.`);
      }
      return profile;
    });
  }

  private buildCreateInput(
    flow: FranchiseFlow,
    listing: FranchiseListingPayload,
  ): Omit<CreateListingInput, 'ownerId'> {
    const subcategorySlug = FLOW_TO_SUBCATEGORY[flow];
    return {
      ...franchisePayloadToCreateInput(flow, listing),
      categoryId: ECOSYSTEM_CATEGORY_IDS.franchise,
      listingTypeId: flow === 'buy' ? FRANCHISE_LISTING_TYPE_IDS.buy : FRANCHISE_LISTING_TYPE_IDS.give,
      subcategoryId: FRANCHISE_SUBCATEGORY_IDS[subcategorySlug],
      moduleKey: 'franchise',
    };
  }

  private async resolveListing(idOrSlug: string): Promise<Listing | null> {
    const bySlug = await this.listingRepo.findBySlug(idOrSlug);
    if (bySlug) return bySlug;
    return this.listingRepo.findById(idOrSlug as ListingId);
  }

  private async assertOwnedFranchiseListing(ownerId: UserId, listingId: ListingId): Promise<Listing> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) throw new NotFoundError('Listing', listingId);
    if (listing.moduleKey !== 'franchise') {
      throw new ValidationError('Geçersiz franchise ilanı.', { listingId: ['Franchise ilanı bulunamadı.'] });
    }
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenError('Bu ilan üzerinde işlem yapma yetkiniz yok.');
    }
    return listing;
  }
}

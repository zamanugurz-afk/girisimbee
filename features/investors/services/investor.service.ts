import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import type { ProfileId, UserId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { MatchService } from '@/features/matching/services/match.service';
import type {
  InvestorProfile,
  UpsertInvestorProfileInput,
} from '@/features/profiles/types/investor-profile.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CreateMatchInput } from '@/features/matching/types/match.types';
import type {
  InvestorListingFilter,
  InvestorListingPayload,
  InvestorListingDetailViewModel,
} from '@/features/investors/types/investor-listing.types';
import {
  extractInvestorListingDetails,
  investorPayloadToCreateInput,
  investorPayloadToUpdateInput,
} from '@/features/investors/lib/investor-listing.mapper';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  contactFromInvestorProfile,
  contactFromListing,
} from '@/features/shared/lib/external-contact';
import { now } from '@/lib/domain/factory';
import { computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';
import {
  toPersistedCategoryId,
  toPersistedListingTypeId,
} from '@/lib/domain/legacy-category-ids';
import { LISTING_TYPE_CONFIGS } from '@/features/listings/config/listing-type-config';
import { traceListingPublish, tracePublishFailure } from '@/lib/debug/listing-publish-trace';

export interface PublishThesisInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: InvestorListingPayload;
}

export interface CreateThesisListingInput extends PublishThesisInput {
  asDraft?: boolean;
}

export interface UpdateThesisListingInput {
  ownerId: UserId;
  listingId: ListingId;
  listing: Partial<InvestorListingPayload>;
}

export class InvestorService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly matchService: MatchService,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'investors');
  }

  upsertProfile(input: UpsertInvestorProfileInput) {
    return this.moduleProfileRepo.upsertInvestorProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findInvestorProfile(profileId);
  }

  getExternalContact(profile: InvestorProfile): ExternalContactInfo {
    return contactFromInvestorProfile(profile);
  }

  getListingContact(listing: Listing): ExternalContactInfo {
    return contactFromListing(listing);
  }

  browseStartups(filter: { industry?: string; city?: string } = {}) {
    return this.listingRepo.findPublished({
      moduleKey: 'entrepreneurs',
      industry: filter.industry,
      city: filter.city,
    });
  }

  async browseThesisListings(filter: InvestorListingFilter = {}) {
    const result = await this.listingRepo.findPublished({
      moduleKey: 'investors',
      city: filter.city,
      district: filter.district,
      industry: filter.sector,
      investmentMin: filter.minimumInvestment,
    });

    let data = result.data;
    if (filter.stage) {
      data = data.filter((listing) => {
        const details = extractInvestorListingDetails(listing);
        return details.investmentStage === filter.stage;
      });
    }
    if (filter.maximumInvestment != null) {
      data = data.filter((listing) => {
        const details = extractInvestorListingDetails(listing);
        const min = details.minimumInvestment ?? 0;
        return min <= filter.maximumInvestment!;
      });
    }

    return { ...result, data, total: data.length };
  }

  async createThesisListing(input: CreateThesisListingInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    const mapped = investorPayloadToCreateInput(input.listing);
    const publishNow = !input.asDraft;

    if (publishNow) {
      await this.moduleProfileRepo.upsertInvestorProfile({
        profileId: input.profileId,
        workflowStatus: 'published',
      });
    }

    const listingTypeConfig = LISTING_TYPE_CONFIGS.find(
      (c) => c.categoryId === ECOSYSTEM_CATEGORY_IDS.investors,
    );
    traceListingPublish('investors', 'service_create', {
      payload: {
        category_id: ECOSYSTEM_CATEGORY_IDS.investors,
        listing_type_id: DEFAULT_LISTING_TYPE_IDS.investors,
        'listingType.id': listingTypeConfig?.listingTypeId ?? null,
        'listingType.slug': listingTypeConfig?.slug ?? null,
      },
    });

    console.log('[investors] listingRepo.create', {
      category_id: toPersistedCategoryId(ECOSYSTEM_CATEGORY_IDS.investors),
      listing_type_id: toPersistedListingTypeId(DEFAULT_LISTING_TYPE_IDS.investors),
      moduleKey: 'investors',
    });
    try {
      return await this.listingRepo.create({
        ...mapped,
        ownerId: input.ownerId,
        categoryId: ECOSYSTEM_CATEGORY_IDS.investors,
        listingTypeId: DEFAULT_LISTING_TYPE_IDS.investors,
        moduleKey: 'investors',
        status: publishNow ? 'published' : 'draft',
        workflowStatus: publishNow ? 'published' : 'draft',
      });
    } catch (error) {
      tracePublishFailure('investors', 'service_create', error, {
        categoryId: ECOSYSTEM_CATEGORY_IDS.investors,
        listingTypeId: DEFAULT_LISTING_TYPE_IDS.investors,
        publishNow,
      });
      throw error;
    }
  }

  async publishThesis(input: PublishThesisInput): Promise<Listing> {
    return this.createThesisListing({ ...input, asDraft: false });
  }

  async updateThesisListing(input: UpdateThesisListingInput): Promise<Listing> {
    const existing = await this.assertOwnedInvestorListing(input.ownerId, input.listingId);
    const update = investorPayloadToUpdateInput(input.listing, existing);
    return this.listingRepo.update(input.listingId, update);
  }

  async publishListingDraft(
    ownerId: UserId,
    profileId: ProfileId,
    listingId: ListingId,
  ): Promise<Listing> {
    const listing = await this.assertOwnedInvestorListing(ownerId, listingId);
    if (listing.status === 'published') return listing;

    await this.activateProfile(profileId);
    await this.moduleProfileRepo.upsertInvestorProfile({
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

  async getThesisDetail(
    idOrSlug: string,
    options: { trackView?: boolean; preview?: boolean } = {},
  ): Promise<InvestorListingDetailViewModel | null> {
    const listing = await this.resolveListing(idOrSlug);
    if (!listing || listing.moduleKey !== 'investors') return null;

    if (options.trackView && listing.status === 'published') {
      await this.listingRepo.incrementViewCount(listing.id);
    }

    const viewModel: InvestorListingDetailViewModel = {
      listing,
      details: extractInvestorListingDetails(listing),
    };

    if (options.preview && listing.anonymousMode) {
      viewModel.listing = {
        ...listing,
        contactPhone: null,
        contactWhatsapp: null,
        contactEmail: null,
      };
    }

    return viewModel;
  }

  requestMeeting(input: CreateMatchInput & { targetListingId?: ListingId }) {
    return this.matchService.create({
      moduleKey: 'investors',
      initiatorProfileId: input.initiatorProfileId,
      targetProfileId: input.targetProfileId,
      listingId: input.listingId,
      targetListingId: input.targetListingId,
    });
  }

  async contactStartup(
    matchId: Parameters<MatchService['contact']>[0],
    profileId: ProfileId,
  ): Promise<ExternalContactInfo> {
    const result = await this.matchService.contact(matchId, profileId);
    return result.contact;
  }

  private async resolveListing(idOrSlug: string): Promise<Listing | null> {
    const bySlug = await this.listingRepo.findBySlug(idOrSlug);
    if (bySlug) return bySlug;
    return this.listingRepo.findById(idOrSlug as ListingId);
  }

  private async assertOwnedInvestorListing(ownerId: UserId, listingId: ListingId): Promise<Listing> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) throw new NotFoundError('Listing', listingId);
    if (listing.moduleKey !== 'investors') {
      throw new ValidationError('Geçersiz yatırım ilanı.', { listingId: ['Yatırım ilanı bulunamadı.'] });
    }
    if (listing.ownerId && listing.ownerId !== ownerId) {
      throw new ForbiddenError('Bu ilan üzerinde işlem yapma yetkiniz yok.');
    }
    return listing;
  }
}

/** @deprecated Use InvestorService */
export { InvestorService as InvestorListingService };

import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import type { ProfileId, UserId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { MatchService } from '@/features/matching/services/match.service';
import type {
  FounderProfile,
  UpsertFounderProfileInput,
} from '@/features/profiles/types/founder-profile.types';
import type { CreateListingInput, Listing } from '@/features/listings/types/listing.entity.types';
import type { CreateMatchInput } from '@/features/matching/types/match.types';
import type {
  FounderListingFilter,
  FounderListingPayload,
  FounderListingDetailViewModel,
} from '@/features/founders/types/founder-listing.types';
import {
  extractFounderListingDetails,
  founderPayloadToCreateInput,
  founderPayloadToUpdateInput,
} from '@/features/founders/lib/founder-listing.mapper';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  contactFromFounderProfile,
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

export interface PublishFounderSearchInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: Omit<CreateListingInput, 'ownerId' | 'categoryId' | 'listingTypeId' | 'moduleKey'>;
}

export interface PublishCofounderListingInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: FounderListingPayload;
}

export interface CreateCofounderListingInput extends PublishCofounderListingInput {
  asDraft?: boolean;
}

export interface UpdateCofounderListingInput {
  ownerId: UserId;
  listingId: ListingId;
  listing: Partial<FounderListingPayload>;
}

export class FounderService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly matchService: MatchService,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'founders');
  }

  upsertProfile(input: UpsertFounderProfileInput) {
    return this.moduleProfileRepo.upsertFounderProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findFounderProfile(profileId);
  }

  getExternalContact(profile: FounderProfile): ExternalContactInfo {
    return contactFromFounderProfile(profile);
  }

  getListingContact(listing: Listing): ExternalContactInfo {
    return contactFromListing(listing);
  }

  async browseCoFounderListings(filter: FounderListingFilter = {}) {
    const result = await this.listingRepo.findPublished({
      moduleKey: 'founders',
      city: filter.city,
      district: filter.district,
      industry: filter.sector,
    });

    let data = result.data;
    if (filter.stage) {
      data = data.filter((listing) => {
        const details = extractFounderListingDetails(listing);
        return details.startupStage === filter.stage;
      });
    }
    if (filter.skills?.length) {
      const skills = filter.skills.map((s) => s.toLowerCase());
      data = data.filter((listing) => {
        const details = extractFounderListingDetails(listing);
        const required = (details.requiredSkills ?? []).map((s) => s.toLowerCase());
        const offered = (details.offeredSkills ?? []).map((s) => s.toLowerCase());
        const all = [...required, ...offered];
        return skills.some((skill) => all.includes(skill));
      });
    }

    return { ...result, data, total: data.length };
  }

  async createCofounderListing(input: CreateCofounderListingInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    const mapped = founderPayloadToCreateInput(input.listing);
    const publishNow = !input.asDraft;

    if (publishNow) {
      try {
        await this.moduleProfileRepo.upsertFounderProfile({
          profileId: input.profileId,
          workflowStatus: 'published',
        });
      } catch (err) {
        console.warn('[founders] upsertFounderProfile non-fatal error:', err);
      }
    }

    console.log('[founders] listingRepo.create', {
      category_id: toPersistedCategoryId(ECOSYSTEM_CATEGORY_IDS.founders),
      listing_type_id: toPersistedListingTypeId(DEFAULT_LISTING_TYPE_IDS.founders),
      moduleKey: 'founders',
    });
    return this.listingRepo.create({
      ...mapped,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.founders,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.founders,
      moduleKey: 'founders',
      status: publishNow ? 'published' : 'draft',
      workflowStatus: publishNow ? 'published' : 'draft',
    });
  }

  /** @deprecated Use createCofounderListing with asDraft: false */
  async publishSearch(input: PublishFounderSearchInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    await this.moduleProfileRepo.upsertFounderProfile({
      profileId: input.profileId,
      workflowStatus: 'published',
    });

    console.log('[founders] listingRepo.create', {
      category_id: toPersistedCategoryId(ECOSYSTEM_CATEGORY_IDS.founders),
      listing_type_id: toPersistedListingTypeId(DEFAULT_LISTING_TYPE_IDS.founders),
      moduleKey: 'founders',
    });
    return this.listingRepo.create({
      ...input.listing,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.founders,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.founders,
      moduleKey: 'founders',
      workflowStatus: 'published',
      status: 'published',
    });
  }

  async publishCofounderListing(input: PublishCofounderListingInput): Promise<Listing> {
    return this.createCofounderListing({ ...input, asDraft: false });
  }

  async updateCofounderListing(input: UpdateCofounderListingInput): Promise<Listing> {
    const existing = await this.assertOwnedFounderListing(input.ownerId, input.listingId);
    const update = founderPayloadToUpdateInput(input.listing, existing);
    return this.listingRepo.update(input.listingId, update);
  }

  async publishListingDraft(
    ownerId: UserId,
    profileId: ProfileId,
    listingId: ListingId,
  ): Promise<Listing> {
    const listing = await this.assertOwnedFounderListing(ownerId, listingId);
    if (listing.status === 'published') return listing;

    await this.activateProfile(profileId);
    await this.moduleProfileRepo.upsertFounderProfile({
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

  async getCofounderDetail(
    idOrSlug: string,
    options: { trackView?: boolean; preview?: boolean } = {},
  ): Promise<FounderListingDetailViewModel | null> {
    const listing = await this.resolveListing(idOrSlug);
    if (!listing || listing.moduleKey !== 'founders') return null;

    if (options.trackView && listing.status === 'published') {
      await this.listingRepo.incrementViewCount(listing.id);
    }

    const viewModel: FounderListingDetailViewModel = {
      listing,
      details: extractFounderListingDetails(listing),
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

  /** @deprecated Use findCoFounder or FounderApplicationService.submitInterest */
  findCoFounder(input: CreateMatchInput) {
    return this.matchService.create({
      moduleKey: 'founders',
      initiatorProfileId: input.initiatorProfileId,
      targetProfileId: input.targetProfileId,
      listingId: input.listingId,
    });
  }

  /** @deprecated Use FounderApplicationService.contactParticipant */
  async contactMatch(
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

  private async assertOwnedFounderListing(ownerId: UserId, listingId: ListingId): Promise<Listing> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) throw new NotFoundError('Listing', listingId);
    if (listing.moduleKey !== 'founders') {
      throw new ValidationError('Geçersiz ortak arama ilanı.', { listingId: ['Ortak arama ilanı bulunamadı.'] });
    }
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenError('Bu ilan üzerinde işlem yapma yetkiniz yok.');
    }
    return listing;
  }
}

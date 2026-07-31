import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import type { ProfileId, UserId, DocumentId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { DocumentService } from '@/features/documents/services/document.service';
import type { MatchService } from '@/features/matching/services/match.service';
import type {
  EntrepreneurProfile,
  UpsertEntrepreneurProfileInput,
} from '@/features/profiles/types/entrepreneur-profile.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CreateMatchInput } from '@/features/matching/types/match.types';
import type {
  EntrepreneurListingFilter,
  EntrepreneurListingPayload,
  EntrepreneurListingDetailViewModel,
} from '@/features/entrepreneurs/types/entrepreneur-listing.types';
import {
  extractEntrepreneurListingDetails,
  entrepreneurPayloadToCreateInput,
  entrepreneurPayloadToUpdateInput,
} from '@/features/entrepreneurs/lib/entrepreneur-listing.mapper';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  contactFromEntrepreneurProfile,
  contactFromListing,
} from '@/features/shared/lib/external-contact';
import { now } from '@/lib/domain/factory';
import { computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';

export interface PublishStartupInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: EntrepreneurListingPayload;
  pitchDeckDocumentId?: DocumentId | null;
}

export interface CreateStartupListingInput extends PublishStartupInput {
  asDraft?: boolean;
}

export interface UpdateStartupListingInput {
  ownerId: UserId;
  listingId: ListingId;
  listing: Partial<EntrepreneurListingPayload>;
}

export class EntrepreneurService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly documentService: DocumentService,
    private readonly matchService: MatchService,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'entrepreneurs');
  }

  upsertProfile(input: UpsertEntrepreneurProfileInput) {
    return this.moduleProfileRepo.upsertEntrepreneurProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findEntrepreneurProfile(profileId);
  }

  getExternalContact(profile: EntrepreneurProfile): ExternalContactInfo {
    return contactFromEntrepreneurProfile(profile);
  }

  getListingContact(listing: Listing): ExternalContactInfo {
    return contactFromListing(listing);
  }

  browseStartups(filter: EntrepreneurListingFilter = {}) {
    return this.listingRepo.findPublished({
      moduleKey: 'entrepreneurs',
      city: filter.city,
      district: filter.district,
      industry: filter.sector,
    });
  }

  async createStartupListing(input: CreateStartupListingInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    if (input.pitchDeckDocumentId) {
      await this.documentService.requireById(input.pitchDeckDocumentId);
    }

    const mapped = entrepreneurPayloadToCreateInput(input.listing);
    const publishNow = !input.asDraft;

    if (publishNow) {
      const deckId = input.pitchDeckDocumentId
        ?? (input.listing.pitchDeckDocumentId ? (input.listing.pitchDeckDocumentId as DocumentId) : null);
      await this.moduleProfileRepo.upsertEntrepreneurProfile({
        profileId: input.profileId,
        pitchDeckDocumentId: deckId,
        workflowStatus: 'published',
      });
    }

    return this.listingRepo.create({
      ...mapped,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.entrepreneurs,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.entrepreneurs,
      moduleKey: 'entrepreneurs',
      status: publishNow ? 'published' : 'draft',
      workflowStatus: publishNow ? 'published' : 'draft',
    });
  }

  async publishStartup(input: PublishStartupInput): Promise<Listing> {
    return this.createStartupListing({ ...input, asDraft: false });
  }

  async updateStartupListing(input: UpdateStartupListingInput): Promise<Listing> {
    const existing = await this.assertOwnedEntrepreneurListing(input.ownerId, input.listingId);
    const update = entrepreneurPayloadToUpdateInput(input.listing, existing);
    return this.listingRepo.update(input.listingId, update);
  }

  async publishListingDraft(
    ownerId: UserId,
    profileId: ProfileId,
    listingId: ListingId,
  ): Promise<Listing> {
    const listing = await this.assertOwnedEntrepreneurListing(ownerId, listingId);
    if (listing.status === 'published') return listing;

    await this.activateProfile(profileId);
    await this.moduleProfileRepo.upsertEntrepreneurProfile({
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

  async getStartupDetail(
    idOrSlug: string,
    options: { trackView?: boolean; preview?: boolean } = {},
  ): Promise<EntrepreneurListingDetailViewModel | null> {
    const listing = await this.resolveListing(idOrSlug);
    if (!listing || listing.moduleKey !== 'entrepreneurs') return null;

    if (options.trackView && listing.status === 'published') {
      await this.listingRepo.incrementViewCount(listing.id);
    }

    const viewModel: EntrepreneurListingDetailViewModel = {
      listing,
      details: extractEntrepreneurListingDetails(listing),
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

  async incrementViews(listingId: ListingId): Promise<void> {
    const listing = await this.listingRepo.findById(listingId);
    if (listing?.status === 'published') {
      await this.listingRepo.incrementViewCount(listingId);
    }
  }

  requestInvestorMatch(input: CreateMatchInput & { listingId: ListingId }) {
    return this.matchService.create({
      moduleKey: 'entrepreneurs',
      initiatorProfileId: input.initiatorProfileId,
      targetProfileId: input.targetProfileId,
      listingId: input.listingId,
    });
  }

  async contactInvestor(
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

  private async assertOwnedEntrepreneurListing(ownerId: UserId, listingId: ListingId): Promise<Listing> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) throw new NotFoundError('Listing', listingId);
    if (listing.moduleKey !== 'entrepreneurs') {
      throw new ValidationError('Geçersiz startup ilanı.', { listingId: ['Startup ilanı bulunamadı.'] });
    }
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenError('Bu ilan üzerinde işlem yapma yetkiniz yok.');
    }
    return listing;
  }
}

/** @deprecated Use EntrepreneurService */
export { EntrepreneurService as EntrepreneurListingService };

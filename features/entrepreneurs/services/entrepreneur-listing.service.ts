import { NotFoundError } from '@/lib/domain/errors';
import type { ProfileId, UserId, DocumentId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { DocumentService } from '@/features/documents/services/document.service';
import type { MatchService } from '@/features/matching/services/match.service';
import type { UpsertEntrepreneurProfileInput } from '@/features/profiles/types/entrepreneur-profile.types';
import type { CreateListingInput, Listing } from '@/features/listings/types/listing.entity.types';
import type { CreateMatchInput } from '@/features/matching/types/match.types';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';
import { createListing } from '@/features/listings/factories/listing.factory';
import { slugify } from '@/lib/domain/factory';

export interface PublishStartupInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: Omit<CreateListingInput, 'ownerId' | 'categoryId' | 'listingTypeId' | 'moduleKey'>;
  pitchDeckDocumentId?: DocumentId | null;
}

export class EntrepreneurListingService {
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

  async publishStartup(input: PublishStartupInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    if (input.pitchDeckDocumentId) {
      await this.documentService.requireById(input.pitchDeckDocumentId);
    }

    await this.moduleProfileRepo.upsertEntrepreneurProfile({
      profileId: input.profileId,
      pitchDeckDocumentId: input.pitchDeckDocumentId ?? null,
      workflowStatus: 'published',
    });

    const slug = slugify(input.listing.title);
    const entity = createListing({
      ...input.listing,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.entrepreneurs,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.entrepreneurs,
      moduleKey: 'entrepreneurs',
      slug,
      workflowStatus: 'published',
      status: 'published',
    });

    return this.listingRepo.create({
      ownerId: entity.ownerId,
      categoryId: entity.categoryId,
      listingTypeId: entity.listingTypeId,
      moduleKey: entity.moduleKey,
      title: entity.title,
      shortDescription: entity.shortDescription,
      longDescription: entity.longDescription,
      city: entity.city,
      district: entity.district,
      industry: entity.industry,
      contactPhone: entity.contactPhone,
      contactWhatsapp: entity.contactWhatsapp,
      contactEmail: entity.contactEmail,
      contactWebsite: entity.contactWebsite,
      workflowStatus: 'published',
      status: 'published',
    });
  }

  requestInvestorMatch(input: CreateMatchInput & { listingId: ListingId }) {
    return this.matchService.create({
      moduleKey: 'entrepreneurs',
      initiatorProfileId: input.initiatorProfileId,
      targetProfileId: input.targetProfileId,
      listingId: input.listingId,
    });
  }

  async contactInvestor(matchId: Parameters<MatchService['contact']>[0], profileId: ProfileId): Promise<ExternalContactInfo> {
    const result = await this.matchService.contact(matchId, profileId);
    return result.contact;
  }
}

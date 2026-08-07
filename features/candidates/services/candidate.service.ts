import type { ProfileId, DocumentId, UserId, ListingId } from '@/lib/domain/ids';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ApplicationService } from '@/features/matching/services/application.service';
import type { DocumentService } from '@/features/documents/services/document.service';
import type { UpsertCandidateProfileInput } from '@/features/profiles/types/candidate-profile.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  CandidateListingFilter,
  CandidateListingPayload,
  CandidateListingDetailViewModel,
} from '@/features/candidates/types/candidate-listing.types';
import {
  candidatePayloadToCreateInput,
  extractCandidateListingDetails,
} from '@/features/candidates/lib/candidate-listing.mapper';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';
import {
  toPersistedCategoryId,
  toPersistedListingTypeId,
} from '@/lib/domain/legacy-category-ids';
import { ValidationError } from '@/lib/domain/errors';
import { areAllKvkkConsentsAccepted } from '@/features/kvkk/constants/kvkk-consent-policy';
import type { KvkkConsentService } from '@/features/kvkk/services/kvkk-consent.service';

export interface CreateCandidateListingInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: CandidateListingPayload;
  asDraft?: boolean;
  consentContext?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

export class CandidateService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly applicationService: ApplicationService,
    private readonly documentService: DocumentService,
    private readonly listingRepo: ListingRepository,
    private readonly kvkkConsentService: KvkkConsentService,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'candidates');
  }

  upsertProfile(input: UpsertCandidateProfileInput) {
    return this.moduleProfileRepo.upsertCandidateProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findCandidateProfile(profileId);
  }

  async attachCv(profileId: ProfileId, documentId: DocumentId) {
    await this.documentService.requireById(documentId);
    return this.moduleProfileRepo.upsertCandidateProfile({
      profileId,
      cvDocumentId: documentId,
    });
  }

  applyToJob(profileId: ProfileId, listingId: ListingId, coverMessage?: string) {
    return this.applicationService.submit({
      moduleKey: 'candidates',
      listingId,
      applicantProfileId: profileId,
      coverMessage: coverMessage ?? null,
    });
  }

  listApplications(profileId: ProfileId) {
    return this.applicationService.listForApplicant(profileId);
  }

  browseCandidateListings(filter: CandidateListingFilter = {}) {
    return this.listingRepo.findPublished({
      moduleKey: 'candidates',
      city: filter.city,
      district: filter.district,
    });
  }

  async createCandidateListing(input: CreateCandidateListingInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    const mapped = candidatePayloadToCreateInput(input.listing);
    const publishNow = !input.asDraft;

    if (publishNow && !areAllKvkkConsentsAccepted(input.listing.kvkkConsents)) {
      throw new ValidationError('Tüm KVKK onay kutularını işaretlemeniz gerekmektedir.', {
        kvkkConsents: ['Tüm KVKK onay kutularını işaretlemeniz gerekmektedir.'],
      });
    }

    if (publishNow) {
      await this.moduleProfileRepo.upsertCandidateProfile({
        profileId: input.profileId,
        workflowStatus: 'published',
      });
    }

    console.log('[candidates] listingRepo.create', {
      category_id: toPersistedCategoryId(ECOSYSTEM_CATEGORY_IDS.candidates),
      listing_type_id: toPersistedListingTypeId(DEFAULT_LISTING_TYPE_IDS.candidates),
      moduleKey: 'candidates',
    });

    const listing = await this.listingRepo.create({
      ...mapped,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.candidates,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.candidates,
      moduleKey: 'candidates',
      status: publishNow ? 'published' : 'draft',
      workflowStatus: publishNow ? 'published' : 'draft',
    });

    if (publishNow) {
      try {
        await this.kvkkConsentService.recordListingPublishConsent({
          userId: input.ownerId,
          profileId: input.profileId,
          listingId: listing.id,
          consents: input.listing.kvkkConsents,
          ipAddress: input.consentContext?.ipAddress,
          userAgent: input.consentContext?.userAgent,
        });
      } catch (error) {
        await this.listingRepo.softDelete(listing.id);
        throw error;
      }
    }

    return listing;
  }

  async getCandidateListingDetail(idOrSlug: string): Promise<CandidateListingDetailViewModel | null> {
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
    const listing = isUuid
      ? await this.listingRepo.findById(idOrSlug as ListingId)
      : await this.listingRepo.findBySlug(idOrSlug);
    if (!listing || listing.moduleKey !== 'candidates') return null;
    return { listing, details: extractCandidateListingDetails(listing) };
  }
}

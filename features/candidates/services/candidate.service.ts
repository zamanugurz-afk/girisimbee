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
import { ValidationError } from '@/lib/domain/errors';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { assertCareerProfileTextsClean } from '@/features/candidates/lib/career-profile-content-policy';
import {
  parseCareerExperiences,
  validateCareerExperiences,
} from '@/features/candidates/config/career-profile-fields';
import type { KvkkConsentService } from '@/features/kvkk/services/kvkk-consent.service';
import { toPublicListingEntity } from '@/features/contact-requests/lib/strip-listing-phone';

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

  async browseCandidateListings(filter: CandidateListingFilter = {}) {
    const result = await this.listingRepo.findPublished({
      moduleKey: 'candidates',
      city: filter.city,
      district: filter.district,
    });
    return {
      ...result,
      data: result.data.map(toPublicListingEntity),
    };
  }

  async createCandidateListing(input: CreateCandidateListingInput): Promise<Listing> {
    try {
      await this.activateProfile(input.profileId);
    } catch (err) {
      console.warn('[candidates] activateProfile non-fatal error:', err);
    }

    const experiences = parseCareerExperiences(input.listing.experiences);
    const expError = validateCareerExperiences(experiences);
    if (expError) {
      throw new ValidationError(expError, { experiences: [expError] });
    }

    try {
      assertCareerProfileTextsClean([
        input.listing.longDescription,
        input.listing.professionalSkills,
        input.listing.technicalSkills,
        input.listing.leadershipExperience,
        ...experiences.flatMap((e) => [e.responsibilities, e.achievements]),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İçerik politikası ihlali';
      throw new ValidationError(message, { longDescription: [message] });
    }

    const mapped = candidatePayloadToCreateInput({
      ...input.listing,
      experiences,
      city: input.listing.preferredCity ?? input.listing.city ?? null,
    });
    const publishNow = !input.asDraft;

    if (publishNow) {
      try {
        await this.moduleProfileRepo.upsertCandidateProfile({
          profileId: input.profileId,
          workflowStatus: 'published',
        });
      } catch (err) {
        console.warn('[candidates] upsertCandidateProfile non-fatal error:', err);
      }
    }

    console.log('[candidates] listingRepo.create', {
      category_id: CATEGORY_IDS.isBul,
      listing_type_id: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
    });

    const listing = await this.listingRepo.create({
      ...mapped,
      ownerId: input.ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      status: publishNow ? 'published' : 'draft',
      workflowStatus: publishNow ? 'published' : 'draft',
    });

    if (publishNow) {
      // Career profiles use standard publish consents (phone/KVKK UI), not CV-sharing KVKK.
      // Consent audit for phone publish is recorded by shared listing publish paths when available.
    }

    return listing;
  }

  async getCandidateListingDetail(idOrSlug: string): Promise<CandidateListingDetailViewModel | null> {
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
    const listing = isUuid
      ? await this.listingRepo.findById(idOrSlug as ListingId)
      : await this.listingRepo.findBySlug(idOrSlug);
    if (!listing || listing.moduleKey !== 'candidates') return null;
    const publicListing = toPublicListingEntity(listing);
    return {
      listing: publicListing,
      details: extractCandidateListingDetails(publicListing),
    };
  }
}

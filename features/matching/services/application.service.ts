import { NotFoundError, ForbiddenError, ConflictError } from '@/lib/domain/errors';
import type { ApplicationId, ProfileId, ListingId, PaymentId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type {
  MarketplaceApplication,
  CreateApplicationInput,
} from '@/features/matching/types/application.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import {
  AnonymizationService,
  type AnonymousApplicationView,
  type UnlockedApplicationView,
} from '@/features/matching/services/anonymization.service';
import { contactFromListing, hasExternalContact } from '@/features/shared/lib/external-contact';

export interface ApplicationContactResult {
  application: MarketplaceApplication;
  contact: ExternalContactInfo;
}

export class ApplicationService {
  private readonly anonymization = new AnonymizationService();

  constructor(
    private readonly applicationRepo: ApplicationRepository,
    private readonly listingRepo: ListingRepository,
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly profileRepo: ProfileRepository,
  ) {}

  async submit(input: CreateApplicationInput): Promise<MarketplaceApplication> {
    const listing = await this.requireListing(input.listingId);
    const existing = await this.applicationRepo.findMany({
      listingId: input.listingId,
      applicantProfileId: input.applicantProfileId,
    });
    if (existing.data.length > 0) {
      throw new ConflictError('Bu ilana zaten başvuru yapılmış.');
    }

    let anonymousSnapshot = input.anonymousSnapshot;
    if (input.moduleKey === 'candidates' && !anonymousSnapshot) {
      const candidate = await this.moduleProfileRepo.findCandidateProfile(input.applicantProfileId);
      if (candidate) {
        anonymousSnapshot = this.anonymization.buildSnapshot(candidate, listing.industry);
      }
    }

    const application = await this.applicationRepo.create({
      ...input,
      anonymousSnapshot,
    });
    await this.listingRepo.incrementApplicationCount(listing.id);
    return application;
  }

  getById(id: ApplicationId): Promise<MarketplaceApplication | null> {
    return this.applicationRepo.findById(id);
  }

  listForListing(listingId: ListingId): Promise<MarketplaceApplication[]> {
    return this.applicationRepo.findForListing(listingId);
  }

  listForApplicant(applicantProfileId: ProfileId): Promise<MarketplaceApplication[]> {
    return this.applicationRepo.findForApplicant(applicantProfileId);
  }

  /** Employer views anonymous application */
  async getAnonymousView(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<AnonymousApplicationView> {
    const application = await this.requireApplication(applicationId);
    await this.assertListingManager(application, viewerProfileId);
    return this.anonymization.toAnonymousView(application);
  }

  /** After payment unlock — employer sees full candidate info */
  async getUnlockedView(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<UnlockedApplicationView> {
    const application = await this.requireApplication(applicationId);
    await this.assertListingManager(application, viewerProfileId);
    if (!this.anonymization.isUnlocked(application)) {
      throw new ForbiddenError('Başvuru henüz açılmadı. Paket satın alın.');
    }
    const candidate = await this.moduleProfileRepo.findCandidateProfile(application.applicantProfileId);
    const profile = await this.profileRepo.findById(application.applicantProfileId);
    if (!candidate || !profile) throw new NotFoundError('CandidateProfile', application.applicantProfileId);
    return this.anonymization.toUnlockedView(application, candidate, profile);
  }

  async markReviewing(applicationId: ApplicationId, managerProfileId: ProfileId): Promise<MarketplaceApplication> {
    const application = await this.requireApplication(applicationId);
    await this.assertListingManager(application, managerProfileId);
    return this.applicationRepo.transitionStatus(applicationId, 'reviewing');
  }

  async unlock(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    paymentId: PaymentId,
  ): Promise<MarketplaceApplication> {
    const application = await this.requireApplication(applicationId);
    await this.assertListingManager(application, managerProfileId);
    return this.applicationRepo.update(applicationId, {
      status: 'unlocked',
      unlockedAt: new Date().toISOString(),
      paymentId,
    });
  }

  /** v1: external contact via listing owner contact fields */
  async contact(
    applicationId: ApplicationId,
    actorProfileId: ProfileId,
  ): Promise<ApplicationContactResult> {
    const application = await this.requireApplication(applicationId);
    const isApplicant = application.applicantProfileId === actorProfileId;
    if (!isApplicant) {
      await this.assertListingManager(application, actorProfileId);
      if (!this.anonymization.isUnlocked(application)) {
        throw new ForbiddenError('İletişim için başvuru açılmalıdır.');
      }
    }
    const listing = await this.requireListing(application.listingId);
    const contact = contactFromListing(listing);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', application.listingId);
    }
    const updated = await this.applicationRepo.transitionStatus(applicationId, 'contacted');
    return { application: updated, contact };
  }

  withdraw(applicationId: ApplicationId, applicantProfileId: ProfileId): Promise<MarketplaceApplication> {
    return this.transitionAsApplicant(applicationId, applicantProfileId, 'withdrawn');
  }

  private async transitionAsApplicant(
    applicationId: ApplicationId,
    applicantProfileId: ProfileId,
    status: MarketplaceApplication['status'],
  ): Promise<MarketplaceApplication> {
    const application = await this.requireApplication(applicationId);
    if (application.applicantProfileId !== applicantProfileId) {
      throw new ForbiddenError('Başvuru sahibi değilsiniz.');
    }
    return this.applicationRepo.transitionStatus(applicationId, status);
  }

  private async requireApplication(id: ApplicationId): Promise<MarketplaceApplication> {
    const application = await this.applicationRepo.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    return application;
  }

  private async requireListing(id: ListingId): Promise<Listing> {
    const listing = await this.listingRepo.findById(id);
    if (!listing) throw new NotFoundError('Listing', id);
    return listing;
  }

  private async assertListingManager(
    application: MarketplaceApplication,
    profileId: ProfileId,
  ): Promise<void> {
    const listing = await this.requireListing(application.listingId);
    const ownerProfile = await this.profileRepo.findById(profileId);
    if (!ownerProfile || listing.ownerId !== ownerProfile.userId) {
      throw new ForbiddenError('Bu başvuruyu yönetme yetkiniz yok.');
    }
  }
}

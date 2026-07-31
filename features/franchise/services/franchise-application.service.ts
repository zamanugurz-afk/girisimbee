import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '@/lib/domain/errors';
import type {
  ApplicationId,
  ProfileId,
  ListingId,
  UserId,
} from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type {
  FranchiseApplicationDetail,
  FranchiseApplicationFilter,
  FranchiseApplicationStatus,
  FranchiseApplicationSummary,
  FranchiseApplicationContactResult,
} from '@/features/franchise/types/franchise-application.types';
import {
  appendNote,
  appendStatusHistory,
  getFranchiseMetadata,
  initialStatusHistory,
  mergeFranchiseMetadata,
  toApplicationStatus,
  toFranchiseStatus,
} from '@/features/franchise/lib/franchise-application-metadata';
import type { FranchiseBuyProfile } from '@/features/profiles/types/franchise-profile.types';
import {
  contactFromFranchiseProfile,
  contactFromListing,
  contactFromProfile,
  hasExternalContact,
} from '@/features/shared/lib/external-contact';
import { FRANCHISE_TO_APPLICATION_STATUS } from '@/features/franchise/types/franchise-application.types';

export class FranchiseApplicationService {
  constructor(
    private readonly applicationRepo: ApplicationRepository,
    private readonly listingRepo: ListingRepository,
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  /** Bayilik Al applicant applies to a franchise-give listing */
  async submitApplication(
    applicantProfileId: ProfileId,
    listingId: ListingId,
    coverMessage?: string | null,
    initialNote?: string,
  ): Promise<FranchiseApplicationSummary> {
    const listing = await this.requireFranchiseListing(listingId);
    const existing = await this.applicationRepo.findMany({
      moduleKey: 'franchise',
      listingId,
      applicantProfileId,
    });
    if (existing.data.length > 0) {
      throw new ConflictError('Bu ilana zaten başvuru yapılmış.');
    }

    const metadata = {
      franchise: {
        notes: initialNote
          ? [{ id: crypto.randomUUID(), authorProfileId: applicantProfileId, text: initialNote, createdAt: new Date().toISOString() }]
          : [],
        statusHistory: initialStatusHistory(applicantProfileId),
      },
    };

    const application = await this.applicationRepo.create({
      moduleKey: 'franchise',
      listingId,
      applicantProfileId,
      coverMessage: coverMessage ?? null,
      metadata,
    });
    await this.listingRepo.incrementApplicationCount(listing.id);
    return this.toSummary(application);
  }

  /** Franchisor lists applications for own listing with optional filters */
  async listApplicationsForListing(
    listingId: ListingId,
    managerProfileId: ProfileId,
    filter: Omit<FranchiseApplicationFilter, 'listingId'> = {},
  ): Promise<FranchiseApplicationSummary[]> {
    await this.assertListingManagerByListing(listingId, managerProfileId);
    const applications = await this.findFiltered({ ...filter, listingId });
    return applications.map((a) => this.toSummary(a));
  }

  /** Buyer tracks own applications */
  async listApplicationsForApplicant(
    applicantProfileId: ProfileId,
    filter: Omit<FranchiseApplicationFilter, 'applicantProfileId'> = {},
  ): Promise<FranchiseApplicationSummary[]> {
    const applications = await this.findFiltered({ ...filter, applicantProfileId });
    return applications.map((a) => this.toSummary(a));
  }

  async getApplicationDetail(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<FranchiseApplicationDetail> {
    const application = await this.requireFranchiseApplication(applicationId);
    await this.assertCanView(application, viewerProfileId);

    const isManager = await this.isListingManager(application, viewerProfileId);
    const listing = await this.listingRepo.findById(application.listingId);
    const applicantProfile = isManager
      ? await this.moduleProfileRepo.findFranchiseProfile(application.applicantProfileId)
      : null;

    const meta = getFranchiseMetadata(application);
    return {
      ...this.toSummary(application),
      notes: meta.notes ?? [],
      history: meta.statusHistory ?? [],
      applicantProfile:
        applicantProfile?.subcategorySlug === 'franchise-buy'
          ? (applicantProfile as FranchiseBuyProfile)
          : null,
      listing: isManager ? null : listing,
    };
  }

  async updateApplicationStatus(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    franchiseStatus: FranchiseApplicationStatus,
    note?: string,
  ): Promise<FranchiseApplicationSummary> {
    const application = await this.requireFranchiseApplication(applicationId);
    await this.assertListingManager(application, managerProfileId);

    const nextStatus = toApplicationStatus(franchiseStatus);
    let updated = await this.applicationRepo.transitionFranchiseStatus(applicationId, nextStatus);

    let metadata = mergeFranchiseMetadata(updated, {
      statusHistory: appendStatusHistory(updated, franchiseStatus, managerProfileId),
    });

    if (note) {
      metadata = mergeFranchiseMetadata(
        { ...updated, metadata },
        { notes: appendNote({ ...updated, metadata }, managerProfileId, note) },
      );
    }

    updated = await this.applicationRepo.update(applicationId, { metadata });
    return this.toSummary(updated);
  }

  /** External contact — no internal messaging, no unlock gate for franchise */
  async contactApplicant(
    applicationId: ApplicationId,
    actorProfileId: ProfileId,
  ): Promise<FranchiseApplicationContactResult> {
    const application = await this.requireFranchiseApplication(applicationId);
    const isApplicant = application.applicantProfileId === actorProfileId;

    if (isApplicant) {
      const listing = await this.requireFranchiseListing(application.listingId);
      const contact = contactFromListing(listing);
      if (!hasExternalContact(contact)) {
        throw new NotFoundError('ContactInfo', application.listingId);
      }
      const updated = await this.transitionToContacted(application, actorProfileId);
      return { application: this.toSummary(updated), contact };
    }

    await this.assertListingManager(application, actorProfileId);
    const contact = await this.resolveApplicantContact(application.applicantProfileId);
    const updated = await this.transitionToContacted(application, actorProfileId);
    return { application: this.toSummary(updated), contact };
  }

  async addApplicationNote(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    note: string,
  ): Promise<FranchiseApplicationSummary> {
    const application = await this.requireFranchiseApplication(applicationId);
    await this.assertListingManager(application, managerProfileId);

    const metadata = mergeFranchiseMetadata(application, {
      notes: appendNote(application, managerProfileId, note),
    });
    const updated = await this.applicationRepo.update(applicationId, { metadata });
    return this.toSummary(updated);
  }

  async getApplicationHistory(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<FranchiseApplicationDetail['history']> {
    const detail = await this.getApplicationDetail(applicationId, viewerProfileId);
    return detail.history;
  }

  async withdrawApplication(
    applicationId: ApplicationId,
    applicantProfileId: ProfileId,
  ): Promise<FranchiseApplicationSummary> {
    const application = await this.requireFranchiseApplication(applicationId);
    if (application.applicantProfileId !== applicantProfileId) {
      throw new ForbiddenError('Başvuru sahibi değilsiniz.');
    }
    let updated = await this.applicationRepo.transitionFranchiseStatus(applicationId, 'withdrawn');
    const metadata = mergeFranchiseMetadata(updated, {
      statusHistory: appendStatusHistory(updated, 'withdrawn', applicantProfileId),
    });
    updated = await this.applicationRepo.update(applicationId, { metadata });
    return this.toSummary(updated);
  }

  async markReviewing(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
  ): Promise<FranchiseApplicationSummary> {
    return this.updateApplicationStatus(applicationId, managerProfileId, 'reviewing');
  }

  favoriteListing(userId: UserId, listingId: ListingId) {
    return this.favoriteRepo.create({ userId, listingId });
  }

  async unfavoriteListing(userId: UserId, listingId: ListingId): Promise<void> {
    const favorite = await this.favoriteRepo.findByUserAndListing(userId, listingId);
    if (!favorite) throw new NotFoundError('Favorite', `${userId}:${listingId}`);
    await this.favoriteRepo.delete(favorite.id);
  }

  async incrementListingViews(listingId: ListingId): Promise<void> {
    const listing = await this.listingRepo.findById(listingId);
    if (listing?.status === 'published') {
      await this.listingRepo.incrementViewCount(listingId);
    }
  }

  private async findFiltered(filter: FranchiseApplicationFilter): Promise<MarketplaceApplication[]> {
    const appFilter = {
      moduleKey: 'franchise' as const,
      listingId: filter.listingId,
      applicantProfileId: filter.applicantProfileId,
      submittedAfter: filter.submittedAfter,
      submittedBefore: filter.submittedBefore,
      status: filter.status
        ? (Array.isArray(filter.status)
            ? filter.status.map((s) => FRANCHISE_TO_APPLICATION_STATUS[s])
            : FRANCHISE_TO_APPLICATION_STATUS[filter.status])
        : undefined,
    };
    const { data } = await this.applicationRepo.findMany(appFilter, { page: 1, limit: 500 });
    return data;
  }

  private async transitionToContacted(
    application: MarketplaceApplication,
    actorProfileId: ProfileId,
  ): Promise<MarketplaceApplication> {
    let updated =
      application.status === 'contacted'
        ? application
        : await this.applicationRepo.transitionFranchiseStatus(application.id, 'contacted');

    if (application.status !== 'contacted') {
      const metadata = mergeFranchiseMetadata(updated, {
        statusHistory: appendStatusHistory(updated, 'contacted', actorProfileId),
      });
      updated = await this.applicationRepo.update(application.id, { metadata });
    }
    return updated;
  }

  private async resolveApplicantContact(applicantProfileId: ProfileId): Promise<ExternalContactInfo> {
    const franchiseProfile = await this.moduleProfileRepo.findFranchiseProfile(applicantProfileId);
    if (franchiseProfile) {
      const contact = contactFromFranchiseProfile(franchiseProfile);
      if (hasExternalContact(contact)) return contact;
    }
    const profile = await this.profileRepo.findById(applicantProfileId);
    if (!profile) throw new NotFoundError('Profile', applicantProfileId);
    const contact = contactFromProfile(profile);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', applicantProfileId);
    }
    return contact;
  }

  private toSummary(application: MarketplaceApplication): FranchiseApplicationSummary {
    return {
      id: application.id,
      listingId: application.listingId,
      applicantProfileId: application.applicantProfileId,
      status: toFranchiseStatus(application.status),
      coverMessage: application.coverMessage,
      submittedAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      contactedAt: application.contactedAt,
      updatedAt: application.updatedAt,
    };
  }

  private async requireFranchiseApplication(id: ApplicationId): Promise<MarketplaceApplication> {
    const application = await this.applicationRepo.findById(id);
    if (!application || application.moduleKey !== 'franchise') {
      throw new NotFoundError('Application', id);
    }
    return application;
  }

  private async requireFranchiseListing(id: ListingId) {
    const listing = await this.listingRepo.findById(id);
    if (!listing || listing.moduleKey !== 'franchise') {
      throw new ValidationError('Geçersiz franchise ilanı.', { listingId: ['Franchise ilanı bulunamadı.'] });
    }
    return listing;
  }

  private async isListingManager(
    application: MarketplaceApplication,
    profileId: ProfileId,
  ): Promise<boolean> {
    const listing = await this.listingRepo.findById(application.listingId);
    if (!listing) return false;
    const ownerProfile = await this.profileRepo.findById(profileId);
    return Boolean(ownerProfile && listing.ownerId === ownerProfile.userId);
  }

  private async assertListingManager(
    application: MarketplaceApplication,
    profileId: ProfileId,
  ): Promise<void> {
    if (!(await this.isListingManager(application, profileId))) {
      throw new ForbiddenError('Bu başvuruyu yönetme yetkiniz yok.');
    }
  }

  private async assertListingManagerByListing(
    listingId: ListingId,
    profileId: ProfileId,
  ): Promise<void> {
    const listing = await this.requireFranchiseListing(listingId);
    const ownerProfile = await this.profileRepo.findById(profileId);
    if (!ownerProfile || listing.ownerId !== ownerProfile.userId) {
      throw new ForbiddenError('Bu ilanın başvurularını görüntüleme yetkiniz yok.');
    }
  }

  private async assertCanView(
    application: MarketplaceApplication,
    viewerProfileId: ProfileId,
  ): Promise<void> {
    if (application.applicantProfileId === viewerProfileId) return;
    await this.assertListingManager(application, viewerProfileId);
  }
}

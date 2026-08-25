import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '@/lib/domain/errors';
import type {
  ApplicationId,
  ProfileId,
  ListingId,
  UserId,
  PaymentId,
} from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { ApplicationService } from '@/features/matching/services/application.service';
import type { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type {
  EmployerApplicationDetail,
  EmployerApplicationFilter,
  EmployerApplicationStatus,
  EmployerApplicationSummary,
  EmployerApplicationContactResult,
} from '@/features/employers/types/employer-application.types';
import {
  appendNote,
  appendStatusHistory,
  getEmployerMetadata,
  mergeEmployerMetadata,
  toApplicationStatus,
  toEmployerStatus,
} from '@/features/employers/lib/employer-application-metadata';
import {
  contactFromListing,
  contactFromProfile,
  hasExternalContact,
} from '@/features/shared/lib/external-contact';
import { EMPLOYER_TO_APPLICATION_STATUS } from '@/features/employers/types/employer-application.types';
import type {
  AnonymousApplicationView,
  UnlockedApplicationView,
} from '@/features/matching/services/anonymization.service';
import type { CareerCardInput } from '@/features/candidates/components/CareerProfilePreview';

export class EmployerApplicationService {
  constructor(
    private readonly applicationRepo: ApplicationRepository,
    private readonly listingRepo: ListingRepository,
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly applicationService: ApplicationService,
    private readonly paymentService: MarketplacePaymentService,
  ) {}

  /** Candidate applies via candidates module — employer lists anonymous applications */
  async listAnonymousApplications(
    listingId: ListingId,
    managerProfileId: ProfileId,
    filter: Omit<EmployerApplicationFilter, 'listingId'> = {},
  ): Promise<AnonymousApplicationView[]> {
    await this.assertListingManagerByListing(listingId, managerProfileId);
    const applications = await this.findFiltered({ ...filter, listingId });
    return Promise.all(
      applications.map((a) => this.applicationService.getAnonymousView(a.id, managerProfileId)),
    );
  }

  async listApplicationsForListing(
    listingId: ListingId,
    managerProfileId: ProfileId,
    filter: Omit<EmployerApplicationFilter, 'listingId'> = {},
  ): Promise<EmployerApplicationSummary[]> {
    await this.assertListingManagerByListing(listingId, managerProfileId);
    const applications = await this.findFiltered({ ...filter, listingId });
    return applications.map((a) => this.toSummary(a));
  }

  async listApplicationsForApplicant(
    applicantProfileId: ProfileId,
    filter: Omit<EmployerApplicationFilter, 'applicantProfileId'> = {},
  ): Promise<EmployerApplicationSummary[]> {
    const applications = await this.findFiltered({ ...filter, applicantProfileId });
    return applications.map((a) => this.toSummary(a));
  }

  async getApplicationDetail(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<EmployerApplicationDetail> {
    const application = await this.requireEmployerApplication(applicationId);
    await this.assertCanView(application, viewerProfileId);

    const isManager = await this.isListingManager(application, viewerProfileId);
    const listing = await this.listingRepo.findById(application.listingId);
    const meta = getEmployerMetadata(application);

    let anonymousView: AnonymousApplicationView | null = null;
    let unlockedView: UnlockedApplicationView | null = null;

    if (isManager) {
      anonymousView = await this.applicationService.getAnonymousView(applicationId, viewerProfileId);
      try {
        unlockedView = await this.applicationService.getUnlockedView(applicationId, viewerProfileId);
      } catch {
        unlockedView = null;
      }
    }

    return {
      ...this.toSummary(application),
      notes: meta.notes ?? [],
      history: meta.statusHistory ?? [],
      anonymousView,
      unlockedView,
      listing: isManager ? listing : listing,
    };
  }

  async updateApplicationStatus(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    employerStatus: EmployerApplicationStatus,
    note?: string,
  ): Promise<EmployerApplicationSummary> {
    const application = await this.requireEmployerApplication(applicationId);
    await this.assertListingManager(application, managerProfileId);

    const nextStatus = toApplicationStatus(employerStatus);
    let updated = await this.applicationRepo.transitionStatus(applicationId, nextStatus);

    let metadata = mergeEmployerMetadata(updated, {
      statusHistory: appendStatusHistory(updated, employerStatus, managerProfileId),
    });

    if (note) {
      metadata = mergeEmployerMetadata(
        { ...updated, metadata },
        { notes: appendNote({ ...updated, metadata }, managerProfileId, note) },
      );
    }

    const updates: import('@/features/matching/types/application.types').UpdateApplicationInput = { metadata };
    const nowIso = new Date().toISOString();
    if (nextStatus === 'reviewing' && !updated.reviewedAt) {
      updates.reviewedAt = nowIso;
    } else if (nextStatus === 'contacted' && !updated.contactedAt) {
      updates.contactedAt = nowIso;
    } else if (nextStatus === 'unlocked' && !updated.unlockedAt) {
      updates.unlockedAt = nowIso;
    }

    updated = await this.applicationRepo.update(applicationId, updates);
    return this.toSummary(updated);
  }

  async contactCandidate(
    applicationId: ApplicationId,
    actorProfileId: ProfileId,
  ): Promise<EmployerApplicationContactResult> {
    const application = await this.requireEmployerApplication(applicationId);
    const isApplicant = application.applicantProfileId === actorProfileId;

    if (isApplicant) {
      const listing = await this.requireEmployerListing(application.listingId);
      const contact = contactFromListing(listing);
      if (!hasExternalContact(contact)) {
        throw new NotFoundError('ContactInfo', application.listingId);
      }
      const updated = await this.transitionToContacted(application, actorProfileId);
      return { application: this.toSummary(updated), contact };
    }

    await this.assertListingManager(application, actorProfileId);
    const result = await this.applicationService.contact(applicationId, actorProfileId);
    const updated = await this.transitionToContacted(result.application, actorProfileId);
    const contact = await this.resolveCandidateContact(application.applicantProfileId);
    return { application: this.toSummary(updated), contact };
  }

  async addApplicationNote(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    note: string,
  ): Promise<EmployerApplicationSummary> {
    const application = await this.requireEmployerApplication(applicationId);
    await this.assertListingManager(application, managerProfileId);

    const metadata = mergeEmployerMetadata(application, {
      notes: appendNote(application, managerProfileId, note),
    });
    const updated = await this.applicationRepo.update(applicationId, { metadata });
    return this.toSummary(updated);
  }

  async getApplicationHistory(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<EmployerApplicationDetail['history']> {
    const detail = await this.getApplicationDetail(applicationId, viewerProfileId);
    return detail.history;
  }

  async withdrawApplication(
    applicationId: ApplicationId,
    applicantProfileId: ProfileId,
  ): Promise<EmployerApplicationSummary> {
    const application = await this.requireEmployerApplication(applicationId);
    if (application.applicantProfileId !== applicantProfileId) {
      throw new ForbiddenError('Başvuru sahibi değilsiniz.');
    }
    let updated = await this.applicationRepo.transitionStatus(applicationId, 'withdrawn');
    const metadata = mergeEmployerMetadata(updated, {
      statusHistory: appendStatusHistory(updated, 'withdrawn', applicantProfileId),
    });
    updated = await this.applicationRepo.update(applicationId, { metadata });
    return this.toSummary(updated);
  }

  async markReviewing(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
  ): Promise<EmployerApplicationSummary> {
    return this.updateApplicationStatus(applicationId, managerProfileId, 'reviewing');
  }

  reviewApplication(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
  ): Promise<AnonymousApplicationView> {
    return this.applicationService.getAnonymousView(applicationId, managerProfileId);
  }

  async purchaseUnlock(input: {
    userId: UserId;
    applicationId: ApplicationId;
    managerProfileId: ProfileId;
    /** Deprecated client hint — server uses CANDIDATE_UNLOCK_PRICE_CENTS. */
    amountCents?: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    const application = await this.requireEmployerApplication(input.applicationId);
    await this.assertListingManager(application, input.managerProfileId);
    return this.paymentService.createUnlockCheckout({
      userId: input.userId,
      applicationId: input.applicationId,
      amountCents: input.amountCents,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
  }

  async unlockApplication(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    paymentId: PaymentId,
  ): Promise<UnlockedApplicationView> {
    await this.applicationService.unlock(applicationId, managerProfileId, paymentId);
    return this.applicationService.getUnlockedView(applicationId, managerProfileId);
  }

  private async findFiltered(filter: EmployerApplicationFilter): Promise<MarketplaceApplication[]> {
    const appFilter = {
      moduleKey: 'candidates' as const,
      listingId: filter.listingId,
      applicantProfileId: filter.applicantProfileId,
      submittedAfter: filter.submittedAfter,
      submittedBefore: filter.submittedBefore,
      status: filter.status
        ? (Array.isArray(filter.status)
            ? filter.status.map((s) => EMPLOYER_TO_APPLICATION_STATUS[s])
            : EMPLOYER_TO_APPLICATION_STATUS[filter.status])
        : undefined,
    };

    if (filter.listingId) {
      const listing = await this.listingRepo.findById(filter.listingId);
      if (!listing || listing.moduleKey !== 'employers') return [];
    }

    const { data } = await this.applicationRepo.findMany(appFilter, { page: 1, limit: 500 });

    const results: MarketplaceApplication[] = [];
    for (const app of data) {
      const listing = await this.listingRepo.findById(app.listingId);
      if (listing?.moduleKey !== 'employers') continue;
      if (filter.listingId && app.listingId !== filter.listingId) continue;
      results.push(app);
    }
    return results;
  }

  private async transitionToContacted(
    application: MarketplaceApplication,
    actorProfileId: ProfileId,
  ): Promise<MarketplaceApplication> {
    let updated =
      application.status === 'contacted'
        ? application
        : await this.applicationRepo.transitionStatus(application.id, 'contacted');

    if (application.status !== 'contacted') {
      const metadata = mergeEmployerMetadata(updated, {
        statusHistory: appendStatusHistory(updated, 'contacted', actorProfileId),
      });
      const nowIso = new Date().toISOString();
      const updates: import('@/features/matching/types/application.types').UpdateApplicationInput = { metadata };
      if (!updated.contactedAt) {
        updates.contactedAt = nowIso;
      }
      updated = await this.applicationRepo.update(application.id, updates);
    }
    return updated;
  }

  private async resolveCandidateContact(applicantProfileId: ProfileId): Promise<ExternalContactInfo> {
    const profile = await this.profileRepo.findById(applicantProfileId);
    if (!profile) throw new NotFoundError('Profile', applicantProfileId);
    const contact = contactFromProfile(profile);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', applicantProfileId);
    }
    return contact;
  }

  private toSummary(application: MarketplaceApplication): EmployerApplicationSummary {
    const profileSnapshot =
      application.profileSnapshot ??
      (application.metadata?.profileSnapshot as CareerCardInput | undefined) ??
      null;
    const conversationId =
      application.conversationId ??
      (application.metadata?.conversationId as import('@/lib/domain/ids').ConversationId | undefined) ??
      null;

    return {
      id: application.id,
      listingId: application.listingId,
      applicantProfileId: application.applicantProfileId,
      status: toEmployerStatus(application.status),
      coverMessage: application.coverMessage,
      profileSnapshot,
      conversationId,
      submittedAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      contactedAt: application.contactedAt,
      unlockedAt: application.unlockedAt,
      updatedAt: application.updatedAt,
    };
  }

  private async requireEmployerApplication(id: ApplicationId): Promise<MarketplaceApplication> {
    const application = await this.applicationRepo.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    const listing = await this.listingRepo.findById(application.listingId);
    if (!listing || listing.moduleKey !== 'employers') {
      throw new NotFoundError('Application', id);
    }
    return application;
  }

  private async requireEmployerListing(id: ListingId) {
    const listing = await this.listingRepo.findById(id);
    if (!listing || listing.moduleKey !== 'employers') {
      throw new ValidationError('Geçersiz iş ilanı.', { listingId: ['İş ilanı bulunamadı.'] });
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
    const listing = await this.requireEmployerListing(listingId);
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
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '@/lib/domain/errors';
import type { ApplicationId, ProfileId, ListingId, UserId } from '@/lib/domain/ids';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ApplicationService } from '@/features/matching/services/application.service';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type { CareerCardInput } from '@/features/candidates/components/CareerProfilePreview';
import type {
  CandidateApplicationDetail,
  CandidateApplicationFilter,
  CandidateApplicationStatus,
  CandidateApplicationSummary,
  CandidateApplicationContactResult,
} from '@/features/candidates/types/candidate-application.types';
import {
  appendNote,
  appendStatusHistory,
  getCandidateMetadata,
  initialStatusHistory,
  mergeCandidateMetadata,
  toCandidateStatus,
} from '@/features/candidates/lib/candidate-application-metadata';
import {
  contactFromListing,
  hasExternalContact,
} from '@/features/shared/lib/external-contact';
import { CANDIDATE_TO_APPLICATION_STATUS } from '@/features/candidates/types/candidate-application.types';

export interface SubmitApplicationMessagingDeps {
  messagingService?: IMessagingService;
  profileRepo?: ProfileRepository;
  applicantUserId?: UserId;
  employerUserId?: UserId;
  employerEmail?: string;
  applicantName?: string;
  onNotifyEmployer?: (params: {
    to: string;
    applicantName: string;
    positionTitle: string;
    conversationId: string;
    applicationId: string;
  }) => Promise<void> | void;
}

export class CandidateApplicationService {
  constructor(
    private readonly applicationRepo: ApplicationRepository,
    private readonly listingRepo: ListingRepository,
    private readonly applicationService: ApplicationService,
  ) {}

  async submitApplication(
    applicantProfileId: ProfileId,
    listingId: ListingId,
    coverMessage?: string | null,
    initialNote?: string,
    profileSnapshot?: CareerCardInput | null,
    messagingDeps?: SubmitApplicationMessagingDeps,
  ): Promise<CandidateApplicationSummary> {
    const listing = await this.requireEmployerListing(listingId);
    const existing = await this.applicationRepo.findMany({
      moduleKey: 'candidates',
      listingId,
      applicantProfileId,
    });
    if (existing.data.length > 0) {
      throw new ConflictError('Bu ilana zaten başvuru yapılmış.');
    }

    const metadata: Record<string, unknown> = {
      candidate: {
        notes: initialNote
          ? [{ id: crypto.randomUUID(), authorProfileId: applicantProfileId, text: initialNote, createdAt: new Date().toISOString() }]
          : [],
        statusHistory: initialStatusHistory(applicantProfileId),
      },
    };

    if (profileSnapshot) {
      metadata.profileSnapshot = profileSnapshot;
    }

    let application = await this.applicationService.submit({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId,
      coverMessage: coverMessage ?? null,
      profileSnapshot: profileSnapshot ?? null,
      metadata,
    });

    // Start conversation if messaging service & participant IDs are available
    if (messagingDeps?.messagingService && (messagingDeps.applicantUserId || messagingDeps.profileRepo)) {
      try {
        let applicantUserId = messagingDeps.applicantUserId;
        let employerUserId = messagingDeps.employerUserId ?? (listing.ownerId as UserId);

        if (!applicantUserId && messagingDeps.profileRepo) {
          const prof = await messagingDeps.profileRepo.findById(applicantProfileId);
          if (prof) applicantUserId = prof.userId;
        }

        if (applicantUserId && employerUserId) {
          const defaultInitialMsg =
            coverMessage?.trim() ||
            'Merhaba, ilanınız için iş başvurumu ve kariyer profilimi ilettim.';

          const conversation = await messagingDeps.messagingService.startConversation({
            participantIds: [applicantUserId, employerUserId],
            listingId: listing.id,
            applicationId: application.id,
            kind: 'application',
            initialMessage: defaultInitialMsg,
          });

          if (conversation?.id) {
            application = await this.applicationRepo.update(application.id, {
              conversationId: conversation.id,
              metadata: {
                ...application.metadata,
                conversationId: conversation.id,
              },
            });

            // Send transactional email to employer (Zero PII) if callback provided
            if (messagingDeps.employerEmail && messagingDeps.onNotifyEmployer) {
              const applicantName =
                messagingDeps.applicantName ||
                profileSnapshot?.displayName ||
                'Girisimbee Adayı';

              try {
                void messagingDeps.onNotifyEmployer({
                  to: messagingDeps.employerEmail,
                  applicantName,
                  positionTitle: listing.title,
                  conversationId: conversation.id,
                  applicationId: application.id,
                });
              } catch (err) {
                console.error('[application.email.failed]', {
                  applicationId: application.id,
                  conversationId: conversation.id,
                  error: err instanceof Error ? err.message : String(err),
                });
              }
            }
          } else {
            console.error('[conversation.create.failed]', {
              applicationId: application.id,
              listingId: listing.id,
              reason: 'startConversation returned null/empty conversation',
            });
          }
        } else {
          console.error('[conversation.participants.missing]', {
            applicationId: application.id,
            applicantUserId,
            employerUserId,
          });
        }
      } catch (messagingErr) {
        console.error('[conversation.create.failed]', {
          applicationId: application.id,
          listingId: listing.id,
          error: messagingErr instanceof Error ? messagingErr.message : String(messagingErr),
          stack: messagingErr instanceof Error ? messagingErr.stack : undefined,
        });
      }
    }

    return this.toSummary(application);
  }

  async listMyApplications(
    applicantProfileId: ProfileId,
    filter: Omit<CandidateApplicationFilter, 'applicantProfileId'> = {},
  ): Promise<CandidateApplicationSummary[]> {
    const applications = await this.findFiltered({ ...filter, applicantProfileId });
    return applications.map((a) => this.toSummary(a));
  }

  async getApplicationDetail(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<CandidateApplicationDetail> {
    const application = await this.requireCandidateApplication(applicationId);
    if (application.applicantProfileId !== viewerProfileId) {
      throw new ForbiddenError('Bu başvuruyu görüntüleme yetkiniz yok.');
    }

    const listing = await this.listingRepo.findById(application.listingId);
    const meta = getCandidateMetadata(application);

    return {
      ...this.toSummary(application),
      notes: meta.notes ?? [],
      history: meta.statusHistory ?? [],
      listing,
    };
  }

  async withdrawApplication(
    applicationId: ApplicationId,
    applicantProfileId: ProfileId,
  ): Promise<CandidateApplicationSummary> {
    const application = await this.requireCandidateApplication(applicationId);
    if (application.applicantProfileId !== applicantProfileId) {
      throw new ForbiddenError('Başvuru sahibi değilsiniz.');
    }
    let updated = await this.applicationRepo.transitionStatus(applicationId, 'withdrawn');
    const metadata = mergeCandidateMetadata(updated, {
      statusHistory: appendStatusHistory(updated, 'withdrawn', applicantProfileId),
    });
    updated = await this.applicationRepo.update(applicationId, { metadata });
    return this.toSummary(updated);
  }

  async contactEmployer(
    applicationId: ApplicationId,
    applicantProfileId: ProfileId,
  ): Promise<CandidateApplicationContactResult> {
    const application = await this.requireCandidateApplication(applicationId);
    if (application.applicantProfileId !== applicantProfileId) {
      throw new ForbiddenError('Başvuru sahibi değilsiniz.');
    }

    const listing = await this.requireEmployerListing(application.listingId);
    const contact = contactFromListing(listing);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', application.listingId);
    }

    let updated = application;
    if (application.status === 'submitted') {
      updated = await this.applicationRepo.transitionStatus(applicationId, 'reviewing');
    }
    if (updated.status !== 'contacted') {
      updated = await this.applicationRepo.transitionStatus(applicationId, 'contacted');
    }

    if (application.status !== 'contacted') {
      const metadata = mergeCandidateMetadata(updated, {
        statusHistory: appendStatusHistory(updated, 'contacted', applicantProfileId),
      });
      updated = await this.applicationRepo.update(applicationId, { metadata });
    }

    return { application: this.toSummary(updated), contact };
  }

  async addApplicationNote(
    applicationId: ApplicationId,
    applicantProfileId: ProfileId,
    note: string,
  ): Promise<CandidateApplicationSummary> {
    const application = await this.requireCandidateApplication(applicationId);
    if (application.applicantProfileId !== applicantProfileId) {
      throw new ForbiddenError('Başvuru sahibi değilsiniz.');
    }

    const metadata = mergeCandidateMetadata(application, {
      notes: appendNote(application, applicantProfileId, note),
    });
    const updated = await this.applicationRepo.update(applicationId, { metadata });
    return this.toSummary(updated);
  }

  async getApplicationHistory(
    applicationId: ApplicationId,
    viewerProfileId: ProfileId,
  ): Promise<CandidateApplicationDetail['history']> {
    const detail = await this.getApplicationDetail(applicationId, viewerProfileId);
    return detail.history;
  }

  private async findFiltered(filter: CandidateApplicationFilter): Promise<MarketplaceApplication[]> {
    const appFilter = {
      moduleKey: 'candidates' as const,
      listingId: filter.listingId,
      applicantProfileId: filter.applicantProfileId,
      submittedAfter: filter.submittedAfter,
      submittedBefore: filter.submittedBefore,
      status: filter.status
        ? (Array.isArray(filter.status)
            ? filter.status.map((s) => CANDIDATE_TO_APPLICATION_STATUS[s])
            : CANDIDATE_TO_APPLICATION_STATUS[filter.status as CandidateApplicationStatus])
        : undefined,
    };

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

  private toSummary(application: MarketplaceApplication): CandidateApplicationSummary {
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
      status: toCandidateStatus(application.status),
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

  private async requireCandidateApplication(id: ApplicationId): Promise<MarketplaceApplication> {
    const application = await this.applicationRepo.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    if (application.moduleKey !== 'candidates') {
      throw new NotFoundError('Application', id);
    }
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
}

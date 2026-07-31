import type { ProfileId, DocumentId } from '@/lib/domain/ids';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ApplicationService } from '@/features/matching/services/application.service';
import type { DocumentService } from '@/features/documents/services/document.service';
import type { UpsertCandidateProfileInput } from '@/features/profiles/types/candidate-profile.types';
import type { ListingId } from '@/lib/domain/ids';
import { activateModule } from '@/features/shared/lib/module-activation';

export class CandidateService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly applicationService: ApplicationService,
    private readonly documentService: DocumentService,
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
}

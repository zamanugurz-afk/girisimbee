import type {
  AnonymousApplicationSnapshot,
  ExternalContactInfo,
} from '@/lib/domain/marketplace-enums';
import type { CandidateProfile } from '@/features/profiles/types/candidate-profile.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';

export interface AnonymousApplicationView {
  applicationId: MarketplaceApplication['id'];
  status: MarketplaceApplication['status'];
  snapshot: AnonymousApplicationSnapshot;
}

export interface UnlockedApplicationView extends AnonymousApplicationView {
  applicantName: string;
  applicantEmail: string | null;
  applicantPhone: string | null;
  contact: ExternalContactInfo;
}

export class AnonymizationService {
  buildSnapshot(candidate: CandidateProfile, industry?: string | null): AnonymousApplicationSnapshot {
    return {
      city: candidate.city,
      district: candidate.district,
      industry: industry ?? null,
      experienceYears: candidate.experienceYears,
      educationLevel: candidate.educationLevel,
      skills: candidate.languages,
      profileScore: candidate.profileScore,
    };
  }

  toAnonymousView(application: MarketplaceApplication): AnonymousApplicationView {
    return {
      applicationId: application.id,
      status: application.status,
      snapshot: application.anonymousSnapshot,
    };
  }

  toUnlockedView(
    application: MarketplaceApplication,
    candidate: CandidateProfile,
    profile: Profile,
  ): UnlockedApplicationView {
    return {
      ...this.toAnonymousView(application),
      applicantName: profile.displayName,
      applicantEmail: profile.email,
      applicantPhone: profile.phone,
      contact: {
        phone: profile.phone ?? null,
        whatsapp: null,
        email: profile.email ?? null,
        website: profile.website ?? null,
      },
    };
  }

  isUnlocked(application: MarketplaceApplication): boolean {
    return application.unlockedAt !== null || application.status === 'unlocked';
  }
}

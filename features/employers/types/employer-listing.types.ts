import type { Listing } from '@/features/listings/types/listing.entity.types';

/** Job-specific fields stored in listings.customFields JSONB. */
export interface EmployerJobListingDetails {
  remotePolicy?: 'remote' | 'hybrid' | 'onsite' | null;
  experienceYearsMin?: number | null;
  experienceYearsMax?: number | null;
  educationLevel?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
}

/** Input payload for create/update employer job listings. */
export interface EmployerJobListingPayload {
  title: string;
  shortDescription: string;
  longDescription?: string;
  city?: string | null;
  district?: string | null;
  sector?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  contactWebsite?: string | null;
  remotePolicy?: 'remote' | 'hybrid' | 'onsite' | null;
  experienceYearsMin?: number | null;
  experienceYearsMax?: number | null;
  educationLevel?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  primarySector?: string | null;
  desiredRole?: string | null;
  desiredRoleOther?: string | null;
  experienceLevel?: string | null;
  workType?: string | null;
  requiredResponsibilities?: string | null;
  requiredAchievements?: string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  leadershipExperience?: string | null;
  tools?: string | null;
  educationField?: string | null;
  languages?: string | null;
  certificates?: string | null;
  preferredCity?: string | null;
  preferredDistrict?: string | null;
  workplacePreference?: string | null;
  salaryRange?: string | null;
  availability?: string | null;
  positionTitle?: string | null;
  languageTags?: string[] | null;
}

export interface EmployerJobListingFilter {
  city?: string;
  district?: string;
  sector?: string;
  remotePolicy?: 'remote' | 'hybrid' | 'onsite';
}

export interface EmployerJobListingDetailViewModel {
  listing: Listing;
  details: EmployerJobListingDetails;
}

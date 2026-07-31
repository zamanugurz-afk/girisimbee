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

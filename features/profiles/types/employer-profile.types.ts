import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId, CompanyId } from '@/lib/domain/ids';

/** External contact fields for employer profiles */
export interface EmployerProfileContactFields {
  aciklama: string | null;
  telefon: string | null;
  eposta: string | null;
  website: string | null;
  whatsapp: string | null;
}

export interface EmployerProfile extends Timestamps, EmployerProfileContactFields {
  profileId: ProfileId;
  companyId: CompanyId | null;
  companyName: string | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  sehir: string | null;
  ilce: string | null;
  sektor: string | null;
  companySize: string | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertEmployerProfileInput = Partial<
  Omit<EmployerProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };

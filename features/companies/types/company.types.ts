/**
 * Company — organization entity (startup, employer, fund).
 *
 * Purpose: Group listings, represent legal/business identity, enable company pages.
 * Relations: owned by User; has many Listings, Profiles (members).
 * Lifecycle: draft → active ↔ suspended → archived → deleted
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { UserId, CompanyId } from '@/lib/domain/ids';

export type CompanyStatus = 'draft' | 'active' | 'suspended' | 'archived' | 'deleted';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface Company extends Timestamps, SoftDeletable {
  id: CompanyId;
  ownerId: UserId;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  website: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  city: string | null;
  location: string | null;
  country: string;
  industry: string | null;
  employeeCount: CompanySize | null;
  foundedYear: number | null;
  contactEmail: string | null;
  isVerified: boolean;
  websiteVerified: boolean;
  emailVerified: boolean;
  status: CompanyStatus;
  metadata: Record<string, unknown>;
}

export type CreateCompanyInput = Pick<Company, 'ownerId' | 'name' | 'slug'> & {
  description?: string | null;
  website?: string | null;
  linkedInUrl?: string | null;
  twitterUrl?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  city?: string | null;
  location?: string | null;
  country?: string;
  industry?: string | null;
  employeeCount?: CompanySize | null;
  foundedYear?: number | null;
  contactEmail?: string | null;
};

export type UpdateCompanyInput = Partial<
  Omit<Company, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

export interface CompanyFilter {
  ownerId?: UserId;
  status?: CompanyStatus | CompanyStatus[];
  industry?: string;
  city?: string;
  isVerified?: boolean;
  query?: string;
  includeDeleted?: boolean;
}

export const COMPANY_INDEXES: IndexDefinition[] = [
  { name: 'companies_slug_unique', columns: ['slug'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'companies_owner_id_idx', columns: ['owner_id'] },
  { name: 'companies_status_idx', columns: ['status'] },
  { name: 'companies_industry_idx', columns: ['industry'], where: 'industry IS NOT NULL' },
  { name: 'companies_city_idx', columns: ['city'], where: 'city IS NOT NULL' },
  { name: 'companies_name_trgm', columns: ['name'], type: 'gin' },
];

export const COMPANY_LIFECYCLE: Record<CompanyStatus, readonly CompanyStatus[]> = {
  draft: ['active', 'deleted'],
  active: ['suspended', 'archived', 'deleted'],
  suspended: ['active', 'archived', 'deleted'],
  archived: ['active', 'deleted'],
  deleted: [],
};

export const COMPANY_VALIDATION: ValidationRule[] = [
  { field: 'name', rule: 'required|min:2|max:200', message: 'Şirket adı 2–200 karakter olmalı.' },
  { field: 'slug', rule: 'required|slug|max:120', message: 'Geçerli bir slug girin.' },
  { field: 'website', rule: 'nullable|url', message: 'Geçerli bir website URL girin.' },
  { field: 'foundedYear', rule: 'nullable|integer|min:1900|max:current_year', message: 'Geçerli kuruluş yılı.' },
];

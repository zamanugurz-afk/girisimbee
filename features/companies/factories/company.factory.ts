import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable, slugify } from '@/lib/domain/factory';
import type { Company, CreateCompanyInput } from '@/features/companies/types/company.types';

export function createCompany(overrides: Partial<Company> & Pick<Company, 'ownerId' | 'name'>): Company {
  const ts = timestamps(overrides.createdAt);
  const slug = overrides.slug ?? slugify(overrides.name);
  return {
    id: overrides.id ?? ids.company(crypto.randomUUID()),
    ownerId: overrides.ownerId,
    name: overrides.name,
    slug,
    logoUrl: overrides.logoUrl ?? null,
    coverUrl: overrides.coverUrl ?? null,
    description: overrides.description ?? null,
    website: overrides.website ?? null,
    linkedInUrl: overrides.linkedInUrl ?? null,
    twitterUrl: overrides.twitterUrl ?? null,
    city: overrides.city ?? null,
    location: overrides.location ?? null,
    country: overrides.country ?? 'TR',
    industry: overrides.industry ?? null,
    employeeCount: overrides.employeeCount ?? null,
    foundedYear: overrides.foundedYear ?? null,
    contactEmail: overrides.contactEmail ?? null,
    isVerified: overrides.isVerified ?? false,
    websiteVerified: overrides.websiteVerified ?? false,
    emailVerified: overrides.emailVerified ?? false,
    status: overrides.status ?? 'draft',
    metadata: overrides.metadata ?? {},
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createCompanyInput(overrides: Partial<CreateCompanyInput> = {}): CreateCompanyInput {
  const name = overrides.name ?? 'Test Şirketi';
  return {
    ownerId: overrides.ownerId ?? ids.user(crypto.randomUUID()),
    name,
    slug: overrides.slug ?? slugify(name),
    description: overrides.description,
    website: overrides.website,
    city: overrides.city,
    industry: overrides.industry,
  };
}

/**
 * Supabase company repository — marketplace_companies.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { CompanyId, UserId } from '@/lib/domain/ids';
import type { Company, CreateCompanyInput, UpdateCompanyInput, CompanyFilter, CompanyStatus } from '@/features/companies/types/company.types';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import { COMPANY_LIFECYCLE } from '@/features/companies/types/company.types';
import { createCompany } from '@/features/companies/factories/company.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';

const TABLE = 'marketplace_companies';

interface CompanyRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  city: string | null;
  location: string | null;
  country: string;
  industry: string | null;
  employee_count: string | null;
  founded_year: number | null;
  contact_email: string | null;
  is_verified: boolean;
  website_verified: boolean;
  email_verified: boolean;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapCompanyRow(row: CompanyRow): Company {
  return {
    id: row.id as CompanyId,
    ownerId: row.owner_id as UserId,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    coverUrl: row.cover_url,
    description: row.description,
    website: row.website,
    linkedInUrl: row.linkedin_url,
    twitterUrl: row.twitter_url,
    city: row.city,
    location: row.location,
    country: row.country,
    industry: row.industry,
    employeeCount: row.employee_count as Company['employeeCount'],
    foundedYear: row.founded_year,
    contactEmail: row.contact_email,
    isVerified: row.is_verified,
    websiteVerified: row.website_verified,
    emailVerified: row.email_verified,
    status: row.status as Company['status'],
    metadata: row.metadata ?? {},
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export class SupabaseCompanyRepository implements CompanyRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: CompanyId, filter?: RepositoryFilter): Promise<Company | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapCompanyRow(data as CompanyRow) : null;
  }

  async findByIds(ids: CompanyId[]): Promise<Company[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .in('id', ids)
      .is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map((row) => mapCompanyRow(row as CompanyRow));
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const normalized = slug.trim().toLowerCase();
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('slug', normalized).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapCompanyRow(data as CompanyRow) : null;
  }

  async isSlugTaken(slug: string, excludeCompanyId?: CompanyId): Promise<boolean> {
    const normalized = slug.trim().toLowerCase();
    let query = this.supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('slug', normalized)
      .is('deleted_at', null);
    if (excludeCompanyId) query = query.neq('id', excludeCompanyId);
    const { count, error } = await query;
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async findByOwnerId(ownerId: UserId): Promise<Company[]> {
    const { data } = await this.findMany({ ownerId }, { page: 1, limit: 100 });
    return data;
  }

  async findMany(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.ownerId) query = query.eq('owner_id', filter.ownerId);
    if (filter.industry) query = query.eq('industry', filter.industry);
    if (filter.city) query = query.eq('city', filter.city);
    if (filter.isVerified !== undefined) query = query.eq('is_verified', filter.isVerified);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    if (filter.query) query = query.ilike('name', `%${filter.query}%`);
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapCompanyRow(r as CompanyRow)), count ?? 0, page, limit);
  }

  async paginate(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: CompanyFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: CompanyId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateCompanyInput): Promise<Company> {
    const company = createCompany(input);
    const { data, error } = await this.supabase.from(TABLE).insert({
      id: company.id,
      owner_id: company.ownerId,
      name: company.name,
      slug: company.slug.toLowerCase(),
      logo_url: company.logoUrl,
      cover_url: company.coverUrl,
      description: company.description,
      website: company.website,
      linkedin_url: company.linkedInUrl,
      twitter_url: company.twitterUrl,
      city: company.city,
      location: company.location,
      country: company.country,
      industry: company.industry,
      employee_count: company.employeeCount,
      founded_year: company.foundedYear,
      contact_email: company.contactEmail,
      status: company.status,
      metadata: company.metadata,
    }).select('*').single();
    if (error) throw error;
    return mapCompanyRow(data as CompanyRow);
  }

  async update(id: CompanyId, input: UpdateCompanyInput): Promise<Company> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.name !== undefined) row.name = input.name;
    if (input.slug !== undefined) row.slug = input.slug.toLowerCase();
    if (input.logoUrl !== undefined) row.logo_url = input.logoUrl;
    if (input.coverUrl !== undefined) row.cover_url = input.coverUrl;
    if (input.description !== undefined) row.description = input.description;
    if (input.website !== undefined) row.website = input.website;
    if (input.linkedInUrl !== undefined) row.linkedin_url = input.linkedInUrl;
    if (input.twitterUrl !== undefined) row.twitter_url = input.twitterUrl;
    if (input.city !== undefined) row.city = input.city;
    if (input.location !== undefined) row.location = input.location;
    if (input.country !== undefined) row.country = input.country;
    if (input.industry !== undefined) row.industry = input.industry;
    if (input.employeeCount !== undefined) row.employee_count = input.employeeCount;
    if (input.foundedYear !== undefined) row.founded_year = input.foundedYear;
    if (input.contactEmail !== undefined) row.contact_email = input.contactEmail;
    if (input.isVerified !== undefined) row.is_verified = input.isVerified;
    if (input.websiteVerified !== undefined) row.website_verified = input.websiteVerified;
    if (input.emailVerified !== undefined) row.email_verified = input.emailVerified;
    if (input.status !== undefined) row.status = input.status;
    if (input.metadata !== undefined) row.metadata = input.metadata;
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Company', id);
    return mapCompanyRow(data as CompanyRow);
  }

  async softDelete(id: CompanyId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
    const { error } = await this.supabase.from(TABLE).update({ deleted_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: CompanyId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: CompanyId): Promise<Company> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: null, status: 'draft', updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Company', id);
    return mapCompanyRow(data as CompanyRow);
  }

  async transitionStatus(id: CompanyId, to: CompanyStatus): Promise<Company> {
    const company = await this.findById(id, { includeDeleted: true });
    if (!company) throw new NotFoundError('Company', id);
    if (!canTransition(COMPANY_LIFECYCLE, company.status, to)) {
      throw new InvalidTransitionError(company.status, to);
    }
    return this.update(id, { status: to });
  }
}

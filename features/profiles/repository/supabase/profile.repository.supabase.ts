/**
 * Supabase profile repository — marketplace_profiles.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { ProfileId, UserId } from '@/lib/domain/ids';
import type { Profile, CreateProfileInput, UpdateProfileInput, ProfileFilter, ProfileStatus } from '@/features/profiles/types/profile.types';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import { PROFILE_LIFECYCLE } from '@/features/profiles/types/profile.types';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';

const TABLE = 'marketplace_profiles';

interface ProfileRow {
  id: string;
  user_id: string;
  company_id: string | null;
  username: string | null;
  display_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  city: string | null;
  country: string;
  company_name: string | null;
  position: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  phone: string | null;
  email: string | null;
  email_visible: boolean;
  phone_visible: boolean;
  website_visible: boolean;
  skills: string[];
  intents: string[];
  visibility: string;
  status: string;
  is_verified: boolean;
  investor_verified: boolean;
  completeness_score: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id as ProfileId,
    userId: row.user_id as UserId,
    companyId: row.company_id as Profile['companyId'],
    username: row.username,
    displayName: row.display_name,
    headline: row.headline,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    coverUrl: row.cover_url,
    location: row.location,
    city: row.city,
    country: row.country,
    companyName: row.company_name,
    position: row.position,
    website: row.website,
    linkedInUrl: row.linkedin_url,
    twitterUrl: row.twitter_url,
    phone: row.phone,
    email: row.email,
    emailVisible: row.email_visible,
    phoneVisible: row.phone_visible,
    websiteVisible: row.website_visible,
    skills: row.skills ?? [],
    intents: row.intents as Profile['intents'],
    visibility: row.visibility as Profile['visibility'],
    status: row.status as Profile['status'],
    isVerified: row.is_verified,
    investorVerified: row.investor_verified ?? false,
    completenessScore: row.completeness_score,
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

function toProfileInsert(profile: Profile): Record<string, unknown> {
  return {
    id: profile.id,
    user_id: profile.userId,
    company_id: profile.companyId,
    username: profile.username,
    display_name: profile.displayName,
    headline: profile.headline,
    bio: profile.bio,
    avatar_url: profile.avatarUrl,
    cover_url: profile.coverUrl,
    location: profile.location,
    city: profile.city,
    country: profile.country,
    company_name: profile.companyName,
    position: profile.position,
    website: profile.website,
    linkedin_url: profile.linkedInUrl,
    twitter_url: profile.twitterUrl,
    phone: profile.phone,
    email: profile.email,
    email_visible: profile.emailVisible,
    phone_visible: profile.phoneVisible,
    website_visible: profile.websiteVisible,
    skills: profile.skills,
    intents: profile.intents,
    visibility: profile.visibility,
    status: profile.status,
    is_verified: profile.isVerified,
    investor_verified: profile.investorVerified,
    completeness_score: profile.completenessScore,
  };
}

function toProfileUpdate(input: UpdateProfileInput): Record<string, unknown> {
  const row: Record<string, unknown> = { updated_at: now() };
  if (input.companyId !== undefined) row.company_id = input.companyId;
  if (input.username !== undefined) row.username = input.username;
  if (input.displayName !== undefined) row.display_name = input.displayName;
  if (input.headline !== undefined) row.headline = input.headline;
  if (input.bio !== undefined) row.bio = input.bio;
  if (input.avatarUrl !== undefined) row.avatar_url = input.avatarUrl;
  if (input.coverUrl !== undefined) row.cover_url = input.coverUrl;
  if (input.location !== undefined) row.location = input.location;
  if (input.city !== undefined) row.city = input.city;
  if (input.country !== undefined) row.country = input.country;
  if (input.companyName !== undefined) row.company_name = input.companyName;
  if (input.position !== undefined) row.position = input.position;
  if (input.website !== undefined) row.website = input.website;
  if (input.linkedInUrl !== undefined) row.linkedin_url = input.linkedInUrl;
  if (input.twitterUrl !== undefined) row.twitter_url = input.twitterUrl;
  if (input.phone !== undefined) row.phone = input.phone;
  if (input.email !== undefined) row.email = input.email;
  if (input.emailVisible !== undefined) row.email_visible = input.emailVisible;
  if (input.phoneVisible !== undefined) row.phone_visible = input.phoneVisible;
  if (input.websiteVisible !== undefined) row.website_visible = input.websiteVisible;
  if (input.skills !== undefined) row.skills = input.skills;
  if (input.intents !== undefined) row.intents = input.intents;
  if (input.visibility !== undefined) row.visibility = input.visibility;
  if (input.status !== undefined) row.status = input.status;
  if (input.isVerified !== undefined) row.is_verified = input.isVerified;
  if (input.investorVerified !== undefined) row.investor_verified = input.investorVerified;
  return row;
}

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: ProfileId, filter?: RepositoryFilter): Promise<Profile | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapProfileRow(data as ProfileRow) : null;
  }

  async findByUserId(userId: UserId): Promise<Profile | null> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('user_id', userId).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapProfileRow(data as ProfileRow) : null;
  }

  async findByUserIds(userIds: UserId[]): Promise<Profile[]> {
    if (userIds.length === 0) return [];
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .in('user_id', userIds)
      .is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map((row) => mapProfileRow(row as ProfileRow));
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const normalized = username.trim().toLowerCase();
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('username', normalized)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProfileRow(data as ProfileRow) : null;
  }

  async isUsernameTaken(username: string, excludeProfileId?: ProfileId): Promise<boolean> {
    const normalized = username.trim().toLowerCase();
    let query = this.supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('username', normalized)
      .is('deleted_at', null);
    if (excludeProfileId) query = query.neq('id', excludeProfileId);
    const { count, error } = await query;
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async findMany(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.username) query = query.eq('username', filter.username.trim().toLowerCase());
    if (filter.companyId) query = query.eq('company_id', filter.companyId);
    if (filter.isVerified !== undefined) query = query.eq('is_verified', filter.isVerified);
    if (filter.city) query = query.eq('city', filter.city);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    if (filter.query) query = query.ilike('display_name', `%${filter.query}%`);
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapProfileRow(r as ProfileRow)), count ?? 0, page, limit);
  }

  async paginate(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: ProfileFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: ProfileId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    const profile = createProfile(input);
    const { data, error } = await this.supabase.from(TABLE).insert(toProfileInsert(profile)).select('*').single();
    if (error) throw error;
    return mapProfileRow(data as ProfileRow);
  }

  async update(id: ProfileId, input: UpdateProfileInput): Promise<Profile> {
    const { data, error } = await this.supabase.from(TABLE).update(toProfileUpdate(input)).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Profile', id);
    return mapProfileRow(data as ProfileRow);
  }

  async softDelete(id: ProfileId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
    const { error } = await this.supabase.from(TABLE).update({ deleted_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: ProfileId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ProfileId): Promise<Profile> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: null, status: 'draft', updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Profile', id);
    return mapProfileRow(data as ProfileRow);
  }

  async updateCompletenessScore(id: ProfileId): Promise<Profile> {
    const profile = await this.findById(id);
    if (!profile) throw new NotFoundError('Profile', id);
    let score = 20;
    if (profile.username) score += 10;
    if (profile.headline) score += 10;
    if (profile.bio) score += 15;
    if (profile.avatarUrl) score += 15;
    if (profile.coverUrl) score += 10;
    if (profile.city) score += 5;
    if (profile.companyName || profile.position) score += 10;
    if (profile.website) score += 5;
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ completeness_score: Math.min(score, 100), updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapProfileRow(data as ProfileRow);
  }

  async transitionStatus(id: ProfileId, to: ProfileStatus): Promise<Profile> {
    const profile = await this.findById(id, { includeDeleted: true });
    if (!profile) throw new NotFoundError('Profile', id);
    if (!canTransition(PROFILE_LIFECYCLE, profile.status, to)) {
      throw new InvalidTransitionError(profile.status, to);
    }
    return this.update(id, { status: to });
  }
}

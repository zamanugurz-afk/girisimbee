/**
 * Profile — public professional identity.
 *
 * Purpose: Display user expertise, intent, and trust signals on the marketplace.
 * Relations: belongs to User; optional link to Company.
 * Lifecycle: draft → published ↔ hidden → archived
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { UserId, ProfileId, CompanyId } from '@/lib/domain/ids';

export type ProfileVisibility = 'public' | 'connections' | 'private';
export type ProfileStatus = 'draft' | 'published' | 'hidden' | 'archived' | 'deleted';

export type ProfileIntent =
  | 'seeking_investment'
  | 'investing'
  | 'seeking_job'
  | 'hiring'
  | 'seeking_partner'
  | 'open';

export interface Profile extends Timestamps, SoftDeletable {
  id: ProfileId;
  userId: UserId;
  companyId: CompanyId | null;
  username: string | null;
  displayName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  location: string | null;
  city: string | null;
  country: string;
  companyName: string | null;
  position: string | null;
  website: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  phone: string | null;
  email: string | null;
  emailVisible: boolean;
  phoneVisible: boolean;
  websiteVisible: boolean;
  skills: string[];
  intents: ProfileIntent[];
  visibility: ProfileVisibility;
  status: ProfileStatus;
  isVerified: boolean;
  investorVerified: boolean;
  completenessScore: number;
}

export type CreateProfileInput = Pick<Profile, 'userId' | 'displayName'> & {
  username?: string | null;
  headline?: string | null;
  companyId?: CompanyId | null;
  email?: string | null;
  intents?: ProfileIntent[];
};

export type UpdateProfileInput = Partial<
  Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'completenessScore'>
>;

export interface ProfileFilter {
  userId?: UserId;
  username?: string;
  companyId?: CompanyId;
  status?: ProfileStatus | ProfileStatus[];
  intents?: ProfileIntent[];
  isVerified?: boolean;
  city?: string;
  query?: string;
  includeDeleted?: boolean;
}

export const PROFILE_INDEXES: IndexDefinition[] = [
  { name: 'profiles_user_id_unique', columns: ['user_id'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'profiles_username_unique', columns: ['username'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'profiles_company_id_idx', columns: ['company_id'], where: 'company_id IS NOT NULL' },
  { name: 'profiles_status_idx', columns: ['status'] },
  { name: 'profiles_city_idx', columns: ['city'], where: 'city IS NOT NULL' },
  { name: 'profiles_intents_gin', columns: ['intents'], type: 'gin' },
  { name: 'profiles_display_name_trgm', columns: ['display_name'], type: 'gin' },
];

export const PROFILE_LIFECYCLE: Record<ProfileStatus, readonly ProfileStatus[]> = {
  draft: ['published', 'deleted'],
  published: ['hidden', 'archived', 'deleted'],
  hidden: ['published', 'archived', 'deleted'],
  archived: ['published', 'deleted'],
  deleted: [],
};

export const PROFILE_VALIDATION: ValidationRule[] = [
  { field: 'displayName', rule: 'required|min:2|max:100', message: 'Görünen ad 2–100 karakter olmalı.' },
  { field: 'username', rule: 'required|slug|min:3|max:30', message: 'Kullanıcı adı 3–30 karakter, küçük harf/rakam/tire.' },
  { field: 'headline', rule: 'nullable|max:160', message: 'Başlık en fazla 160 karakter.' },
  { field: 'bio', rule: 'nullable|max:2000', message: 'Biyografi en fazla 2000 karakter.' },
  { field: 'skills', rule: 'array|max:30', message: 'En fazla 30 yetenek eklenebilir.' },
];

import type { UserId, CompanyId } from '@/lib/domain/ids';
import type { Company } from '@/features/companies/types/company.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';

export type CompanyMemberRole = 'owner' | 'member';

export interface CompanyMember {
  id: string;
  companyId: CompanyId;
  userId: UserId;
  role: CompanyMemberRole;
  createdAt: string;
}

export interface CompanyMemberView {
  member: CompanyMember;
  profile: Profile | null;
}

export interface PublicCompanyView {
  company: Company;
  members: CompanyMemberView[];
  listings: Listing[];
  followersCount: number;
  isOwner: boolean;
  isMember: boolean;
  isFollowing: boolean;
}

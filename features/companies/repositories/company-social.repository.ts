import type { CompanyId, UserId } from '@/lib/domain/ids';
import type { CompanyMember, CompanyMemberRole } from '@/features/companies/types/company-public.types';

export interface CompanyMemberRepository {
  addMember(companyId: CompanyId, userId: UserId, role?: CompanyMemberRole): Promise<CompanyMember>;
  removeMember(companyId: CompanyId, userId: UserId): Promise<void>;
  findByCompanyId(companyId: CompanyId): Promise<CompanyMember[]>;
  isMember(companyId: CompanyId, userId: UserId): Promise<boolean>;
  getRole(companyId: CompanyId, userId: UserId): Promise<CompanyMemberRole | null>;
}

export interface CompanyFollowRepository {
  follow(followerId: UserId, companyId: CompanyId): Promise<void>;
  unfollow(followerId: UserId, companyId: CompanyId): Promise<void>;
  isFollowing(followerId: UserId, companyId: CompanyId): Promise<boolean>;
  countByCompanyId(companyId: CompanyId): Promise<number>;
}

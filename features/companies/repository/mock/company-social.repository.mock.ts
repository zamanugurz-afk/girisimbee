import type { CompanyId, UserId } from '@/lib/domain/ids';
import type { CompanyMember, CompanyMemberRole } from '@/features/companies/types/company-public.types';
import type { CompanyMemberRepository, CompanyFollowRepository } from '@/features/companies/repositories/company-social.repository';

export class MockCompanyMemberRepository implements CompanyMemberRepository {
  private members = new Map<string, CompanyMember>();

  private key(companyId: CompanyId, userId: UserId): string {
    return `${companyId}:${userId}`;
  }

  async addMember(companyId: CompanyId, userId: UserId, role: CompanyMemberRole = 'member'): Promise<CompanyMember> {
    const id = this.key(companyId, userId);
    const member: CompanyMember = {
      id: crypto.randomUUID(),
      companyId,
      userId,
      role,
      createdAt: new Date().toISOString(),
    };
    this.members.set(id, member);
    return member;
  }

  async removeMember(companyId: CompanyId, userId: UserId): Promise<void> {
    const member = this.members.get(this.key(companyId, userId));
    if (member?.role === 'owner') return;
    this.members.delete(this.key(companyId, userId));
  }

  async findByCompanyId(companyId: CompanyId): Promise<CompanyMember[]> {
    return [...this.members.values()].filter((m) => m.companyId === companyId);
  }

  async isMember(companyId: CompanyId, userId: UserId): Promise<boolean> {
    return this.members.has(this.key(companyId, userId));
  }

  async getRole(companyId: CompanyId, userId: UserId): Promise<CompanyMemberRole | null> {
    return this.members.get(this.key(companyId, userId))?.role ?? null;
  }
}

export class MockCompanyFollowRepository implements CompanyFollowRepository {
  private follows = new Set<string>();

  private key(followerId: UserId, companyId: CompanyId): string {
    return `${followerId}:${companyId}`;
  }

  async follow(followerId: UserId, companyId: CompanyId): Promise<void> {
    this.follows.add(this.key(followerId, companyId));
  }

  async unfollow(followerId: UserId, companyId: CompanyId): Promise<void> {
    this.follows.delete(this.key(followerId, companyId));
  }

  async isFollowing(followerId: UserId, companyId: CompanyId): Promise<boolean> {
    return this.follows.has(this.key(followerId, companyId));
  }

  async countByCompanyId(companyId: CompanyId): Promise<number> {
    return [...this.follows].filter((k) => k.endsWith(`:${companyId}`)).length;
  }
}

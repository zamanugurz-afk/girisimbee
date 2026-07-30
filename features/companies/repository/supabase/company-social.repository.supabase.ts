import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyId, UserId } from '@/lib/domain/ids';
import type { CompanyMember, CompanyMemberRole } from '@/features/companies/types/company-public.types';
import type { CompanyMemberRepository, CompanyFollowRepository } from '@/features/companies/repositories/company-social.repository';

const MEMBERS = 'marketplace_company_members';
const FOLLOWS = 'marketplace_company_follows';

function mapMember(row: Record<string, unknown>): CompanyMember {
  return {
    id: row.id as string,
    companyId: row.company_id as CompanyId,
    userId: row.user_id as UserId,
    role: row.role as CompanyMemberRole,
    createdAt: row.created_at as string,
  };
}

export class SupabaseCompanyMemberRepository implements CompanyMemberRepository {
  constructor(private supabase: SupabaseClient) {}

  async addMember(companyId: CompanyId, userId: UserId, role: CompanyMemberRole = 'member'): Promise<CompanyMember> {
    const { data, error } = await this.supabase
      .from(MEMBERS)
      .insert({ company_id: companyId, user_id: userId, role })
      .select('*')
      .single();
    if (error && error.code !== '23505') throw error;
    if (data) return mapMember(data);
    const existing = await this.getRole(companyId, userId);
    if (!existing) throw error;
    return {
      id: crypto.randomUUID(),
      companyId,
      userId,
      role: existing,
      createdAt: new Date().toISOString(),
    };
  }

  async removeMember(companyId: CompanyId, userId: UserId): Promise<void> {
    const { error } = await this.supabase
      .from(MEMBERS)
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .neq('role', 'owner');
    if (error) throw error;
  }

  async findByCompanyId(companyId: CompanyId): Promise<CompanyMember[]> {
    const { data, error } = await this.supabase.from(MEMBERS).select('*').eq('company_id', companyId);
    if (error) throw error;
    return (data ?? []).map(mapMember);
  }

  async isMember(companyId: CompanyId, userId: UserId): Promise<boolean> {
    const role = await this.getRole(companyId, userId);
    return role !== null;
  }

  async getRole(companyId: CompanyId, userId: UserId): Promise<CompanyMemberRole | null> {
    const { data, error } = await this.supabase
      .from(MEMBERS)
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return (data?.role as CompanyMemberRole) ?? null;
  }
}

export class SupabaseCompanyFollowRepository implements CompanyFollowRepository {
  constructor(private supabase: SupabaseClient) {}

  async follow(followerId: UserId, companyId: CompanyId): Promise<void> {
    const { error } = await this.supabase.from(FOLLOWS).insert({
      follower_id: followerId,
      company_id: companyId,
    });
    if (error && error.code !== '23505') throw error;
  }

  async unfollow(followerId: UserId, companyId: CompanyId): Promise<void> {
    const { error } = await this.supabase
      .from(FOLLOWS)
      .delete()
      .eq('follower_id', followerId)
      .eq('company_id', companyId);
    if (error) throw error;
  }

  async isFollowing(followerId: UserId, companyId: CompanyId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(FOLLOWS)
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', followerId)
      .eq('company_id', companyId);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async countByCompanyId(companyId: CompanyId): Promise<number> {
    const { count, error } = await this.supabase
      .from(FOLLOWS)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    if (error) throw error;
    return count ?? 0;
  }
}

import type { CompanyId, UserId } from '@/lib/domain/ids';
import type { Company, CreateCompanyInput, UpdateCompanyInput, CompanyFilter } from '@/features/companies/types/company.types';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface ICompanyService {
  create(input: CreateCompanyInput): Promise<Company>;
  getById(id: CompanyId): Promise<Company | null>;
  getBySlug(slug: string): Promise<Company | null>;
  listByOwner(ownerId: UserId): Promise<Company[]>;
  listForUser(userId: UserId): Promise<Company[]>;
  isSlugAvailable(slug: string, excludeCompanyId?: CompanyId): Promise<boolean>;
  update(id: CompanyId, actorId: UserId, input: UpdateCompanyInput): Promise<Company>;
  activate(id: CompanyId): Promise<Company>;
  suspend(id: CompanyId): Promise<Company>;
  search(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>>;
  delete(id: CompanyId, actorId: UserId): Promise<void>;
  inviteMember(companyId: CompanyId, actorId: UserId, username: string): Promise<void>;
  leaveCompany(companyId: CompanyId, userId: UserId): Promise<void>;
  follow(companyId: CompanyId, userId: UserId): Promise<void>;
  unfollow(companyId: CompanyId, userId: UserId): Promise<void>;
  getPublicView(slug: string, viewerId?: UserId): Promise<PublicCompanyView | null>;
  assertCanManage(companyId: CompanyId, userId: UserId): Promise<void>;
}

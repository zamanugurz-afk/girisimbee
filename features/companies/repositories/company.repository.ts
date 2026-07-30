import type { Repository } from '@/lib/domain/repository';
import type { CompanyId } from '@/lib/domain/ids';
import type { Company, CreateCompanyInput, UpdateCompanyInput, CompanyFilter } from '@/features/companies/types/company.types';

export interface CompanyRepository
  extends Repository<Company, CompanyId, CreateCompanyInput, UpdateCompanyInput, CompanyFilter> {
  findByIds(ids: CompanyId[]): Promise<Company[]>;
  findBySlug(slug: string): Promise<Company | null>;
  findByOwnerId(ownerId: Company['ownerId']): Promise<Company[]>;
  isSlugTaken(slug: string, excludeCompanyId?: CompanyId): Promise<boolean>;
  transitionStatus(id: CompanyId, status: Company['status']): Promise<Company>;
}

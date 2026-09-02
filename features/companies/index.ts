// Feature: companies — domain layer
export type {
  Company,
  CompanyStatus,
  CompanySize,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilter,
} from '@/features/companies/types/company.types';
export { COMPANY_INDEXES, COMPANY_LIFECYCLE, COMPANY_VALIDATION } from '@/features/companies/types/company.types';

export type { CompanyRepository } from '@/features/companies/repositories/company.repository';
export type { ICompanyService } from '@/features/companies/services/company.service.interface';
export { CompanyService } from '@/features/companies/services/company.service';
export { getCompanyService } from '@/lib/persistence/container';
export * from '@/features/companies/repository';

export { companySchema, createCompanySchema } from '@/features/companies/validation/company.schema';
export { createCompany, createCompanyInput } from '@/features/companies/factories/company.factory';
export { generateMockCompany, generateMockCompanies } from '@/features/companies/mock/company.generator';
export { ActiveCompanyProvider, useActiveCompany } from '@/features/companies/context/active-company-context';

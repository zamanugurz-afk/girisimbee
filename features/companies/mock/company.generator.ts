import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter, pickCity, pickIndustry } from '@/lib/domain/mock-utils';
import { createCompany } from '@/features/companies/factories/company.factory';
import type { Company } from '@/features/companies/types/company.types';
import type { UserId } from '@/lib/domain/ids';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;

export function generateMockCompany(index = 1, ownerId?: UserId): Company {
  const name = `${pickIndustry(index)} Girişimi ${index}`;
  return createCompany({
    id: ids.company(mockUuid('c0000001')),
    ownerId: ownerId ?? ids.user(mockUuid('a0000001')),
    name,
    slug: `girisim-${index}`,
    description: `${name} — Türkiye'nin önde gelen ${pickIndustry(index).toLowerCase()} girişimlerinden.`,
    city: pickCity(index),
    industry: pickIndustry(index),
    employeeCount: SIZES[index % SIZES.length],
    foundedYear: 2015 + (index % 10),
    isVerified: index % 3 === 0,
    status: 'active',
  });
}

export function generateMockCompanies(count: number, ownerId?: UserId): Company[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockCompany(i + 1, ownerId));
}

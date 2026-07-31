import { describe, it, expect, beforeEach } from 'vitest';
import { MockCandidatePackageRepository } from '@/features/candidates/repository/mock/candidate-package.repository.mock';
import { ids } from '@/lib/domain/ids';

describe('MockCandidatePackageRepository', () => {
  let repo: MockCandidatePackageRepository;

  beforeEach(() => {
    repo = new MockCandidatePackageRepository();
  });

  it('lists 4 candidate packages', async () => {
    const catalog = await repo.listCatalog();
    expect(catalog).toHaveLength(4);
    expect(catalog.map((p) => p.slug)).toEqual(['standard', 'professional', 'featured', 'urgent']);
  });

  it('grants entitlement on package grant', async () => {
    const userId = ids.user('u0000001-0001-4000-8000-000000000099');
    const entitlement = await repo.grant({ userId, packageSlug: 'standard' });
    expect(entitlement.status).toBe('active');
    expect(entitlement.packageSlug).toBe('standard');
  });

  it('finds active coupon', async () => {
    const coupon = await repo.findCoupon('CANDIDATE10');
    expect(coupon?.discountPercent).toBe(10);
  });
});

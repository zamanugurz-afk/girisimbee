import { describe, it, expect } from 'vitest';
import { MockInvestorPackageRepository } from '@/features/investors/repository/mock/investor-package.repository.mock';
import { ids } from '@/lib/domain/ids';
import { TEST_USER } from '@/lib/testing/ecosystem-test-fixtures';

describe('MockInvestorPackageRepository', () => {
  const repo = new MockInvestorPackageRepository();

  it('lists catalog with 4 packages', async () => {
    const catalog = await repo.listCatalog();
    expect(catalog).toHaveLength(4);
  });

  it('grants package entitlement', async () => {
    const entitlement = await repo.grant({
      userId: TEST_USER,
      packageSlug: 'standard',
    });
    expect(entitlement.packageSlug).toBe('standard');
    expect(entitlement.status).toBe('active');
  });

  it('finds coupon by code', async () => {
    const coupon = await repo.findCoupon('INVESTOR10');
    expect(coupon?.discountPercent).toBe(10);
  });

  it('updates entitlement status', async () => {
    const entitlement = await repo.grant({
      userId: ids.user('u0000001-0001-4000-8000-000000000099'),
      packageSlug: 'professional',
    });
    const suspended = await repo.updateStatus(entitlement.id, 'suspended');
    expect(suspended.status).toBe('suspended');
  });
});

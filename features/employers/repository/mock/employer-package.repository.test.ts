import { describe, it, expect } from 'vitest';
import { MockEmployerPackageRepository } from '@/features/employers/repository/mock/employer-package.repository.mock';
import { TEST_USER } from '@/lib/testing/ecosystem-test-fixtures';

describe('MockEmployerPackageRepository', () => {
  const repo = new MockEmployerPackageRepository();

  it('lists catalog with 4 packages', async () => {
    const catalog = await repo.listCatalog();
    expect(catalog.length).toBe(4);
  });

  it('grants entitlement to user', async () => {
    const entitlement = await repo.grant({
      userId: TEST_USER,
      packageSlug: 'standard',
    });
    expect(entitlement.status).toBe('active');
    expect(entitlement.packageSlug).toBe('standard');
  });

  it('finds active coupon', async () => {
    const coupon = await repo.findCoupon('EMPLOYER10');
    expect(coupon?.discountPercent).toBe(10);
  });
});

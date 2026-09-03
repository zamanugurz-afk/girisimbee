import { describe, it, expect, beforeEach } from 'vitest';
import { getCompanyService } from '@/lib/persistence/container';
import type { UserId, CompanyId } from '@/lib/domain/ids';

describe('Company Settings & Deletion Workflow Suite', () => {
  const testUserId = 'test-owner-id' as UserId;
  let companyId: CompanyId;

  beforeEach(async () => {
    const service = getCompanyService();
    const created = await service.create({
      ownerId: testUserId,
      name: 'Test Kahve Zinciri A.Ş.',
      slug: 'test-kahve-' + Date.now(),
      description: 'Test açıklama',
      industry: 'Yeme-İçme & Kafe',
    });
    companyId = created.id;
  });

  it('verifies company can be retrieved and updated', async () => {
    const service = getCompanyService();
    const found = await service.getById(companyId);
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Test Kahve Zinciri A.Ş.');

    const updated = await service.update(companyId, testUserId, {
      name: 'Güncellenmiş Kahve A.Ş.',
    });
    expect(updated.name).toBe('Güncellenmiş Kahve A.Ş.');
  });

  it('verifies company deletion removes company from active owner list', async () => {
    const service = getCompanyService();
    await service.delete(companyId, testUserId);

    const afterDelete = await service.getById(companyId);
    expect(afterDelete).toBeNull();

    const userCompanies = await service.listForUser(testUserId);
    expect(userCompanies.some((c) => c.id === companyId)).toBe(false);
  });
});

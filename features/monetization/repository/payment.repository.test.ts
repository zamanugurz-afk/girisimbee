import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';

describe('PaymentRepository (mock)', () => {
  let repo: MockPaymentRepository;
  const userId = ids.user('00000000-0000-4000-8000-000000000001');

  beforeEach(() => {
    repo = new MockPaymentRepository();
  });

  it('creates payment record for unlock purpose', async () => {
    const payment = await repo.create({
      userId,
      amountCents: 9900,
      purpose: 'unlock_candidate',
      entityType: 'application',
      entityId: crypto.randomUUID(),
      provider: 'iyzico',
    });
    expect(payment.status).toBe('pending');
    expect(payment.currency).toBe('TRY');
  });

  it('finds payment by provider reference', async () => {
    const payment = await repo.create({
      userId,
      amountCents: 9900,
      purpose: 'package_purchase',
      entityType: 'application',
      entityId: crypto.randomUUID(),
    });
    await repo.update(payment.id, { providerRef: 'iyzico-ref-123' });
    const found = await repo.findByProviderRef('iyzico-ref-123');
    expect(found?.id).toBe(payment.id);
  });

  it('transitions payment to succeeded', async () => {
    const payment = await repo.create({
      userId,
      amountCents: 9900,
      purpose: 'unlock_candidate',
      entityType: 'application',
      entityId: crypto.randomUUID(),
    });
    const succeeded = await repo.transitionStatus(payment.id, 'succeeded');
    expect(succeeded.status).toBe('succeeded');
    expect(succeeded.paidAt).not.toBeNull();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createListingInput } from '@/features/listings/factories/listing.factory';

describe('ListingRepository (mock)', () => {
  let repo: MockListingRepository;

  beforeEach(() => {
    repo = new MockListingRepository();
  });

  it('creates and finds a listing by id', async () => {
    const input = createListingInput();
    const created = await repo.create(input);
    const found = await repo.findById(created.id);
    expect(found?.title).toBe(input.title);
    expect(found?.moduleKey).toBeNull();
  });

  it('filters by moduleKey and industry', async () => {
    const input = createListingInput();
    const created = await repo.create(input);
    await repo.update(created.id, {
      moduleKey: 'employers',
      industry: 'technology',
      anonymousMode: true,
      workflowStatus: 'published',
    });

    const { data } = await repo.findMany({
      moduleKey: 'employers',
      industry: 'technology',
      anonymousMode: true,
    });
    expect(data).toHaveLength(1);
    expect(data[0].moduleKey).toBe('employers');
  });

  it('increments view and application counts', async () => {
    const created = await repo.create(createListingInput());
    await repo.incrementViewCount(created.id);
    await repo.incrementApplicationCount(created.id);
    const found = await repo.findById(created.id);
    expect(found?.viewCount).toBe(1);
    expect(found?.applicationCount).toBe(1);
  });

  it('transitions listing status', async () => {
    const created = await repo.create(createListingInput());
    const published = await repo.transitionStatus(created.id, 'pending_review');
    expect(published.status).toBe('pending_review');
  });
});

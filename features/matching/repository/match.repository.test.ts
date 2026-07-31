import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MockMatchRepository } from '@/features/matching/repository/mock/match.repository.mock';

describe('MatchRepository (mock)', () => {
  let repo: MockMatchRepository;
  const initiator = ids.profile('p0000001-0001-4000-8000-000000000001');
  const target = ids.profile('p0000001-0001-4000-8000-000000000002');
  const listingId = ids.listing('l0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    repo = new MockMatchRepository();
  });

  it('creates and finds match for profile', async () => {
    const match = await repo.create({
      moduleKey: 'entrepreneurs',
      initiatorProfileId: initiator,
      targetProfileId: target,
      listingId,
    });
    expect(match.status).toBe('requested');

    const forProfile = await repo.findForProfile(initiator);
    expect(forProfile).toHaveLength(1);
  });

  it('transitions match status to accepted then contacted', async () => {
    const match = await repo.create({
      moduleKey: 'founders',
      initiatorProfileId: initiator,
      targetProfileId: target,
    });
    const accepted = await repo.transitionStatus(match.id, 'accepted');
    expect(accepted.status).toBe('accepted');

    const contacted = await repo.transitionStatus(match.id, 'contacted');
    expect(contacted.status).toBe('contacted');
    expect(contacted.contactedAt).not.toBeNull();
  });

  it('finds matches for listing', async () => {
    await repo.create({
      moduleKey: 'investors',
      initiatorProfileId: initiator,
      targetProfileId: target,
      listingId,
    });
    const matches = await repo.findForListing(listingId);
    expect(matches).toHaveLength(1);
  });
});

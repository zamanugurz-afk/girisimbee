import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MatchService } from '@/features/matching/services/match.service';
import { MockMatchRepository } from '@/features/matching/repository/mock/match.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';

describe('MatchService', () => {
  let service: MatchService;
  let matchRepo: MockMatchRepository;
  let listingRepo: MockListingRepository;

  const initiator = ids.profile('p0000001-0001-4000-8000-000000000001');
  const target = ids.profile('p0000001-0001-4000-8000-000000000002');
  const ownerId = ids.user('u0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    matchRepo = new MockMatchRepository();
    listingRepo = new MockListingRepository();
    service = new MatchService(matchRepo, listingRepo);
  });

  it('creates match and transitions to accepted', async () => {
    const listing = await listingRepo.create({
      ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.entrepreneurs,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.entrepreneurs,
      moduleKey: 'entrepreneurs',
      title: 'Startup',
      shortDescription: 'Test',
      contactPhone: '+905551234567',
    });

    const match = await service.create({
      moduleKey: 'entrepreneurs',
      initiatorProfileId: initiator,
      targetProfileId: target,
      listingId: listing.id,
    });
    expect(match.status).toBe('requested');

    const accepted = await service.accept(match.id, target);
    expect(accepted.status).toBe('accepted');
  });

  it('resolves external contact on contact (no internal messaging)', async () => {
    const listing = await listingRepo.create({
      ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.entrepreneurs,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.entrepreneurs,
      moduleKey: 'entrepreneurs',
      title: 'Startup',
      shortDescription: 'Test',
      contactPhone: '+905551234567',
      contactEmail: 'founder@example.com',
    });

    const match = await service.create({
      moduleKey: 'entrepreneurs',
      initiatorProfileId: initiator,
      targetProfileId: target,
      listingId: listing.id,
    });

    await service.accept(match.id, target);
    const result = await service.contact(match.id, initiator);
    expect(result.match.status).toBe('contacted');
    expect(result.contact.phone).toBe('+905551234567');
    expect(result.contact.email).toBe('founder@example.com');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { ProfileService } from '@/features/profiles/services/profile.service';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import { ids } from '@/lib/domain/ids';
import { ECOSYSTEM_CATEGORY_IDS, DEFAULT_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000044');
const VIEWER = ids.user('u0000001-0001-4000-8000-000000000045');

describe('public profile enumeration via userId', () => {
  let profiles: MockProfileRepository;
  let listings: MockListingRepository;
  let service: ProfileService;

  beforeEach(() => {
    profiles = new MockProfileRepository();
    listings = new MockListingRepository();
    service = new ProfileService(profiles, undefined, listings);
  });

  it('blocks /uye lookup when member only has anonymous candidate listings', async () => {
    await profiles.create(
      createProfile({
        userId: OWNER,
        displayName: 'Gerçek Ad Soyad',
        username: 'gercek-ad',
        status: 'published',
        visibility: 'public',
      }),
    );

    const candidateListing = await listings.create({
      ownerId: OWNER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.candidates,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.candidates,
      moduleKey: 'candidates',
      anonymousMode: true,
      title: 'İş Arıyorum',
      shortDescription: 'Kariyer kartı',
      status: 'published',
      workflowStatus: 'published',
    });
    await listings.update(candidateListing.id, { publishedAt: new Date().toISOString() });

    const byUserId = await service.getPublicProfileByUserId(OWNER, VIEWER);
    expect(byUserId).toBeNull();

    // Intentional username profile remains available (not via listing owner_id).
    const byUsername = await service.getPublicProfile('gercek-ad', VIEWER);
    expect(byUsername?.profile.displayName).toBe('Gerçek Ad Soyad');
    expect(byUsername?.listings).toHaveLength(0);
  });

  it('keeps employer member profiles enumerable by userId', async () => {
    await profiles.create(
      createProfile({
        userId: OWNER,
        displayName: 'İşveren Adı',
        username: 'isveren-adi',
        status: 'published',
        visibility: 'public',
      }),
    );

    const employerListing = await listings.create({
      ownerId: OWNER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Backend Aranıyor',
      shortDescription: 'Node.js',
      status: 'published',
      workflowStatus: 'published',
    });
    await listings.update(employerListing.id, { publishedAt: new Date().toISOString() });

    const view = await service.getPublicProfileByUserId(OWNER, VIEWER);
    expect(view?.profile.displayName).toBe('İşveren Adı');
    expect(view?.listings).toHaveLength(1);
  });

  it('allows owner to view their own member page even with only candidate listings', async () => {
    await profiles.create(
      createProfile({
        userId: OWNER,
        displayName: 'Gerçek Ad Soyad',
        username: 'gercek-ad-2',
        status: 'published',
        visibility: 'public',
      }),
    );

    const ownListing = await listings.create({
      ownerId: OWNER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.candidates,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.candidates,
      moduleKey: 'candidates',
      anonymousMode: true,
      title: 'İş Arıyorum',
      shortDescription: 'Kariyer kartı',
      status: 'published',
      workflowStatus: 'published',
    });
    await listings.update(ownListing.id, { publishedAt: new Date().toISOString() });

    const own = await service.getPublicProfileByUserId(OWNER, OWNER);
    expect(own?.profile.displayName).toBe('Gerçek Ad Soyad');
    expect(own?.isOwner).toBe(true);
  });
});

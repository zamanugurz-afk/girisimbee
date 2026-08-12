import { describe, expect, it } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';

describe('resolveListingCardDisplay', () => {
  it('labels candidate listings via marketplace listing type id', () => {
    const listing = createListing({
      ownerId: ids.user('u0000001-0001-4000-8000-000000000001'),
      categoryId: ids.category('e1000001-0001-4000-8000-000000000002'),
      listingTypeId: MARKETPLACE_LISTING_TYPE_IDS.isAriyorum,
      moduleKey: 'candidates',
      title: 'Saha Satış Uzmanı Olarak İş Arıyorum',
      shortDescription: 'İş arıyorum kısa açıklama metni.',
    });

    const display = resolveListingCardDisplay(listing);
    expect(display.typeLabel).toBe('İŞ ARIYORUM');
    expect(display.groupLabel).toBe('İş');
    expect(display.iconKey).toBe('job-seeker');
    expect(display.groupColor).toBe('#0EA5E9');
  });

  it('labels candidate listings via listingTypeSlug join', () => {
    const listing = {
      ...createListing({
        ownerId: ids.user('u0000001-0001-4000-8000-000000000001'),
        categoryId: CATEGORY_IDS.isBul,
        listingTypeId: LISTING_TYPE_IDS.isBulDefault,
        title: 'İş arıyorum',
        shortDescription: 'İş arıyorum kısa açıklama metni.',
      }),
      listingTypeSlug: 'is-ariyorum',
      categorySlug: 'is',
    };

    const display = resolveListingCardDisplay(listing);
    expect(display.typeLabel).toBe('İŞ ARIYORUM');
    expect(display.group).toBe('is');
  });

  it('does not default unknown listings to YATIRIM ARIYORUM', () => {
    const listing = createListing({
      ownerId: ids.user('u0000001-0001-4000-8000-000000000001'),
      categoryId: ids.category('00000000-0000-4000-8000-000000000099'),
      listingTypeId: ids.listingType('00000000-0000-4000-8000-000000000099'),
      moduleKey: null,
      title: 'Bilinmeyen',
      shortDescription: 'Bilinmeyen ilan kısa açıklama metni.',
    });

    const display = resolveListingCardDisplay(listing);
    expect(display.typeLabel).not.toBe('YATIRIM ARIYORUM');
  });

  it('labels investors via module key', () => {
    const listing = createListing({
      ownerId: ids.user('u0000001-0001-4000-8000-000000000001'),
      categoryId: ids.category('e1000001-0001-4000-8000-000000000001'),
      listingTypeId: MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum,
      moduleKey: 'investors',
      title: 'Yatırım yapıyorum',
      shortDescription: 'Yatırım yapıyorum kısa açıklama metni.',
    });

    const display = resolveListingCardDisplay(listing);
    expect(display.typeLabel).toBe('YATIRIM YAPIYORUM');
    expect(display.iconKey).toBe('investor');
  });

  it('maps digital-ai listings to BrainCircuit icon key', () => {
    const listing = {
      ...createListing({
        ownerId: ids.user('u0000001-0001-4000-8000-000000000001'),
        categoryId: CATEGORY_IDS.dijitalAi,
        listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
        title: 'AI çözüm',
        shortDescription: 'Dijital AI kısa açıklama metni.',
      }),
      listingTypeSlug: 'dijital-ai-cozum',
      categorySlug: 'dijital-ai',
    };

    const display = resolveListingCardDisplay(listing);
    expect(display.iconKey).toBe('digital');
    expect(display.group).toBe('dijital');
  });
});

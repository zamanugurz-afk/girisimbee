import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE, TEST_PROFILE_2 } from '@/lib/testing/ecosystem-test-fixtures';
import { FRANCHISE_SUBCATEGORY_IDS } from '@/features/shared/constants/ecosystem';
import { contactFromListing } from '@/features/shared/lib/external-contact';

describe('FranchiseService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('Bayilik Ver — publishes give listing and browse returns it for buy flow', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    const listing = await franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'give',
      listing: {
        title: 'Kafe Franchise',
        shortDescription: '50 şube franchise fırsatı sunuyoruz',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        district: 'Kadıköy',
        sector: 'Food',
        franchiseBedeli: 300000,
        minimumSermaye: 600000,
        contactPhone: '+905551234567',
      },
    });

    expect(listing.subcategoryId).toBe(FRANCHISE_SUBCATEGORY_IDS['franchise-give']);
    expect(listing.status).toBe('published');
    expect(listing.customFields.franchiseBedeli).toBe(300000);

    const browse = await franchiseService.browseBuyOpportunities({ city: 'Istanbul', district: 'Kadıköy' });
    expect(browse.data.some((l) => l.id === listing.id)).toBe(true);
  });

  it('creates draft listing and publishes via publishListingDraft', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    const draft = await franchiseService.createListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'give',
      asDraft: true,
      listing: {
        title: 'Draft Franchise',
        shortDescription: 'Taslak franchise ilanı açıklaması',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Ankara',
        contactEmail: 'draft@example.com',
      },
    });

    expect(draft.status).toBe('draft');

    const published = await franchiseService.publishListingDraft(
      TEST_USER,
      TEST_PROFILE,
      draft.id,
      'give',
    );

    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeTruthy();
  });

  it('updates draft and published franchise listings', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'buy');
    const listing = await franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'buy',
      listing: {
        title: 'Franchise Arayışı',
        shortDescription: 'Gıda sektöründe franchise arıyorum',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Izmir',
        minimumYatirim: 100000,
        maksimumYatirim: 400000,
        contactPhone: '+905551111111',
      },
    });

    const updated = await franchiseService.updateListing({
      ownerId: TEST_USER,
      listingId: listing.id,
      flow: 'buy',
      listing: {
        city: 'Bursa',
        minimumYatirim: 150000,
      },
    });

    expect(updated.city).toBe('Bursa');
    expect(updated.customFields.minimumYatirim).toBe(150000);
  });

  it('browseGiveSeekers filters by city, district and sector', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'buy');
    const listing = await franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'buy',
      listing: {
        title: 'Retail Seeker',
        shortDescription: 'Perakende franchise arıyorum detay',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Antalya',
        district: 'Muratpaşa',
        sector: 'Retail',
        contactEmail: 'seeker@example.com',
      },
    });

    const match = await franchiseService.browseGiveSeekers({
      city: 'Antalya',
      district: 'Muratpaşa',
      sector: 'Retail',
    });
    expect(match.data.some((l) => l.id === listing.id)).toBe(true);

    const noMatch = await franchiseService.browseGiveSeekers({ city: 'Istanbul' });
    expect(noMatch.data.some((l) => l.id === listing.id)).toBe(false);
  });

  it('getListingDetail returns listing with extracted details and external contact', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    const listing = await franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'give',
      listing: {
        title: 'Contact Test Franchise',
        shortDescription: 'İletişim bilgili franchise ilanıdır',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        contactPhone: '+905559876543',
        contactEmail: 'contact@example.com',
        contactWebsite: 'https://brand.example.com',
      },
    });

    const detail = await franchiseService.getListingDetail(listing.slug);
    expect(detail?.flow).toBe('give');
    expect(detail?.listing.id).toBe(listing.id);

    const contact = franchiseService.getListingContact(listing);
    expect(contactFromListing(listing)).toEqual(contact);
    expect(contact.phone).toBe('+905559876543');
    expect(contact.email).toBe('contact@example.com');
  });

  it('Bayilik Al — publishes buy profile and applies to give listing', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    const giveListing = await franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'give',
      listing: {
        title: 'Retail Franchise',
        shortDescription: 'Nationwide franchise opportunity',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        contactEmail: 'fr@example.com',
      },
    });

    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');
    const application = await franchiseService.submitApplication(TEST_PROFILE_2, giveListing.id, 'Interested');

    expect(application.moduleKey).toBe('franchise');
    expect(application.status).toBe('submitted');
  });

  it('assertFlowProfile rejects wrong flow', async () => {
    const { franchiseService } = harness.services;
    await franchiseService.activateProfile(TEST_PROFILE, 'buy');

    await expect(franchiseService.assertFlowProfile(TEST_PROFILE, 'give')).rejects.toThrow(
      'Profil give akışı için yapılandırılmamış',
    );
  });

  it('upserts and retrieves Bayilik Al buy profile', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'buy');
    const profile = await franchiseService.upsertBuyProfile(TEST_PROFILE, {
      adSoyad: 'Ali Yılmaz',
      sehir: 'Istanbul',
      ilce: 'Kadıköy',
      sektor: 'Food',
      minimumYatirim: 200000,
      maksimumYatirim: 800000,
      telefon: '+905551234567',
      eposta: 'ali@example.com',
    });

    expect(profile.subcategorySlug).toBe('franchise-buy');
    expect(profile.adSoyad).toBe('Ali Yılmaz');

    const fetched = await franchiseService.getBuyProfile(TEST_PROFILE);
    expect(fetched?.adSoyad).toBe('Ali Yılmaz');
    expect(await franchiseService.getGiveProfile(TEST_PROFILE)).toBeNull();
  });

  it('upserts and retrieves Bayilik Ver give profile with external contact', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    const profile = await franchiseService.upsertGiveProfile(TEST_PROFILE, {
      markaAdi: 'KafeX',
      sektor: 'Food',
      sehir: 'Ankara',
      franchiseBedeli: 300000,
      minimumSermaye: 600000,
      subeSayisi: 10,
      egitimDestegi: true,
      telefon: '+905559876543',
      eposta: 'info@kafex.com',
      website: 'https://kafex.com',
    });

    expect(profile.subcategorySlug).toBe('franchise-give');
    expect(profile.markaAdi).toBe('KafeX');

    const contact = franchiseService.getExternalContact(profile);
    expect(contact.phone).toBe('+905559876543');
    expect(contact.email).toBe('info@kafex.com');
    expect(contact.website).toBe('https://kafex.com');
  });
});

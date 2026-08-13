import { describe, expect, it } from 'vitest';
import { createListing } from '@/features/listings/factories/listing.factory';
import { ids } from '@/lib/domain/ids';
import { ECOSYSTEM_CATEGORY_IDS, DEFAULT_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { toPublicListingEntity } from '@/features/contact-requests/lib/strip-listing-phone';
import { wrapListingRepositoryForClientPublicReads } from '@/features/listings/repository/client-public-listing.repository';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000099');

describe('toPublicListingEntity identity gate', () => {
  it('strips owner/company identity from anonymous candidate listings but keeps career data', () => {
    const listing = createListing({
      ownerId: OWNER,
      companyId: ids.company('c0000001-0001-4000-8000-000000000001'),
      categoryId: ECOSYSTEM_CATEGORY_IDS.candidates,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.candidates,
      moduleKey: 'candidates',
      anonymousMode: true,
      title: 'Satış Uzmanı',
      shortDescription: '8 yıl deneyim',
      contactPhone: '+905551111111',
      contactEmail: 'secret@example.com',
      contactWebsite: 'https://me.example',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        experienceLevel: '8 yıl',
        preferredCity: 'İstanbul',
        professionalSkills: 'Kurumsal satış',
        salaryExpectation: '80.000 TL',
        companyName: 'Gizli Firma A.Ş.',
        website: 'https://secret.example',
        companyLogo: 'https://secret.example/logo.png',
        cvUrl: 'https://cv.example/x.pdf',
        experiences: [
          {
            id: 'e1',
            sector: 'Satış',
            role: 'Uzman',
            duration: '8 yıl',
            companyName: 'Sızmaması Gereken Ltd',
            employerName: 'Gizli',
            responsibilities: 'Saha',
          },
        ],
      },
    });

    const publicListing = toPublicListingEntity(listing);

    expect(publicListing.id).toBe(listing.id);
    expect(publicListing).not.toHaveProperty('ownerId');
    expect(publicListing.companyId).toBeNull();
    expect(publicListing.contactPhone).toBeNull();
    expect(publicListing.contactEmail).toBeNull();
    expect(publicListing.contactWebsite).toBeNull();
    expect(publicListing.customFields.desiredRole).toBe('Satış Uzmanı');
    expect(publicListing.customFields.experienceLevel).toBe('8 yıl');
    expect(publicListing.customFields.preferredCity).toBe('İstanbul');
    expect(publicListing.customFields.professionalSkills).toBe('Kurumsal satış');
    expect(publicListing.customFields.salaryExpectation).toBe('80.000 TL');
    expect(publicListing.customFields.companyName).toBeUndefined();
    expect(publicListing.customFields.website).toBeUndefined();
    expect(publicListing.customFields.companyLogo).toBeUndefined();
    expect(publicListing.customFields.cvUrl).toBeUndefined();
    const experiences = publicListing.customFields.experiences as Array<Record<string, unknown>>;
    expect(experiences[0]?.role).toBe('Uzman');
    expect(experiences[0]?.sector).toBe('Satış');
    expect(experiences[0]?.companyName).toBeUndefined();
    expect(experiences[0]?.employerName).toBeUndefined();
    expect(JSON.stringify(publicListing)).not.toMatch(/Gizli Firma|secret\.example|Sızmaması|ugurz|Uğur/i);
  });

  it('keeps employer listing ownerId and company fields for public browse', () => {
    const companyId = ids.company('c0000001-0001-4000-8000-000000000002');
    const listing = createListing({
      ownerId: OWNER,
      companyId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      anonymousMode: false,
      title: 'Backend Developer Aranıyor',
      shortDescription: 'Node.js',
      customFields: { companyName: 'Açık Şirket', website: 'https://acik.example' },
    });

    const publicListing = toPublicListingEntity(listing);
    expect(publicListing.ownerId).toBe(OWNER);
    expect(publicListing.companyId).toBe(companyId);
    expect(publicListing.customFields.companyName).toBe('Açık Şirket');
    expect(publicListing.customFields.website).toBe('https://acik.example');
  });
});

describe('client listing repository public reads', () => {
  it('hides ownerId for strangers on identity-gated findById', async () => {
    const inner = new MockListingRepository();
    const created = await inner.create({
      ownerId: OWNER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.candidates,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.candidates,
      moduleKey: 'candidates',
      anonymousMode: true,
      title: 'Anonim kariyer',
      shortDescription: 'Deneyimli aday',
      status: 'published',
      workflowStatus: 'published',
      customFields: { desiredRole: 'Satış', companyName: 'Gizli' },
    });

    const wrapped = wrapListingRepositoryForClientPublicReads(inner, async () => null);
    const found = await wrapped.findById(created.id);
    expect(found).not.toBeNull();
    expect(found).not.toHaveProperty('ownerId');
    expect(found?.customFields.companyName).toBeUndefined();
    expect(found?.customFields.desiredRole).toBe('Satış');
  });

  it('keeps ownerId for the listing owner', async () => {
    const inner = new MockListingRepository();
    const created = await inner.create({
      ownerId: OWNER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.candidates,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.candidates,
      moduleKey: 'candidates',
      anonymousMode: true,
      title: 'Anonim kariyer',
      shortDescription: 'Deneyimli aday',
      status: 'published',
      workflowStatus: 'published',
      customFields: { companyName: 'Gizli' },
    });

    const wrapped = wrapListingRepositoryForClientPublicReads(inner, async () => String(OWNER));
    const found = await wrapped.findById(created.id);
    expect(found?.ownerId).toBe(OWNER);
    expect(found?.customFields.companyName).toBe('Gizli');
  });
});

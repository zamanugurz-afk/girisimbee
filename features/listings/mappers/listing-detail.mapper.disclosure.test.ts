import { describe, expect, it } from 'vitest';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import { createListing } from '@/features/listings/factories/listing.factory';
import { resolveContactDisclosure } from '@/features/contact-requests/lib/contact-disclosure';
import { ECOSYSTEM_CATEGORY_IDS, DEFAULT_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { ids } from '@/lib/domain/ids';
import type { ListingAggregate } from '@/features/listings/types/listing-engine.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { Profile } from '@/features/profiles/types/profile.types';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000099');

function makeAggregate(overrides: Partial<Listing> = {}): ListingAggregate {
  const listing = createListing({
    ownerId: OWNER,
    categoryId: ECOSYSTEM_CATEGORY_IDS.candidates,
    listingTypeId: DEFAULT_LISTING_TYPE_IDS.candidates,
    moduleKey: 'candidates',
    anonymousMode: true,
    title: 'Satış ve İş Geliştirme Uzmanı',
    shortDescription: '8 yıl deneyimli satış profesyoneli',
    city: 'İstanbul',
    status: 'published',
    workflowStatus: 'published',
    customFields: {
      desiredRole: 'Satış ve İş Geliştirme Uzmanı',
      experienceLevel: '8 yıl',
      companyName: 'Gizli Firma A.Ş.',
      website: 'https://secret.example',
      experiences: [
        {
          id: 'e1',
          sector: 'Satış',
          role: 'Uzman',
          duration: '8 yıl',
          responsibilities: 'Kurumsal müşteri yönetimi ve yeni iş geliştirme',
          achievements: 'Hedeflerin üzerinde büyüme',
          companyName: 'Sızmaması Gereken Ltd',
        },
      ],
    },
    ...overrides,
  });

  return {
    listing,
    tags: [],
    images: [],
    attachments: [],
    activityHistory: [],
  };
}

const profile = {
  id: ids.profile('p0000001-0001-4000-8000-000000000099'),
  userId: OWNER,
  displayName: 'Uğur Zaman',
  username: 'ugur-zaman',
  avatarUrl: null,
  headline: 'Satış',
  bio: null,
  location: null,
  website: null,
  linkedinUrl: null,
  status: 'published',
  visibility: 'public',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
} as unknown as Profile;

describe('aggregateToListingDetail identity disclosure', () => {
  it('redacts public career card identity and company while keeping career facts', () => {
    const disclosure = resolveContactDisclosure({
      listing: { moduleKey: 'candidates', anonymousMode: true, ownerId: String(OWNER) },
      viewerUserId: null,
    });

    const detail = aggregateToListingDetail(makeAggregate(), {
      profile,
      disclosure,
    });

    expect(detail.identityRedacted).toBe(true);
    expect(detail.owner.name).toBe('Anonim Profil');
    expect(detail.publisher.name).toBe('Anonim Profil');
    expect(detail.publisher.href).toBe('#');
    expect(detail.ownerUserId).toBeUndefined();
    expect(detail.companyId).toBeNull();
    expect(detail.company.name).toBe('');
    expect(detail.company.website).toBe('');
    expect(detail.contactPhone).toBeNull();
    expect(detail.contactEmail).toBeNull();
    expect(detail.contactWhatsapp).toBeNull();
    expect(detail.title).toMatch(/Satış/i);
    expect(detail.location).toMatch(/İstanbul/i);
    expect(detail.customFacts?.some((f) => /Gizli Firma|secret\.example|Uğur/i.test(f.value))).toBe(
      false,
    );
    expect(JSON.stringify(detail)).not.toMatch(/Uğur Zaman|Gizli Firma|secret\.example/i);
  });

  it('reveals identity after accepted contact request', () => {
    const disclosure = resolveContactDisclosure({
      listing: { moduleKey: 'candidates', anonymousMode: true, ownerId: String(OWNER) },
      viewerUserId: 'u0000001-0001-4000-8000-000000000002',
      hasAcceptedContactRequest: true,
    });

    const detail = aggregateToListingDetail(makeAggregate(), {
      profile,
      disclosure,
    });

    expect(detail.identityRedacted).toBeFalsy();
    expect(detail.publisher.name).toBe('Uğur Zaman');
    expect(detail.publisher.href).toContain('ugur-zaman');
    expect(detail.ownerUserId).toBe(OWNER);
  });

  it('does not redact employer listings for anonymous viewers', () => {
    const companyId = ids.company('c0000001-0001-4000-8000-000000000001');
    const aggregate = makeAggregate({
      moduleKey: 'employers',
      anonymousMode: false,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      companyId,
      title: 'Backend Developer Aranıyor',
      customFields: { companyName: 'Açık Şirket' },
    });

    const disclosure = resolveContactDisclosure({
      listing: { moduleKey: 'employers', ownerId: String(OWNER) },
      viewerUserId: null,
    });

    const detail = aggregateToListingDetail(aggregate, {
      profile,
      company: {
        id: companyId,
        ownerId: OWNER,
        name: 'Açık Şirket',
        slug: 'acik-sirket',
        description: null,
        logoUrl: null,
        coverUrl: null,
        industry: null,
        city: 'Ankara',
        location: null,
        country: 'TR',
        website: null,
        linkedInUrl: null,
        twitterUrl: null,
        foundedYear: null,
        employeeCount: null,
        contactEmail: null,
        isVerified: false,
        websiteVerified: false,
        emailVerified: false,
        status: 'active',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      disclosure,
    });

    expect(detail.identityRedacted).toBeFalsy();
    expect(detail.publisher.name).toBe('Açık Şirket');
    expect(detail.company.name).toBe('Açık Şirket');
  });
});

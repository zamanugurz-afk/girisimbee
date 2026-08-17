import { describe, expect, it } from 'vitest';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import type { ListingAggregate } from '@/features/listings/types/listing-engine.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000088');

function makeAggregate(overrides: Partial<Listing> = {}): ListingAggregate {
  const listing = createListing({
    ownerId: OWNER,
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title: 'Teknik Kurucu Ortak Arıyoruz',
    shortDescription: 'Erken aşama ürün için teknik ortak arıyoruz.',
    city: 'İstanbul',
    status: 'published',
    workflowStatus: 'published',
    contactPhone: '+905551112233',
    contactEmail: 'secret@example.com',
    contactWhatsapp: '+905551112233',
    customFields: {
      sector: 'SaaS / Yazılım',
      projectStage: 'MVP aşaması',
      partnershipType: 'Kurucu Ortak',
      expertise: ['Yazılım geliştirme'],
      commitment: 'Tam zamanlı',
      equityOffered: 12,
      phone: '+905551112233',
      email: 'leak@example.com',
      whatsapp: '+905551112233',
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

describe('aggregateToListingDetail partnership intent', () => {
  it('treats missing partnershipIntent as seeking and hides contact channels', () => {
    const detail = aggregateToListingDetail(makeAggregate());

    expect(detail.category.id).toBe('find-partner');
    expect(detail.category.label).toBe('Ortak Arıyorum');
    expect(detail.intentHeadline).toBe('Bu girişim bir ortak arıyor.');
    expect(detail.contactPhone).toBeNull();
    expect(detail.contactEmail).toBeNull();
    expect(detail.contactWhatsapp).toBeNull();
    expect(detail.customFacts?.some((fact) => fact.label === 'Sektör')).toBe(true);
    expect(detail.customFacts?.some((fact) => /partnershipIntent|telefon|e-posta|whatsapp/i.test(`${fact.label} ${fact.value}`))).toBe(false);
    expect(JSON.stringify(detail.customFacts)).not.toContain('secret@example.com');
    expect(JSON.stringify(detail.customFacts)).not.toContain('+905551112233');
    expect(JSON.stringify(detail.customFacts)).not.toContain('leak@example.com');
  });

  it('shows joining copy and joining-specific facts', () => {
    const detail = aggregateToListingDetail(
      makeAggregate({
        title: 'Teknik Kurucu Ortak Olarak Katılmak İstiyorum',
        customFields: {
          partnershipIntent: 'joining',
          expertise: ['Ürün yönetimi'],
          offeredSkills: ['Yazılım geliştirme'],
          sectors: ['SaaS / Yazılım'],
          partnershipType: 'Kurucu Ortak',
          commitment: 'Yarı zamanlı',
          experience: '5-10 yıl',
          email: 'hidden@example.com',
        },
      }),
    );

    expect(detail.category.label).toBe('Ortak Olmak İstiyorum');
    expect(detail.intentHeadline).toBe('Bu kullanıcı bir girişime ortak olmak istiyor.');
    expect(detail.customFacts?.some((fact) => fact.label === 'Uzmanlık alanları')).toBe(true);
    expect(detail.customFacts?.some((fact) => fact.label === 'Sunduğum yetkinlikler')).toBe(true);
    expect(detail.customFacts?.some((fact) => fact.label === 'Deneyim' && fact.value === '5-10 yıl')).toBe(true);
    expect(detail.customFacts?.some((fact) => fact.label === 'Aranan uzmanlıklar')).toBe(false);
    expect(detail.customFacts?.some((fact) => /Aranan ortak/i.test(fact.label))).toBe(false);
    expect(JSON.stringify(detail.customFacts)).not.toContain('hidden@example.com');
  });
});

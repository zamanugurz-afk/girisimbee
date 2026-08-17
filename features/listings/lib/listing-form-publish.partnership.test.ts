import { describe, expect, it } from 'vitest';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';

function formValues(customFields: ListingFormValues['customFields']): ListingFormValues {
  return {
    core: {
      title: 'Ortaklık ilanı',
      shortDescription: 'Kısa açıklama en az otuz karakter olacak şekilde.',
      longDescription: 'Uzun açıklama en az yüz karakter olacak şekilde doldurulmuş bir ortaklık metnidir ve iletişim bilgisi içermez.',
      city: 'İstanbul',
      country: 'TR',
      remotePolicy: null,
    },
    customFields,
    tags: [],
    images: [],
  } as ListingFormValues;
}

describe('listingFormValuesToModulePayload partnership intent', () => {
  it('defaults missing intent to seeking', () => {
    const payload = listingFormValuesToModulePayload(
      CATEGORY_IDS.ortakBul,
      formValues({
        sector: 'SaaS / Yazılım',
        expertise: ['Yazılım geliştirme'],
      }),
    );

    expect(payload.partnershipIntent).toBe('seeking');
  });

  it('persists joining fields on the same ortak-bul category', () => {
    const payload = listingFormValuesToModulePayload(
      CATEGORY_IDS.ortakBul,
      formValues({
        partnershipIntent: 'joining',
        expertise: ['Ürün yönetimi'],
        offeredSkills: ['Yazılım geliştirme'],
        sectors: ['SaaS / Yazılım'],
        experience: '5-10 yıl',
        partnershipType: 'Kurucu Ortak',
        commitment: 'Yarı zamanlı',
      }),
    );

    expect(payload.partnershipIntent).toBe('joining');
    expect(payload.offeredSkills).toEqual(['Yazılım geliştirme']);
    expect(payload.sectors).toEqual(['SaaS / Yazılım']);
    expect(payload.experience).toBe('5-10 yıl');
  });
});

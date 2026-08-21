import { describe, expect, it } from 'vitest';
import { calculateBusinessTransferMatch } from '@/features/business-transfer-matching/engine';
import {
  extractBusinessTransferOpportunity,
  extractBusinessTransferSeeker,
  isBusinessTransferListing,
} from '@/features/business-transfer-matching/normalize';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';

describe('Business Transfer Matching Engine', () => {
  it('correctly identifies business transfer listings', () => {
    const validListing: Partial<Listing> = {
      id: ids.listing('list-001'),
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      title: 'Kadıköy Moda Faal Kafe Devri',
      status: 'published',
    };
    expect(isBusinessTransferListing(validListing as Listing)).toBe(true);

    const nonTransferListing: Partial<Listing> = {
      id: ids.listing('list-002'),
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      title: 'Kıdemli Yazılım Mühendisi',
      status: 'published',
    };
    expect(isBusinessTransferListing(nonTransferListing as Listing)).toBe(false);
  });

  it('calculates high match score for compatible sector, budget, and location', () => {
    const oppListing: Partial<Listing> = {
      id: ids.listing('opp-101'),
      slug: 'kadikoy-faal-kafe-devri',
      title: 'Kadıköy Moda Faal Butik Kafe Devri',
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      city: 'İstanbul',
      location: 'Kadıköy',
      status: 'published',
      customFields: {
        businessName: 'Moda Espresso Bar',
        businessType: 'Kafe / Restoran / Yeme-İçme',
        sector: 'Gıda / Restoran',
        city: 'İstanbul',
        district: 'Kadıköy',
        transferPrice: 850000,
        monthlyRent: 35000,
        businessAge: 4,
        employeeCount: 3,
        operationalStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
        transferScope: ['Demirbaşlar & Ekipmanlar', 'İşletme Ruhsatı & İzinler', 'Mevcut Ürün Stoku'],
      },
    };

    const seeker = extractBusinessTransferSeeker({
      budgetMax: 1000000,
      preferredSectors: ['Gıda / Restoran'],
      preferredBusinessTypes: ['Kafe / Restoran / Yeme-İçme'],
      city: 'İstanbul',
      district: 'Kadıköy',
      operationalPreference: 'Kendisi İşletecek',
      preferredStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
    });

    const opp = extractBusinessTransferOpportunity(oppListing as Listing);
    const match = calculateBusinessTransferMatch(seeker, opp);

    expect(match.score).toBeGreaterThanOrEqual(85);
    expect(match.band).toBe('very_strong');
    expect(match.recommendable).toBe(true);
    expect(match.reasons.some((r) => r.text.includes('Sektör tam uyumlu'))).toBe(true);
    expect(match.reasons.some((r) => r.text.includes('Devir bedeli bütçenizle tam uyumlu'))).toBe(true);
    expect(match.reasons.some((r) => r.text.includes('Lokasyon uyumu'))).toBe(true);
  });

  it('detects budget and location gaps when outside criteria', () => {
    const oppListing: Partial<Listing> = {
      id: ids.listing('opp-102'),
      slug: 'izmir-oto-servis-devri',
      title: 'İzmir Bornova Yetkili Oto Ekspertiz Devri',
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      city: 'İzmir',
      location: 'Bornova',
      status: 'published',
      customFields: {
        businessType: 'Oto Servis / Yıkama / Ekspertiz',
        sector: 'Oto servis / Yetkili servis',
        city: 'İzmir',
        district: 'Bornova',
        transferPrice: 3500000,
      },
    };

    const seeker = extractBusinessTransferSeeker({
      budgetMax: 1000000,
      preferredSectors: ['Bilişim / Yazılım'],
      preferredBusinessTypes: ['E-Ticaret / Dijital İşletme'],
      city: 'Ankara',
      district: 'Çankaya',
    });

    const opp = extractBusinessTransferOpportunity(oppListing as Listing);
    const match = calculateBusinessTransferMatch(seeker, opp);

    expect(match.score).toBeLessThan(40);
    expect(match.band).toBe('below_threshold');
    expect(match.recommendable).toBe(false);
    expect(match.reasons.some((r) => r.text.includes('Hedef sektör farkı'))).toBe(true);
    expect(match.reasons.some((r) => r.text.includes('Devir bedeli bütçenizin üzerinde'))).toBe(true);
    expect(match.reasons.some((r) => r.text.includes('Farklı şehir lokasyonu'))).toBe(true);
  });
});

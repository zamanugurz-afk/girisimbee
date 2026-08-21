import { describe, expect, it } from 'vitest';
import { HOME_CATEGORIES } from '@/components/girisimco/home/home-marketplace.data';
import {
  CREATE_LISTING_PICKER_ORDER,
  CREATE_LISTING_ROOT_HIDDEN_CATEGORY_IDS,
  CREATE_LISTING_VENTURE_CATEGORIES_COPY,
} from '@/components/girisimco/listing/create-listing-career.data';
import { isContactRequestEligibleCategory, resolveContactCtaLabel } from '@/features/contact-requests/config/contact-cta-copy';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { CATEGORY_PAGE_CONFIG } from '@/features/listings/config/marketplace.config';
import { createListing } from '@/features/listings/factories/listing.factory';
import { listingToContentItem } from '@/features/listings/mappers/listing-card.mapper';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import { ids } from '@/lib/domain/ids';
import { LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';
import {
  DIGITAL_AI_BRAND_NAME,
  DIGITAL_AI_BROWSE_DESCRIPTION,
  DIGITAL_AI_BROWSE_TITLE,
  DIGITAL_AI_CONTACT_CTA,
  DIGITAL_AI_EMPTY_BACK_CTA,
  DIGITAL_AI_EMPTY_TITLE,
  DIGITAL_AI_HOME_CTA_HREF,
  DIGITAL_AI_HOME_CTA_LABEL,
  DIGITAL_AI_HOME_SECTION_TITLE,
  isDigitalAiSafePublicHref,
} from '@/features/listings/presentation/digital-ai-copy';

describe('Dijital & AI Çözümleri presentation', () => {
  it('keeps Çözümler on /dijital-ai and separate from MARKET', () => {
    expect(NAV_LINKS.find((link) => link.label === 'Çözümler')?.href).toBe('/dijital-ai');
    expect(NAV_LINKS.find((link) => link.label === 'Fırsatlar')?.href).toBe('/market');
    expect(getFooterLinks().Çözümler?.map((link) => [link.label, link.href])).toEqual([
      ['Dijital & AI Çözümleri', '/dijital-ai'],
    ]);
    expect(getFooterLinks().Fırsatlar?.map((link) => [link.label, link.href])).toEqual([
      ['Girişimbee MARKET', '/market'],
    ]);
    expect(DIGITAL_AI_HOME_CTA_HREF).toBe('/dijital-ai');
    expect(DIGITAL_AI_HOME_CTA_LABEL).toBe('Tüm çözümleri gör');
    expect(DIGITAL_AI_HOME_SECTION_TITLE).toBe('Çözümler');
    expect(DIGITAL_AI_BRAND_NAME).toBe('Dijital & AI Çözümleri');
    expect(DIGITAL_AI_BRAND_NAME).toContain('&');
    expect(DIGITAL_AI_BRAND_NAME).not.toBe('Dijital ve AI Çözümleri');
    expect(isDigitalAiSafePublicHref('/dijital-ai')).toBe(true);
    expect(isDigitalAiSafePublicHref('/market')).toBe(false);
  });

  it('uses solution-focused browse copy and empty state', () => {
    expect(DIGITAL_AI_BROWSE_TITLE).toBe('Dijital & AI Çözümleri');
    expect(DIGITAL_AI_BROWSE_DESCRIPTION).toContain('dijital ürünleri');
    expect(CATEGORY_PAGE_CONFIG['dijital-ai']?.seoTitle).toBe('Dijital & AI Çözümleri | Girisimbee');
    expect(CATEGORY_PAGE_CONFIG['dijital-ai']?.seoDescription).not.toMatch(/doğrudan ara|WhatsApp|telefon/i);
    expect(DIGITAL_AI_EMPTY_TITLE).toBe('Şu anda gösterilecek bir çözüm bulunmuyor.');
    expect(DIGITAL_AI_EMPTY_BACK_CTA.href).toBe('/');
    expect(DIGITAL_AI_EMPTY_BACK_CTA.href).not.toBe('/ilan/olustur');
  });

  it('is not a create-listing category and does not bring back investment', () => {
    expect(CREATE_LISTING_PICKER_ORDER).toEqual([]);
    expect(CREATE_LISTING_ROOT_HIDDEN_CATEGORY_IDS).toContain(CATEGORY_IDS.dijitalAi);
    expect(CREATE_LISTING_VENTURE_CATEGORIES_COPY.categories.map((item) => item.label)).not.toContain(
      'Dijital & AI Çözümleri',
    );
    expect(HOME_CATEGORIES.some((item) => item.slug === 'dijital-ai')).toBe(false);
    expect(HOME_CATEGORIES.map((item) => item.label).join(' ')).not.toContain('Yatırım Arıyorum');
    expect(getFooterLinks().Çözümler?.some((link) => link.label === 'Yatırım Arıyorum')).toBe(false);
  });

  it('keeps contact on the existing request flow and hides private card fields', () => {
    expect(isContactRequestEligibleCategory('digital-ai')).toBe(false);
    const listing = createListing({
      ownerId: ids.user('digital-owner'),
      categoryId: CATEGORY_IDS.dijitalAi,
      listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
      title: 'Operasyon asistanı',
      shortDescription: 'KOBİ operasyonlarını otomatikleştiren yazılım çözümü.',
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
      customFields: {
        solutionType: 'Otomasyon & RPA',
        targetAudience: 'KOBİ',
        priceRange: 'Proje bazlı',
      },
    });
    const display = resolveListingCardDisplay(listing);
    const item = listingToContentItem(listing);
    expect(item.title).toBe(listing.title);
    expect(item.description).toContain('KOBİ operasyonlarını');
    expect(display.detail).toContain('Otomasyon & RPA');
    expect(JSON.stringify(item)).not.toMatch(/05551234567|gizli@example.com|customFields|ownerId/);
    expect(isDigitalAiSafePublicHref('/ilan/olustur')).toBe(false);
    expect(isDigitalAiSafePublicHref('/is')).toBe(false);
    expect(isDigitalAiSafePublicHref('/partners')).toBe(false);
    expect(isDigitalAiSafePublicHref('/franchise/buy')).toBe(false);
  });
});

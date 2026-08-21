import { describe, expect, it } from 'vitest';
import {
  FRANCHISE_FLOW_ROUTES,
  VENTURE_PARTNERSHIP_OPTIONS,
} from '@/components/girisimco/home/home-marketplace.data';
import { CREATE_LISTING_FRANCHISE_HUB } from '@/components/girisimco/listing/create-listing-career.data';
import { isContactRequestEligibleCategory, resolveContactCtaLabel } from '@/features/contact-requests/config/contact-cta-copy';
import { CATEGORY_IDS, FRANCHISE_GIVE_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { createListing } from '@/features/listings/factories/listing.factory';
import { listingToContentItem } from '@/features/listings/mappers/listing-card.mapper';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import { ids } from '@/lib/domain/ids';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import {
  extractFranchiseListingDetails,
  resolveFranchiseFlow,
  toPublicFranchiseListing,
} from '@/features/franchise/lib/franchise-listing.mapper';
import {
  FRANCHISE_BROWSE_DESCRIPTION,
  FRANCHISE_BROWSE_TITLE,
  FRANCHISE_CONTACT_CTA,
  FRANCHISE_CREATE_DESCRIPTION,
  FRANCHISE_EMPTY_BACK_CTA,
  FRANCHISE_EMPTY_TITLE,
  FRANCHISE_HUB_DESCRIPTION,
  isFranchiseSafePublicHref,
} from '@/features/franchise/presentation/franchise-copy';
import { NAV_LINKS } from '@/features/shared/constants/navigation';

function franchiseListing() {
  return createListing({
    ownerId: ids.user('franchise-owner'),
    categoryId: CATEGORY_IDS.bayilikAl,
    listingTypeId: FRANCHISE_LISTING_TYPE_IDS.give,
    moduleKey: 'franchise',
    title: 'KafeX Franchise',
    shortDescription: 'Kanıtlanmış kafe modeli ile franchise fırsatı.',
    city: 'İstanbul',
    industry: 'Gıda',
    contactPhone: '05551234567',
    contactEmail: 'gizli@example.com',
    contactWhatsapp: '+905551112233',
    customFields: {
      companyName: 'KafeX',
      sector: 'Gıda',
      businessCategory: 'Cafe & Restoran',
      totalInvestment: 750000,
      franchiseFee: 150000,
      availableCities: ['İstanbul', 'Ankara'],
    },
  });
}

describe('franchise presentation', () => {
  it('keeps hub, browse, create, and contact copy on the franchise path', () => {
    expect(FRANCHISE_FLOW_ROUTES.listings).toBe('/franchise/buy');
    expect(FRANCHISE_HUB_DESCRIPTION).toBe(
      'Kanıtlanmış iş modellerini inceleyin ve size uygun franchise fırsatlarını keşfedin.',
    );
    expect(FRANCHISE_BROWSE_TITLE).toBe('Franchise Fırsatları');
    expect(CREATE_LISTING_FRANCHISE_HUB.title).toBe('Franchise');
    expect(CREATE_LISTING_FRANCHISE_HUB.description).toContain('franchise');
    expect(isContactRequestEligibleCategory('franchise')).toBe(false);
    expect(FRANCHISE_EMPTY_TITLE).toBe('Henüz uygun bir franchise fırsatı bulunmuyor.');
    expect(FRANCHISE_EMPTY_BACK_CTA.href).toBe('/girisim-ortaklik');
    expect(isFranchiseSafePublicHref(FRANCHISE_EMPTY_BACK_CTA.href)).toBe(true);
    expect(isFranchiseSafePublicHref('/is')).toBe(false);
    expect(isFranchiseSafePublicHref('/dashboard/ortaklik-eslesmeleri')).toBe(false);
  });

  it('does not show technical terms or old contact CTAs', () => {
    const copy = [
      FRANCHISE_BROWSE_TITLE,
      FRANCHISE_BROWSE_DESCRIPTION,
      FRANCHISE_HUB_DESCRIPTION,
      FRANCHISE_CREATE_DESCRIPTION,
      FRANCHISE_CONTACT_CTA,
      FRANCHISE_EMPTY_TITLE,
    ].join(' ');
    expect(copy).not.toMatch(/customFields|listing type|mapper|canonical|runtime|intent/i);
    expect(copy).not.toMatch(/Telefonla Ara|WhatsApp|Doğrudan İletişim/);
  });

  it('keeps create form steps in publisher-friendly order', () => {
    const steps = getListingFormSteps(CATEGORY_IDS.bayilikAl);
    expect(steps.map((step) => step.id)).toEqual([
      'basics',
      'investment',
      'details',
      'publish',
    ]);
    expect(steps[0]?.coreFields).toEqual(['title', 'shortDescription']);
    expect(steps[0]?.customFieldKeys).toEqual(
      expect.arrayContaining(['companyName', 'sector']),
    );
    expect(steps[1]?.customFieldKeys).toEqual(
      expect.arrayContaining(['totalInvestment', 'franchiseFee']),
    );
    expect(FRANCHISE_GIVE_FIELD_SCHEMA.fields.find((field) => field.key === 'businessCategory')?.label).toBe(
      'Franchise modeli',
    );
    const formCopy = steps.map((step) => `${step.title} ${step.description ?? ''}`).join(' ');
    expect(formCopy).not.toMatch(/customFields|canonical|mapper|runtime/i);
  });

  it('aligns browse card fields with the franchise mapper', () => {
    const listing = franchiseListing();
    const details = extractFranchiseListingDetails(listing);
    const display = resolveListingCardDisplay(listing);
    const item = listingToContentItem(listing);

    expect(item.title).toBe(listing.title);
    expect(item.location).toContain('İstanbul');
    expect(display.detail).toContain('Gıda');
    expect(display.detail).toContain('Cafe & Restoran');
    expect(display.detail).toContain('750.000');
    expect(details.businessCategory).toBe('Cafe & Restoran');
    expect(details.totalInvestment).toBe(750000);
    expect(JSON.stringify(item)).not.toMatch(/05551234567|gizli@example.com|contactPhone|customFields/);
  });

  it('strips private contact channels from the public franchise listing', () => {
    const listing = franchiseListing();
    const publicListing = toPublicFranchiseListing(listing);
    expect(publicListing.contactPhone).toBeNull();
    expect(publicListing.contactEmail).toBeNull();
    expect(publicListing.contactWhatsapp).toBeNull();
    expect(publicListing.contactWebsite).toBeNull();
    expect(publicListing.title).toBe(listing.title);
    expect(JSON.stringify(publicListing)).not.toContain('05551234567');
  });

  it('keeps legacy buy-type franchise listings on the franchise detail path', () => {
    const listing = createListing({
      ownerId: ids.user('franchise-seeker'),
      categoryId: CATEGORY_IDS.bayilikAl,
      listingTypeId: FRANCHISE_LISTING_TYPE_IDS.buy,
      moduleKey: 'franchise',
      title: 'Kafe franchise arıyorum',
      shortDescription: 'Uygun bir kafe franchise fırsatı arıyorum.',
      status: 'published',
    });
    expect(resolveFranchiseFlow(listing)).toBe('buy');
    expect(listing.status).toBe('published');
    expect(isFranchiseSafePublicHref(`/franchise/buy/${listing.slug}`)).toBe(true);
  });

  it('keeps header IA and franchise deep links isolated from career and partnership matching', () => {
    expect(NAV_LINKS.map((link) => link.href)).toEqual([
      '/is',
      '/girisim-ortaklik',
      '/market',
      '/dijital-ai',
    ]);
    expect(FRANCHISE_FLOW_ROUTES.listings).toBe('/franchise/buy');
    expect(VENTURE_PARTNERSHIP_OPTIONS.map((item) => item.href)).not.toContain('/is');
    expect(VENTURE_PARTNERSHIP_OPTIONS.map((item) => item.href).join(' ')).not.toContain(
      '/dashboard/ortaklik-eslesmeleri',
    );
  });
});

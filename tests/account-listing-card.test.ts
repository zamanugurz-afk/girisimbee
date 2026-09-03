import { describe, it, expect } from 'vitest';
import { mapListingToAccountCard } from '@/features/account/lib/map-listing-to-account-card';
import type { Listing } from '@/lib/types';

describe('Account Listing Card Mapping & Showcase Integrity Suite', () => {
  const sampleListing: Listing = {
    id: 'test-listing-1',
    ownerId: 'test-user-1',
    type: 'employment',
    title: 'Garson',
    description: 'Garson · Yeni Mezun.',
    category: 'garson',
    location: 'İstanbul Avrupa Yakası',
    createdAt: new Date().toISOString(),
    status: 'active',
    isPublished: true,
    isUrgent: false,
    viewCount: 120,
    price: 25000,
  } as unknown as Listing;

  it('correctly maps normal active listing with isUrgentShowcase false', () => {
    const card = mapListingToAccountCard(sampleListing);
    expect(card.id).toBe('test-listing-1');
    expect(card.title).toBe('Garson');
    expect(card.isUrgentShowcase).toBe(false);
    expect(card.status).toBe('active');
  });

  it('correctly maps super listing with isUrgentShowcase true', () => {
    const superListing = { ...sampleListing, isUrgent: true } as unknown as Listing;
    const card = mapListingToAccountCard(superListing);
    expect(card.isUrgentShowcase).toBe(true);
  });
});

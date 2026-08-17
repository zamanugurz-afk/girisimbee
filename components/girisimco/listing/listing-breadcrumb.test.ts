import { describe, expect, it } from 'vitest';
import { resolveListingCategoryHref } from '@/components/girisimco/listing/listing-breadcrumb-href';

describe('listing breadcrumb category routes', () => {
  it('sends career listings to the matching /is flow', () => {
    expect(
      resolveListingCategoryHref({
        category: { id: 'hire', label: 'İşe Alıyorum', accent: '#10B981' },
      }),
    ).toBe('/is?flow=hire');
    expect(
      resolveListingCategoryHref({
        category: { id: 'find-job', label: 'İş Arıyorum', accent: '#0EA5E9' },
      }),
    ).toBe('/is?flow=seek');
  });

  it('keeps seeking and joining partnership breadcrumbs apart', () => {
    expect(
      resolveListingCategoryHref({
        category: { id: 'find-partner', label: 'Ortak Arıyorum', accent: '#F59E0B' },
      }),
    ).toBe('/partners?intent=seeking');
    expect(
      resolveListingCategoryHref({
        category: { id: 'find-partner', label: 'Ortak Olmak İstiyorum', accent: '#F59E0B' },
      }),
    ).toBe('/partners?intent=joining');
  });

  it('routes franchise and digital-ai to their browse pages', () => {
    expect(
      resolveListingCategoryHref({
        category: { id: 'franchise', label: 'Franchise Fırsatları', accent: '#EC4899' },
      }),
    ).toBe('/franchise/buy');
    expect(
      resolveListingCategoryHref({
        category: { id: 'digital-ai', label: 'Dijital & AI Çözümleri', accent: '#8B5CF6' },
      }),
    ).toBe('/dijital-ai');
  });
});

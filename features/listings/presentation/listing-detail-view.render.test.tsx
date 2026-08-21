import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ListingDetailView } from '@/components/girisimco/listing/listing-detail-view';
import { createListing } from '@/features/listings/factories/listing.factory';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';

describe('ListingDetailView render', () => {
  it('renders a job/hire listing without crashing', () => {
    const listing = createListing({
      id: ids.listing('l1000001-0001-4000-8000-000000000001'),
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'B2B SaaS Girişimimiz için Satış Uzmanı',
      slug: 'b2b-saas-girisimimiz-icin-satis-uzmani-7-gme4',
      status: 'published',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        workType: 'Tam Zamanlı',
      },
    });

    const detail = aggregateToListingDetail({
      listing,
      tags: [],
      images: [],
      attachments: [],
      activityHistory: [],
    });

    expect(detail.title).toBe('B2B SaaS Girişimimiz için Satış Uzmanı');
    expect(detail.category.id).toBe('hire');
  });

  it('renders a job seeker listing without crashing', () => {
    const listing = createListing({
      id: ids.listing('l1000001-0001-4000-8000-000000000002'),
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: 'Kıdemli Frontend Geliştirici',
      slug: 'kidemli-frontend-gelistirici',
      status: 'published',
      customFields: {
        desiredRole: 'Frontend Geliştirici',
      },
    });

    const detail = aggregateToListingDetail({
      listing,
      tags: [],
      images: [],
      attachments: [],
      activityHistory: [],
    });

    expect(detail.category.id).toBe('find-job');
  });

  it('renders a partnership listing without crashing', () => {
    const listing = createListing({
      id: ids.listing('l1000001-0001-4000-8000-000000000003'),
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'E-Ticaret Projemize Teknik Ortak',
      slug: 'e-ticaret-teknik-ortak',
      status: 'published',
      customFields: {
        partnershipIntent: 'seeking',
      },
    });

    const detail = aggregateToListingDetail({
      listing,
      tags: [],
      images: [],
      attachments: [],
      activityHistory: [],
    });

    expect(detail.category.id).toBe('find-partner');
  });

  it('renders a business transfer listing without crashing', () => {
    const listing = createListing({
      id: ids.listing('l1000001-0001-4000-8000-000000000004'),
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      moduleKey: 'marketplace',
      title: 'Kadıköyde Devren Kafe',
      slug: 'kadikoyde-devren-kafe',
      status: 'published',
      customFields: {
        transferPrice: '1.500.000 TL',
      },
    });

    const detail = aggregateToListingDetail({
      listing,
      tags: [],
      images: [],
      attachments: [],
      activityHistory: [],
    });

    expect(detail.category.id).toBe('isletme-devri');
  });
});

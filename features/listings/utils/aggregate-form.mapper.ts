import type { ListingAggregate } from '@/features/listings/types/listing-engine.types';
import type { ListingFormValues } from '@/features/listings/form/dynamic-listing-form';

export function aggregateToFormValues(aggregate: ListingAggregate): ListingFormValues {
  const { listing, tags, images } = aggregate;
  return {
    core: {
      title: listing.title,
      shortDescription: listing.shortDescription,
      longDescription: listing.longDescription,
      location: listing.location,
      city: listing.city,
      country: listing.country,
      remotePolicy: listing.remotePolicy,
      companyId: listing.companyId,
    },
    customFields: listing.customFields,
    tags: tags.map((tag) => tag.name),
    images: [...images]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((image) => ({
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    })),
  };
}

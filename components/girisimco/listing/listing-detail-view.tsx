import { ListingBreadcrumb } from '@/components/girisimco/listing/listing-breadcrumb';
import { ListingHeader } from '@/components/girisimco/listing/listing-header';
import { ListingMainContent } from '@/components/girisimco/listing/listing-main-content';
import { ListingSidebar } from '@/components/girisimco/listing/listing-sidebar';
import { ListingSimilar } from '@/components/girisimco/listing/listing-similar';
import type { ListingDetail } from '@/features/listings';

interface ListingDetailViewProps {
  listing: ListingDetail;
}

export function ListingDetailView({ listing }: ListingDetailViewProps) {
  return (
    <main className="pt-14">
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
          <ListingBreadcrumb listing={listing} />

          <div className="mt-6">
            <ListingHeader listing={listing} />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_340px]">
            <ListingMainContent listing={listing} />
            <ListingSidebar listing={listing} />
          </div>

          <ListingSimilar listing={listing} />
        </div>
    </main>
  );
}

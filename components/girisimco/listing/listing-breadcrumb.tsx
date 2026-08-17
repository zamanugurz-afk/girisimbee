import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { ListingDetail } from '@/features/listings';
import { resolveListingCategoryHref } from '@/components/girisimco/listing/listing-breadcrumb-href';

interface ListingBreadcrumbProps {
  listing: ListingDetail;
}

export function ListingBreadcrumb({ listing }: ListingBreadcrumbProps) {
  const categoryHref = resolveListingCategoryHref(listing);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="text-muted-foreground hover:text-foreground dark:hover:text-white">
              Ana Sayfa
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-muted-foreground" />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href={categoryHref}
              className="text-muted-foreground hover:text-foreground dark:hover:text-white"
            >
              {listing.category.label}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-muted-foreground" />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-foreground">İlan</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

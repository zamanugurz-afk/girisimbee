import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { DetailSection } from '@/components/girisimco/listing/detail-primitives';
import { listingHref, type ListingDetail } from '@/features/listings';
import { cn } from '@/lib/utils';

interface ListingSimilarProps {
  listing: ListingDetail;
}

export function ListingSimilar({ listing }: ListingSimilarProps) {
  if (listing.similar.length === 0) return null;

  return (
    <DetailSection title="Benzer İlanlar" className="mt-14 border-t border-border/80 pt-10 dark:border-white/10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {listing.similar.map((item) => (
          <Link
            key={item.id}
            href={listingHref(item.id)}
            className={cn(
              'group flex flex-col rounded-[24px] border border-border/80 bg-white p-4 transition-all duration-200',
              'hover:gc-shadow-soft hover:-translate-y-0.5',
              'dark:border-white/10 dark:bg-card/90',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0" role="img" aria-hidden>
                  {item.emoji}
                </span>
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {item.location}
            </div>
            <p className="mt-2 text-sm font-medium text-[#16A34A]">{item.detail}</p>
            <span className="mt-3 self-start rounded-md bg-[#22C55E]/8 px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
              {item.tag}
            </span>
          </Link>
        ))}
      </div>
    </DetailSection>
  );
}

import Link from 'next/link';
import { ArrowUpRight, Clock3, Layers3, MapPin, Sparkles } from 'lucide-react';
import { DetailSection } from '@/components/girisimco/listing/detail-primitives';
import { listingHref, type ListingDetail, type ListingSimilar as SimilarItem } from '@/features/listings';
import { cn } from '@/lib/utils';

interface ListingSimilarProps {
  listing: ListingDetail;
}

function SimilarCard({ item }: { item: SimilarItem }) {
  return (
    <Link
      href={listingHref(item.id)}
      className={cn(
        'group flex flex-col rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-lg" role="img" aria-hidden>
            {item.emoji}
          </span>
          <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {item.location}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground/80">{item.detail}</p>
      <span className="mt-3 self-start rounded-2xl bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
        {item.tag}
      </span>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function RelatedBlock({
  title,
  icon: Icon,
  description,
  items,
  emptyMessage,
}: {
  title: string;
  icon: typeof Sparkles;
  description: string;
  items: SimilarItem[];
  emptyMessage: string;
}) {
  return (
    <DetailSection title={title} description={description}>
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-xs">{items.length} ilan</span>
      </div>
      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <SimilarCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </DetailSection>
  );
}

export function ListingSimilar({ listing }: ListingSimilarProps) {
  const similar = listing.similar;
  const sameCategory = similar.filter((item) => item.tag === listing.category.label);
  const latest = similar.slice(0, 4);

  return (
    <div className="mt-14 space-y-12 border-t border-border/80 pt-10 dark:border-white/10">
      <RelatedBlock
        title="Benzer ilanlar"
        icon={Sparkles}
        description="Bu ilana yakın fırsatlar"
        items={similar}
        emptyMessage="Henüz benzer ilan bulunmuyor."
      />
      <RelatedBlock
        title="Aynı kategorideki ilanlar"
        icon={Layers3}
        description={`${listing.category.label} kategorisinden seçkiler`}
        items={sameCategory.length > 0 ? sameCategory : similar}
        emptyMessage="Bu kategoride başka ilan gösterilemiyor."
      />
      <RelatedBlock
        title="Son eklenen ilanlar"
        icon={Clock3}
        description="Yeni yayınlanan fırsatlar"
        items={latest}
        emptyMessage="Son eklenen ilanlar yakında burada listelenecek."
      />
    </div>
  );
}

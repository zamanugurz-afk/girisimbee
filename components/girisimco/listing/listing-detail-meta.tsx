'use client';

import {
  Calendar,
  CircleDot,
  Eye,
  Hash,
  Heart,
  MapPin,
  RefreshCw,
  Tag,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import type { ListingDetail } from '@/features/listings';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';
import type { LucideIcon } from 'lucide-react';

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ListingDetailMeta({ listing }: { listing: ListingDetail }) {
  const subcategory =
    listing.tags.find((tag) => tag.trim().length > 0) ?? null;
  const showLocation =
    (listing.category.id === 'find-job' || listing.category.id === 'hire')
    && !isEmptyDisplayValue(listing.location);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="rounded-full border-border/80 px-3 py-1 text-xs font-medium dark:border-white/10"
          style={{
            backgroundColor: `${listing.category.accent}12`,
            color: listing.category.accent,
            borderColor: `${listing.category.accent}35`,
          }}
        >
          {listing.category.label}
        </Badge>
        {listing.verified && listing.publisher.trust ? (
          <VerifiedBadgeGroup
            user={listing.publisher.trust.user}
            company={listing.publisher.trust.company}
            investor={listing.publisher.trust.investor}
            showLabel
          />
        ) : null}
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          Yayında
        </Badge>
      </div>

      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight">
        {listing.title}
      </h1>

      {!isEmptyDisplayValue(listing.shortDescription) ? (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {listing.shortDescription}
        </p>
      ) : null}

      <div className="mt-6 grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
        {listing.listingNumber ? (
          <MetaRow icon={Hash} label="İlan no" value={listing.listingNumber} />
        ) : null}
        <MetaRow icon={Tag} label="Kategori" value={listing.category.label} />
        {showLocation ? (
          <MetaRow icon={MapPin} label="Konum" value={listing.location} />
        ) : (
          <MetaRow
            icon={Tag}
            label="Alt kategori"
            value={subcategory ?? '—'}
          />
        )}
        {showLocation && subcategory ? (
          <MetaRow icon={Tag} label="Dil / etiket" value={subcategory} />
        ) : null}
        <MetaRow
          icon={Calendar}
          label="Yayın tarihi"
          value={!isEmptyDisplayValue(listing.publishedAt) ? listing.publishedAt : '—'}
        />
        <MetaRow
          icon={RefreshCw}
          label="Son güncelleme"
          value={!isEmptyDisplayValue(listing.updatedAt) ? listing.updatedAt! : '—'}
        />
        <MetaRow icon={CircleDot} label="İlan durumu" value="Yayında" />
        <MetaRow icon={Eye} label="Görüntülenme" value={listing.views.toLocaleString('tr-TR')} />
        <MetaRow
          icon={Heart}
          label="Favori"
          value={listing.interestedCount.toLocaleString('tr-TR')}
        />
        <MetaRow icon={Users} label="Takipçi" value="—" />
      </div>
    </div>
  );
}

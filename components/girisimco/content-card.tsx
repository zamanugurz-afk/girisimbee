import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import { ContactAction } from '@/features/shared/premium';
import { listingHref } from '@/features/listings/services/listing.service';
import type { ContentItem } from '@/features/categories';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { GcTag } from '@/components/girisimco/ui/gc-tag';
import { ListingTypeIconBadge } from '@/components/girisimco/listing/listing-type-icon';
import { GC_ACCENT } from '@/lib/design-system';
import { cn } from '@/lib/utils';

function listingBadgeTone(iconKey: ContentItem['listingIconKey']): string {
  switch (iconKey) {
    case 'investor':
    case 'franchise':
      return 'bg-[#FEF3C7] text-[#B45309]';
    case 'job-seeker':
    case 'employer':
      return 'bg-[#EDE9FE] text-[#6D28D9]';
    case 'partner':
      return 'bg-[#FEF9C3] text-[#A16207]';
    case 'digital':
      return 'bg-[#E0E7FF] text-[#4338CA]';
    case 'investment':
    default:
      return 'bg-[#EEF2FF] text-[#4F46E5]';
  }
}

interface ContentCardProps {
  item: ContentItem;
  accent?: string;
}

function Avatar({ initials, accent }: { initials: string; accent?: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-soft"
      style={{ backgroundColor: accent ?? GC_ACCENT }}
    >
      {initials}
    </div>
  );
}

function TypeIcon({ type }: { type: ContentItem['type'] }) {
  const cls = 'h-4 w-4 text-muted-foreground';
  switch (type) {
    case 'person':
      return <User className={cls} />;
    case 'job':
      return <Briefcase className={cls} />;
    case 'company':
      return <Building2 className={cls} />;
    case 'article':
    case 'story':
      return <BookOpen className={cls} />;
    default:
      return null;
  }
}

export function ContentCard({ item, accent }: ContentCardProps) {
  const isArticle = item.type === 'article' || item.type === 'story';
  const isListingCard = Boolean(item.listingId && item.listingTypeLabel);
  const listingLink = item.href ?? (item.listingId ? listingHref(item.id) : null);
  const resolvedAccent = accent ?? item.listingGroupColor ?? GC_ACCENT;

  const card = isListingCard ? (
    <TextListingCardLayout item={item} listingLink={listingLink} />
  ) : (
    <LegacyContentCardLayout
      item={item}
      isArticle={isArticle}
      listingLink={listingLink}
      resolvedAccent={resolvedAccent}
    />
  );

  if (listingLink) {
    return (
      <Link href={listingLink} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}

/** Browse cards are text-first (no cover). Detail pages still show gallery images. */
function TextListingCardLayout({
  item,
  listingLink,
}: {
  item: ContentItem;
  listingLink: string | null;
}) {
  const accent = item.listingGroupColor ?? GC_ACCENT;
  const badgeLabel = item.listingGroupLabel ?? item.listingTypeLabel ?? 'İlan';

  return (
    <article
      className={cn(
        'group relative flex h-full min-h-[14rem] flex-col overflow-hidden rounded-2xl border border-[#E6E8EE] bg-white',
        'px-4 pb-4 pt-4 transition duration-200',
        'shadow-[0_1px_2px_rgba(15,23,42,0.03)]',
        'hover:-translate-y-0.5 hover:border-[#D0D4DE] hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)]',
        'dark:border-border dark:bg-card',
        listingLink && 'cursor-pointer',
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3 pl-1.5 pr-8">
        <span
          className={cn(
            'inline-flex max-w-[65%] truncate rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide',
            listingBadgeTone(item.listingIconKey),
          )}
        >
          {badgeLabel}
        </span>
        {item.price ? (
          <span className="shrink-0 text-right font-display text-[12px] font-bold tabular-nums leading-tight tracking-tight text-[#0B1220] dark:text-foreground">
            {item.price}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 line-clamp-2 pl-1.5 font-display text-[15px] font-semibold leading-snug tracking-tight text-[#0B1220] dark:text-foreground">
        {item.title}
      </h3>

      {item.description ? (
        <p className="mt-2 line-clamp-2 flex-1 pl-1.5 text-[12.5px] leading-relaxed text-[#64748B]">
          {item.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4 flex items-center gap-3 border-t border-[#F1F3F7] pt-3 pl-1.5 text-[11px] text-[#64748B]">
        {item.location ? (
          <span className="inline-flex min-w-0 flex-1 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
            <span className="truncate">{item.location}</span>
          </span>
        ) : (
          <span className="flex-1" />
        )}
        {item.timeAgo ? (
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className="h-3.5 w-3.5 opacity-60" aria-hidden />
            {item.timeAgo}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function LegacyContentCardLayout({
  item,
  isArticle,
  listingLink,
  resolvedAccent,
}: {
  item: ContentItem;
  isArticle: boolean;
  listingLink: string | null;
  resolvedAccent: string;
}) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col gc-card-interactive p-4',
        isArticle && 'sm:flex-row sm:items-center sm:gap-4',
        listingLink && 'cursor-pointer',
      )}
    >
      {item.type === 'person' && item.initials && (
        <div className="mb-3 flex items-start gap-3 sm:mb-0">
          <Avatar initials={item.initials} accent={resolvedAccent} />
          <div className="min-w-0 flex-1">
            <CardHeader item={item} />
            <CardBody item={item} accent={resolvedAccent} />
          </div>
        </div>
      )}

      {item.type !== 'person' && (
        <>
          <CardHeader item={item} />
          <CardBody item={item} accent={resolvedAccent} />
        </>
      )}

      {!isArticle && (
        <div className="mt-auto pt-3">
          <CardFooter item={item} accent={resolvedAccent} listingLink={listingLink} />
        </div>
      )}

      {isArticle && (
        <div className="mt-3 flex items-center justify-between sm:mt-0 sm:ml-auto sm:flex-col sm:items-end sm:gap-2">
          {item.meta && <span className="text-xs text-muted-foreground">{item.meta}</span>}
          <button
            type="button"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-primary"
          >
            Oku
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </article>
  );
}

function CardHeader({ item }: { item: ContentItem }) {
  if (item.type === 'person') {
    return (
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
          {item.trust && (
            <VerifiedBadgeGroup
              user={item.trust.user}
              company={item.trust.company}
              investor={item.trust.investor}
            />
          )}
          {item.subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
          )}
        </div>
        {item.timeAgo && (
          <span className="shrink-0 text-[11px] text-muted-foreground">{item.timeAgo}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        {item.emoji && (
          <span className="shrink-0 text-lg" role="img" aria-hidden>
            {item.emoji}
          </span>
        )}
        {!item.emoji && item.type !== 'article' && item.type !== 'story' && (
          <TypeIcon type={item.type} />
        )}
        <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
        {item.trust && (
          <VerifiedBadgeGroup
            user={item.trust.user}
            company={item.trust.company}
            investor={item.trust.investor}
          />
        )}
      </div>
      {item.timeAgo && (
        <span className="shrink-0 text-[11px] text-muted-foreground">{item.timeAgo}</span>
      )}
    </div>
  );
}

function CardBody({ item, accent }: { item: ContentItem; accent?: string }) {
  if (item.type === 'person') {
    return (
      <div className="mt-2 space-y-1">
        {item.detail && (
          <p className="text-xs font-medium text-foreground">{item.detail}</p>
        )}
        {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
      </div>
    );
  }

  if (item.type === 'job') {
    return (
      <div className="mt-2 space-y-1">
        {item.subtitle && (
          <p className="text-xs font-medium text-muted-foreground">{item.subtitle}</p>
        )}
        {item.detail && (
          <p className="text-sm font-medium" style={{ color: accent }}>
            {item.detail}
          </p>
        )}
        {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
      </div>
    );
  }

  if (item.type === 'article' || item.type === 'story') {
    return (
      <div className="mt-1.5">
        {item.detail && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {item.detail && (
        <p className="text-xs font-medium text-foreground">{item.detail}</p>
      )}
      {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
    </div>
  );
}

function CardFooter({
  item,
  accent,
  listingLink,
}: {
  item: ContentItem;
  accent?: string;
  listingLink?: string | null;
}) {
  const contactVariant =
    item.type === 'person' ? 'profile' : item.type === 'job' ? 'message' : 'detail';

  return (
    <div className="flex items-center justify-between">
      {item.tag && (
        <GcTag variant="category" color={accent}>
          {item.tag}
        </GcTag>
      )}
      {item.trust && (
        <VerifiedBadgeGroup
          user={item.trust.user}
          company={item.trust.company}
          investor={item.trust.investor}
          className={item.tag ? '' : 'ml-0'}
        />
      )}
      {listingLink ? (
        <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-primary">
          Detay
          <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
        </span>
      ) : (
        <ContactAction variant={contactVariant} className="ml-auto" />
      )}
    </div>
  );
}

export function ContentCardCompact({ item, accent }: ContentCardProps) {
  const resolvedAccent = accent ?? GC_ACCENT;

  return (
    <button
      type="button"
      className="group flex w-full items-center gap-3 rounded-xl border border-border/80 bg-card p-3 text-left shadow-soft transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card"
    >
      {item.initials ? (
        <Avatar initials={item.initials} accent={resolvedAccent} />
      ) : item.emoji ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/60 text-lg">
          {item.emoji}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.subtitle ?? item.detail ?? item.location}
        </p>
      </div>
      {item.timeAgo && (
        <span className="shrink-0 text-[11px] text-muted-foreground">{item.timeAgo}</span>
      )}
    </button>
  );
}

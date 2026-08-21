import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { ContactAction } from '@/features/shared/premium';
import { listingHref } from '@/features/listings/services/listing.service';
import type { ContentItem } from '@/features/categories';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { GcTag } from '@/components/girisimco/ui/gc-tag';
import { LISTING_TYPE_ICON_MAP } from '@/components/girisimco/listing/listing-type-icon';
import { buttonVariants } from '@/components/ui/button';
import { GC_ACCENT } from '@/lib/design-system';
import { cn } from '@/lib/utils';

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

/** Linear-grade compact marketplace listing card. */
function TextListingCardLayout({
  item,
  listingLink,
}: {
  item: ContentItem;
  listingLink: string | null;
}) {
  const accent = item.listingGroupColor ?? GC_ACCENT;
  const typeLabel = item.listingTypeLabel ?? item.listingGroupLabel ?? 'İlan';
  const Icon = LISTING_TYPE_ICON_MAP[item.listingIconKey ?? 'general'];
  const isContactEligible = item.listingIconKey === 'job-seeker' || item.listingIconKey === 'partner';
  const compactPrice = item.price && !item.price.includes('·') ? item.price : undefined;
  const description = item.description || item.detail;

  return (
    <article
      className={cn(
        'group relative flex h-full min-h-[12.5rem] flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5',
        'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md',
        'border border-slate-200/80 dark:border-zinc-800 rounded-2xl',
        'shadow-sm transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md dark:hover:border-zinc-700',
        listingLink && 'cursor-pointer',
      )}
    >
      <div>
        {/* Top Meta Row: Icon + Type Pill + PII Badge + Price */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: `${accent}12`, color: accent }}
            >
              <Icon className="h-3 w-3" />
              <span>{typeLabel}</span>
            </span>
            {isContactEligible ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>İletişim Talebi 🔒</span>
              </span>
            ) : null}
          </div>

          {compactPrice ? (
            <span className="shrink-0 rounded-lg bg-emerald-500/10 px-2 py-0.5 font-display text-[11px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {compactPrice}
            </span>
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </div>

        {/* Title */}
        <h3 className="mt-3 line-clamp-2 font-display text-[14px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
          {item.title}
        </h3>

        {/* Open Company Name (for employer hiring listings) */}
        {item.companyName ? (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.companyName}</span>
          </div>
        ) : null}

        {/* Description */}
        {description ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>

      {/* Footer Meta Strip */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        <div className="flex items-center gap-3">
          {item.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[110px]">{item.location}</span>
            </span>
          )}
          {item.timeAgo && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{item.timeAgo}</span>
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-0.5 font-semibold text-zinc-600 dark:text-zinc-300 transition-colors group-hover:text-primary">
          İncele
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
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

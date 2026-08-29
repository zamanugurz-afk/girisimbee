import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  Coins,
  Handshake,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Wrench,
  Zap,
} from 'lucide-react';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import type { ListingId } from '@/lib/domain/ids';
import { ContactAction } from '@/features/shared/premium';
import { listingHref } from '@/features/listings/services/listing.service';
import type { ContentItem } from '@/features/categories';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { GcTag } from '@/components/girisimco/ui/gc-tag';
import { LISTING_TYPE_ICON_MAP } from '@/components/girisimco/listing/listing-type-icon';
import { buttonVariants } from '@/components/ui/button';
import { GC_ACCENT } from '@/lib/design-system';
import { cn } from '@/lib/utils';

import { resolveContextualListingImage } from '@/features/listings/services/contextual-listing-image-resolver';

interface ContentCardProps {
  item: ContentItem;
  accent?: string;
}

function Avatar({ initials, accent }: { initials: string; accent?: string }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
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

/** Exclusive 2. Resim tasarımı: Görsel, Rozetler, Şirket Satırı, Metadata Yığını & Siyah İncele Butonu. */
function TextListingCardLayout({
  item,
  listingLink,
}: {
  item: ContentItem;
  listingLink: string | null;
}) {
  const accent = item.listingGroupColor ?? GC_ACCENT;
  const typeLabel = item.listingTypeLabel ?? item.listingGroupLabel ?? 'İlan';
  const Icon = (item.listingIconKey && LISTING_TYPE_ICON_MAP[item.listingIconKey as keyof typeof LISTING_TYPE_ICON_MAP]) || LISTING_TYPE_ICON_MAP.general;
  const compactPrice = item.price && !item.price.includes('·') ? item.price : undefined;
  const description = item.description || item.detail;
  const displayImage = resolveContextualListingImage({
    title: item.title,
    description: description,
    categorySlug: item.listingGroupLabel || item.tag,
    categoryName: typeLabel,
    sector: item.sector,
    imageUrl: item.imageUrl,
    coverUrl: item.coverUrl,
  });

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem]',
        'bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800',
        'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out',
        'hover:border-amber-500/50 hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-1.5',
        listingLink && 'cursor-pointer',
      )}
    >
      {/* 1. Üst Görsel Alanı (16:10 Oran, Köşeli Rozet & Favori Butonu) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
        <Image
          src={displayImage}
          alt={item.title}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
          unoptimized
        />

        {/* Görsel Üzeri Hafif Karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Sol Üstte Işıltılı Kategori Hapı (Görsel İçi) */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/65 backdrop-blur-md text-white text-[11px] font-bold shadow-md border border-white/15">
            {Icon ? <Icon className="h-3.5 w-3.5 text-amber-400" /> : <Sparkles className="h-3.5 w-3.5 text-amber-400" />}
            <span>{typeLabel}</span>
          </span>
        </div>

        {/* Sağ Üst Favori Butonu */}
        {item.listingId && (
          <div className="absolute top-3 right-3 z-10">
            <div className="rounded-xl bg-black/40 backdrop-blur-md p-1 border border-white/10 hover:bg-black/60 transition-colors">
              <FavoriteButton listingId={item.listingId as ListingId} title={item.title} />
            </div>
          </div>
        )}
      </div>

      {/* 2. Kart Gövdesi */}
      <div className="flex flex-1 flex-col p-4">
        
        {/* Görsel Altı Rozet Satırı (Kategori & Doğrulanmış Rozeti) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            {Icon ? <Icon className="h-3 w-3" /> : null}
            <span>{typeLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 dark:bg-zinc-800 text-white text-[11px] font-bold shadow-2xs">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Doğrulanmış
          </span>
        </div>

        {/* İlan Başlığı */}
        <h3 className="mt-2.5 line-clamp-1 font-display text-[15px] font-bold leading-snug text-slate-900 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
          {item.title}
        </h3>

        {/* 2 Satır Kısa Açıklama */}
        {description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-400 font-normal">
            {description}
          </p>
        ) : null}

        {/* Şirket / Yayıncı Satırı */}
        <div className="mt-2.5 flex items-center gap-1.5 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            <Building2 className="h-3 w-3 text-slate-500" />
          </div>
          <span className="truncate text-xs font-bold text-slate-800 dark:text-zinc-200">
            {item.companyName || (item.trust?.company ? 'Kurumsal Girişim' : 'Doğrulanmış Üye')}
          </span>
        </div>

        {/* 3. Alt Metadata Yığını & Siyah İncele Butonu */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-end justify-between gap-2">
          
          {/* Sol: Değerleme/Fiyat, Lokasyon ve Zaman */}
          <div className="min-w-0 flex-1 flex flex-col gap-0.5 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {compactPrice && (
              <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-zinc-100 truncate">
                <Coins className="h-3 w-3 text-amber-500 shrink-0" />
                <span className="truncate">{compactPrice}</span>
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{item.location}</span>
              </span>
            )}
            {item.timeAgo && (
              <span className="inline-flex items-center gap-1 truncate">
                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{item.timeAgo}</span>
              </span>
            )}
          </div>

          {/* Sağ: Şık Siyah İncele Butonu */}
          <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs shadow-xs transition-all group-hover:scale-105">
            <span>İncele</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

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
        <div className="ml-auto flex items-center gap-2.5">
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-primary">
            Detay
            <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
          </span>
          {item.listingId && (
            <>
              <span className="h-3.5 w-px bg-border/80 shrink-0" aria-hidden />
              <FavoriteButton listingId={item.listingId as ListingId} title={item.title} />
            </>
          )}
        </div>
      ) : (
        <div className="ml-auto flex items-center gap-2.5">
          <ContactAction variant={contactVariant} />
          {item.listingId && (
            <>
              <span className="h-3.5 w-px bg-border/80 shrink-0" aria-hidden />
              <FavoriteButton listingId={item.listingId as ListingId} title={item.title} />
            </>
          )}
        </div>
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

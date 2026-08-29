'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin, Sparkles, Zap } from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { ListingId } from '@/lib/domain/ids';
import { resolveContextualListingImage } from '@/features/listings/services/contextual-listing-image-resolver';
import { listingHref } from '@/features/listings/services/listing.service';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { cn } from '@/lib/utils';

interface ExploreSuperVitrinProps {
  items: ContentItem[];
  onViewAllSuper?: () => void;
  className?: string;
}

const ITEMS_PER_PAGE = 4;
const AUTO_ROTATE_INTERVAL_MS = 10000; // 10 saniye

export function ExploreSuperVitrin({
  items,
  onViewAllSuper,
  className,
}: ExploreSuperVitrinProps) {
  // Yalnızca süper / acil veya öne çıkan ilanlar
  const superItems = useMemo(() => {
    const urgents = items.filter((item) => item.isUrgent || item.isShowcase);
    if (urgents.length > 0) return urgents;
    return items.slice(0, 8);
  }, [items]);

  const [pageIndex, setPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalPages = Math.ceil(superItems.length / ITEMS_PER_PAGE);

  // 10 saniyede bir sonraki 4'lüye otomatik geçiş
  useEffect(() => {
    if (isPaused || totalPages <= 1) return;

    const interval = setInterval(() => {
      setPageIndex((prev) => (prev + 1) % totalPages);
    }, AUTO_ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [totalPages, isPaused]);

  if (superItems.length === 0) return null;

  const visibleItems = superItems.slice(
    pageIndex * ITEMS_PER_PAGE,
    pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  const handlePrev = () => {
    setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setPageIndex((prev) => (prev + 1) % totalPages);
  };

  return (
    <section
      className={cn('mb-10 min-w-0', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Süper İlanlar Vitrini"
    >
      {/* BAŞLIK VE SAYFALAMA ŞERİDİ */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-xs">
            <Zap className="h-4 w-4 fill-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Süper İlanlar</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Vitrin
            </span>
          </h2>
        </div>

        {/* SAĞ TARAF: OKLAR & TÜMÜNÜ GÖR */}
        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
                aria-label="Önceki vitrin ilanları"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 px-1 tabular-nums">
                {pageIndex + 1}/{totalPages}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
                aria-label="Sonraki vitrin ilanları"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {onViewAllSuper && (
            <button
              type="button"
              onClick={onViewAllSuper}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline px-2 py-1"
            >
              Tüm Süper İlanlar ({superItems.length})
            </button>
          )}
        </div>
      </div>

      {/* 4'LÜ VİTRİN KARTLARI IZGARASI (Görsel 1 ile Birebir Altın Çerçeveli) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {visibleItems.map((item) => {
          const itemHref = item.href ?? (item.listingId ? listingHref(item.id) : `/ilan/${item.id}`);
          const displayImage = resolveContextualListingImage({
            title: item.title,
            description: item.description || item.detail,
            categorySlug: item.listingGroupLabel || item.tag,
            categoryName: item.listingTypeLabel || 'İlan',
            sector: item.sector,
            imageUrl: item.imageUrl,
            coverUrl: item.coverUrl,
          });

          return (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-amber-400/80 dark:border-amber-500/70 bg-white dark:bg-zinc-900/90 shadow-[0_4px_20px_rgba(245,158,11,0.12)] dark:shadow-[0_4px_20px_rgba(245,158,11,0.06)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.24)] hover:border-amber-500 transition-all duration-300"
            >
              {/* ÜST GÖRSEL ALANI */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                <Image
                  src={displayImage}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  unoptimized
                />
                
                {/* Karartma degrade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* SÜPER İLAN ROZETİ (Görsel 1'deki gibi sağ üstte altın kutu) */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    <Zap className="h-3 w-3 fill-slate-950" />
                    <span>SÜPER İLAN</span>
                  </span>
                </div>

                {/* Favori Butonu */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <FavoriteButton listingId={(item.listingId ?? item.id) as ListingId} title={item.title} />
                </div>
              </div>

              {/* KART İÇERİK BİLGİSİ */}
              <div className="flex flex-1 flex-col p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
                    {item.sector || item.listingTypeLabel || item.listingGroupLabel || 'Girişimbee İlanı'}
                  </p>
                </div>

                {/* Konum & Fiyat (varsa) */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
                  <span className="inline-flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{item.location || 'Türkiye'}</span>
                  </span>
                </div>

                {/* İNCELE BUTONU */}
                <Link
                  href={itemHref}
                  className="mt-3 flex h-9 w-full items-center justify-center rounded-xl border border-amber-400/80 bg-amber-50/50 hover:bg-amber-500 text-amber-900 hover:text-slate-950 dark:bg-amber-500/10 dark:hover:bg-amber-500 dark:text-amber-300 dark:hover:text-slate-950 text-xs font-bold transition-all duration-200 shadow-2xs"
                >
                  <span>İncele</span>
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Wrench, ChevronLeft, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { resolveCategorySlug, getCategoryRoutePath } from '@/features/listings/config/marketplace.config';
import { useMarketplaceBrowse } from '@/features/listings/hooks/use-marketplace-browse';
import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';
import { ListingFilters } from '@/components/girisimco/marketplace/listing-filters';
import { ListingFeed } from '@/components/girisimco/marketplace/listing-feed';
import { ListingFeedSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import { MarketplaceSearchBar } from '@/components/girisimco/marketplace/marketplace-search-bar';
import { ExploreSuperVitrin } from '@/components/girisimco/marketplace/explore-super-vitrin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 40;

function getVisiblePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

interface MarketplaceBrowsePageProps {
  categorySlug?: string;
  initialQuery?: string;
  initialFilters?: Partial<MarketplaceFilterState>;
  title?: string;
  description?: string;
  eyebrow?: string;
  accent?: string;
  backHref?: string;
  backLabel?: string;
  hideCategoryFilter?: boolean;
  showJobFlowFilters?: boolean;
  showVentureFlowFilters?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCta?: { label: string; href: string };
  relatedCategorySlugs?: string[];
  resultNoun?: string;
}

export function MarketplaceBrowseView({
  categorySlug,
  initialQuery,
  initialFilters,
  title,
  description,
  eyebrow,
  accent,
  backHref,
  backLabel,
  hideCategoryFilter,
  showJobFlowFilters = false,
  showVentureFlowFilters,
  emptyTitle,
  emptyDescription,
  emptyCta,
  relatedCategorySlugs,
  resultNoun = 'ilan',
}: MarketplaceBrowsePageProps) {
  const categoryMeta = categorySlug ? resolveCategorySlug(categorySlug) : null;
  const headerAccent = accent ?? categoryMeta?.accent;

  const {
    items,
    total,
    isLoading,
    error,
    filters,
    updateFilters,
    refresh,
  } = useMarketplaceBrowse({
    initialCategorySlug: categorySlug,
    initialQuery,
    initialFilters,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Filtreler veya arama terimi değiştiğinde 1. sayfaya dön
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, initialQuery]);

  const feedAccent =
    filters.jobFlow === 'seek'
      ? JOB_SEEKER_CARD_COLOR
      : filters.jobFlow === 'hire'
        ? JOB_HIRE_CARD_COLOR
        : headerAccent;
  const hasExtraFilters = Boolean(
    filters.query
    || filters.city
    || filters.isFeatured
    || filters.isUrgent
    || filters.publishedAfter,
  );
  const relatedCategories = (relatedCategorySlugs ?? ['ortak-bul', 'bayilik-al', 'ise-al', 'dijital-ai'])
    .filter((slug) => slug !== categorySlug)
    .map((slug) => ({ slug, meta: resolveCategorySlug(slug) }))
    .filter((item): item is { slug: string; meta: NonNullable<typeof item.meta> } => Boolean(item.meta));

  const isCareerCategory = categorySlug === 'ise-al' || categorySlug === 'is-ariyorum';
  const resolvedAuraColor = isCareerCategory
    ? filters.jobFlow === 'seek'
      ? '#0EA5E9'
      : '#10B981'
    : (headerAccent ?? '#3B82F6');

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Sektör filtresi
      if (filters.sector) {
        const itemSector = item.sector?.toLowerCase() ?? '';
        const targetSector = filters.sector.toLowerCase();
        if (!itemSector.includes(targetSector) && !targetSector.includes(itemSector)) {
          return false;
        }
      }
      // 2. Pozisyon filtresi (Kariyer)
      if (filters.position) {
        const pos = (item.position || item.title || '').toLowerCase();
        const targetPos = filters.position.toLowerCase();
        if (!pos.includes(targetPos) && !targetPos.includes(pos)) {
          return false;
        }
      }
      // 3. Deneyim seviyesi / çalışma şekli filtresi (Kariyer)
      if (filters.careerLevel) {
        const lvl = (item.experienceLevel || '').toLowerCase();
        const targetLvl = filters.careerLevel.toLowerCase();
        if (!lvl.includes(targetLvl) && !targetLvl.includes(lvl)) {
          return false;
        }
      }
      // 4. Ortaklık Aşaması (Ortaklık)
      if (filters.stage) {
        const st = (item.stage || '').toLowerCase();
        const targetSt = filters.stage.toLowerCase();
        if (!st.includes(targetSt) && !targetSt.includes(st)) {
          return false;
        }
      }
      // 5. Aranan Ortak Tipi (Ortaklık)
      if (filters.partnerType) {
        const pt = (item.partnerType || '').toLowerCase();
        const targetPt = filters.partnerType.toLowerCase();
        if (!pt.includes(targetPt) && !targetPt.includes(pt)) {
          return false;
        }
      }
      // 6. İşletme Türü (İşletme Devri)
      if (filters.businessType) {
        const bt = (item.businessType || '').toLowerCase();
        const targetBt = filters.businessType.toLowerCase();
        if (!bt.includes(targetBt) && !targetBt.includes(bt)) {
          return false;
        }
      }
      // 7. Franchise / Konsept Türü (Franchise)
      if (filters.conceptType) {
        const ct = (item.conceptType || '').toLowerCase();
        const targetCt = filters.conceptType.toLowerCase();
        if (!ct.includes(targetCt) && !targetCt.includes(ct)) {
          return false;
        }
      }
      // 8. Çözüm Türü (Dijital AI)
      if (filters.solutionType) {
        const st = (item.solutionType || item.sector || '').toLowerCase();
        const targetSt = filters.solutionType.toLowerCase();
        if (!st.includes(targetSt) && !targetSt.includes(st)) {
          return false;
        }
      }
      // 9. Hedef Kitle (Dijital AI)
      if (filters.targetAudience) {
        const ta = (item.targetAudience || '').toLowerCase();
        const targetTa = filters.targetAudience.toLowerCase();
        if (!ta.includes(targetTa) && !targetTa.includes(ta)) {
          return false;
        }
      }
      // 10. Şehir filtresi
      if (filters.city) {
        const loc = (item.city || item.location || '').toLowerCase();
        const targetCity = filters.city.toLowerCase();
        if (!loc.includes(targetCity)) {
          return false;
        }
      }
      return true;
    });
  }, [
    items,
    filters.sector,
    filters.position,
    filters.careerLevel,
    filters.stage,
    filters.partnerType,
    filters.businessType,
    filters.conceptType,
    filters.solutionType,
    filters.targetAudience,
    filters.city,
  ]);

  const hasLocalFilters = Boolean(
    filters.sector ||
      filters.position ||
      filters.careerLevel ||
      filters.stage ||
      filters.partnerType ||
      filters.businessType ||
      filters.conceptType ||
      filters.solutionType ||
      filters.targetAudience ||
      filters.city,
  );
  const countToDisplay = hasLocalFilters ? displayedItems.length : total;

  // Sayfalama (Pagination - En fazla 40 ilan)
  const totalPages = Math.max(1, Math.ceil(displayedItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [displayedItems, currentPage]);

  const scrollToFeed = () => {
    const el = document.getElementById('tum-ilanlar-akisi');
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <div className="gc-header-offset bg-background">
      <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-card/60 to-background backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-[120px] opacity-[0.035] dark:opacity-[0.05]"
          style={{ backgroundColor: resolvedAuraColor }}
        />
        <div className="relative mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
          {backHref && (
            <div className="mb-3">
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>{backLabel ?? 'Kariyer Menüsüne Dön'}</span>
              </Link>
            </div>
          )}
          {eyebrow && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                color: resolvedAuraColor,
                backgroundColor: `${resolvedAuraColor}10`,
                border: `1px solid ${resolvedAuraColor}25`,
              }}
            >
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {title ?? categoryMeta?.label ?? (initialQuery ? `"${initialQuery}" araması` : 'İlanları Keşfet')}
          </h1>
          {(description ?? categoryMeta?.description) && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description ?? categoryMeta?.description}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-6 lg:px-8 lg:py-8">
        {/* 1. FİLTRELER & ARAMA ÇUBUĞU */}
        <div id="tum-filtreler-alani" className="w-full mb-6">
          <ListingFilters
            items={items}
            filters={filters}
            onChange={updateFilters}
            hideCategory={hideCategoryFilter ?? Boolean(categorySlug)}
            showJobFlowFilters={showJobFlowFilters}
            showVentureFlowFilters={
              showVentureFlowFilters
              ?? (categorySlug === 'ortak-bul' || categorySlug === 'isletme-devri')
            }
            searchSlot={
              <MarketplaceSearchBar defaultQuery={initialQuery ?? filters.query} className="w-full" />
            }
          />
        </div>

        {/* 2. SÜPER İLANLAR VİTRİN ŞERİDİ (Altın Sarısı Yanıp Sönen Çerçeve) */}
        {!categorySlug && (
          <ExploreSuperVitrin
            items={items}
            onViewAllSuper={() => {
              updateFilters({
                isUrgent: true,
                categorySlug: undefined,
                sector: undefined,
                city: undefined,
              });
              scrollToFeed();
            }}
          />
        )}

        {/* 3. AYRIM ÇİZGİSİ */}
        <div className="relative my-7 sm:my-9 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/90 dark:border-zinc-800/90" />
          </div>
          <div className="relative flex items-center gap-2 bg-background px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500/90" />
            <span>Tüm Güncel İlanlar & Fırsatlar</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500/90" />
          </div>
        </div>

        {/* 4. ALTTTAKİ İLAN KATEGORİSİ ÇERÇEVESİ (Farklı Renkte Çerçeve & 40'lık Sayfalama) */}
        <div
          id="tum-ilanlar-akisi"
          className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 sm:p-6 lg:p-7 shadow-xs backdrop-blur-xs ring-1 ring-slate-100 dark:ring-white/5 transition-all"
        >
          {/* Çerçeve Başlığı & İlan Sayacı */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/70 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{categorySlug ? (categoryMeta?.label ?? 'Kategori İlanları') : 'Tüm İlanlar'}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
                    {countToDisplay.toLocaleString('tr-TR')} {resultNoun}
                  </span>
                </h2>
              </div>
            </div>

            {/* Sayfa Özeti */}
            {totalPages > 1 && (
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span>Sayfa</span>
                <span className="font-bold text-foreground bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700">
                  {currentPage} / {totalPages}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={refresh}>
                Tekrar Dene
              </Button>
            </div>
          )}

          {isLoading ? (
            <ListingFeedSkeleton count={8} />
          ) : (
            <ListingFeed
              items={paginatedItems}
              accent={feedAccent}
              emptyMessage={
                emptyTitle
                  ? (
                    filters.query
                    || filters.city
                    || filters.isFeatured
                    || filters.isUrgent
                    || filters.publishedAfter
                      ? 'Bu filtrelere uygun sonuç bulunmuyor.'
                      : emptyTitle
                  )
                  : (
                    filters.query
                    || filters.categorySlug
                    || filters.city
                    || filters.jobFlow
                    || filters.isFeatured
                    || filters.isUrgent
                    || filters.publishedAfter
                      ? 'Bu filtrelere uygun ilan bulunmuyor.'
                      : undefined
                  )
              }
              emptyDescription={emptyTitle && !hasExtraFilters ? emptyDescription : undefined}
              emptyCta={emptyTitle && !hasExtraFilters ? emptyCta : undefined}
            />
          )}

          {/* 5. SAYFALAMA KONTROLLERİ (PAGINATION - 40 İlan Sınırı) */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/70 dark:border-zinc-800/80">
              <div className="text-xs text-muted-foreground font-medium">
                Toplam <strong className="text-foreground">{displayedItems.length}</strong> ilandan{' '}
                <strong className="text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, displayedItems.length)}
                </strong>{' '}
                arası gösteriliyor
              </div>

              <div className="flex items-center gap-1.5">
                {/* Önceki Sayfa */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage((prev) => prev - 1);
                      scrollToFeed();
                    }
                  }}
                  disabled={currentPage <= 1}
                  className="h-9 px-3 text-xs font-medium rounded-xl border-slate-200 dark:border-zinc-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Önceki</span>
                </Button>

                {/* Sayfa Numaraları */}
                {getVisiblePageNumbers(currentPage, totalPages).map((pageNum, idx) => {
                  if (typeof pageNum === 'string') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-muted-foreground select-none">
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        scrollToFeed();
                      }}
                      className={cn(
                        'h-9 w-9 p-0 text-xs font-semibold rounded-xl transition-all',
                        currentPage === pageNum
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm shadow-amber-500/20 font-bold scale-105'
                          : 'border-slate-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {/* Sonraki Sayfa */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage((prev) => prev + 1);
                      scrollToFeed();
                    }
                  }}
                  disabled={currentPage >= totalPages}
                  className="h-9 px-3 text-xs font-medium rounded-xl border-slate-200 dark:border-zinc-800 disabled:opacity-40"
                >
                  <span>Sonraki</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {categorySlug && relatedCategories.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[#EEF0F4] pt-8 dark:border-border">
            <span className="text-[12px] text-[#64748B]">Diğer kategoriler:</span>
            {relatedCategories.map(({ slug, meta }) => (
              <Link
                key={slug}
                href={getCategoryRoutePath(slug)}
                className="rounded-md border border-[#E6E8EE] bg-white px-2.5 py-1 text-[12px] font-medium text-[#475569] transition-colors hover:border-[#C7CBD6] hover:text-[#0B1220] dark:border-border dark:bg-card"
              >
                {meta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

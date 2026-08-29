'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Wrench } from 'lucide-react';
import { resolveCategorySlug, getCategoryRoutePath } from '@/features/listings/config/marketplace.config';
import { useMarketplaceBrowse } from '@/features/listings/hooks/use-marketplace-browse';
import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';
import { ListingFilters } from '@/components/girisimco/marketplace/listing-filters';
import { ListingFeedInfinite } from '@/components/girisimco/marketplace/listing-feed-infinite';
import { MarketplaceSearchBar } from '@/components/girisimco/marketplace/marketplace-search-bar';
import { ExploreSuperVitrin } from '@/components/girisimco/marketplace/explore-super-vitrin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    filters,
    updateFilters,
    loadMore,
    refresh,
  } = useMarketplaceBrowse({
    initialCategorySlug: categorySlug,
    initialQuery,
    initialFilters,
  });

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
          <div className="mt-6 max-w-xl">
            <MarketplaceSearchBar defaultQuery={initialQuery ?? filters.query} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-6 lg:px-8 lg:py-8">
        {/* 1. FİLTRELER (3. Resimdeki Filtreler - En Üstte) */}
        <div id="tum-filtreler-alani">
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
            className="mb-6"
          />
        </div>

        {/* 2. SÜPER İLANLAR VİTRİN ŞERİDİ (Görsel 1 ile Birebir) */}
        {!categorySlug && !initialQuery && !filters.categorySlug && (
          <ExploreSuperVitrin
            items={items}
            onViewAllSuper={() => {
              updateFilters({
                isUrgent: true,
                categorySlug: undefined,
                sector: undefined,
                city: undefined,
              });
              const el = document.getElementById('tum-ilanlar-akisi');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* 3. TÜM İLANLAR BAŞLIĞI VE AKIŞ */}
        <div id="tum-ilanlar-akisi" className="pt-2">
          {!isLoading && !error && (
            <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200/60 dark:border-zinc-800/80">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tüm İlanlar <span className="text-sm font-normal text-muted-foreground">({countToDisplay.toLocaleString('tr-TR')} {resultNoun})</span>
              </h2>
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

        <ListingFeedInfinite
          items={displayedItems}
          accent={feedAccent}
          hasMore={hasMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
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

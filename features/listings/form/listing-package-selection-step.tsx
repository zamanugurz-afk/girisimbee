'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Sparkles, Store, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DIGITAL_AI_PUBLISH_CONFIG,
  FRANCHISE_PUBLISH_CONFIG,
  JOB_PUBLISH_CONFIG,
  PLACEMENT_PACKAGE_CONFIG,
  PLACEMENT_PACKAGE_SLUGS,
  STANDARD_PUBLISH_CONFIG,
  STANDARD_REPUBLISH_CONFIG,
  formatPlacementPriceTry,
  type PlacementPackageSlug,
} from '@/features/monetization/types/listing-placement.types';
import {
  PLACEMENT_SIMULATION_STATUS_LABELS,
  simulatePlacementPayment,
  type PlacementPaymentSimulationStatus,
} from '@/features/monetization/lib/simulate-placement-payment';
import { isPremiumEnabled, isPremiumLivePayments } from '@/features/shared/config/features';

export interface ListingPackageSelectionValue {
  placements: PlacementPackageSlug[];
  simulationStatus: PlacementPaymentSimulationStatus;
  publishFeePaid?: boolean;
  /** @deprecated use publishFeePaid */
  franchisePublishPaid?: boolean;
}

export const DEFAULT_PACKAGE_SELECTION: ListingPackageSelectionValue = {
  placements: [],
  simulationStatus: 'ready',
  publishFeePaid: false,
  franchisePublishPaid: false,
};

export const DEFAULT_PAID_PUBLISH_PACKAGE_SELECTION: ListingPackageSelectionValue = {
  placements: [],
  simulationStatus: 'selected',
  publishFeePaid: false,
  franchisePublishPaid: false,
};

/** @deprecated Prefer DEFAULT_PAID_PUBLISH_PACKAGE_SELECTION */
export const DEFAULT_FRANCHISE_PACKAGE_SELECTION = DEFAULT_PAID_PUBLISH_PACKAGE_SELECTION;

interface ListingPackageSelectionStepProps {
  value: ListingPackageSelectionValue;
  onChange: (next: ListingPackageSelectionValue) => void;
  disabled?: boolean;
  error?: string;
  variant?: 'placement' | 'franchise' | 'dijital_ai' | 'job';
  /** Free placement categories: first listing free; false → 99 TL standard fee. */
  categoryFreeAvailable?: boolean;
  /** Category dynamic theme color (emerald, sky, amber, blue, purple, teal, rose). Default: emerald. */
  themeColor?: string;
}

function publishConfigFor(variant: 'franchise' | 'dijital_ai' | 'job') {
  if (variant === 'dijital_ai') return DIGITAL_AI_PUBLISH_CONFIG;
  if (variant === 'job') return JOB_PUBLISH_CONFIG;
  return FRANCHISE_PUBLISH_CONFIG;
}

function togglePlacement(
  current: PlacementPackageSlug[],
  slug: PlacementPackageSlug,
): PlacementPackageSlug[] {
  return current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];
}

export function ListingPackageSelectionStep({
  value,
  onChange,
  disabled,
  error,
  variant = 'placement',
  categoryFreeAvailable = true,
  themeColor = 'emerald',
}: ListingPackageSelectionStepProps) {
  const [simulating, setSimulating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const premiumOn = isPremiumEnabled();
  const livePayments = isPremiumLivePayments();
  const isPaidPublish =
    premiumOn && (variant === 'franchise' || variant === 'dijital_ai' || variant === 'job');
  /** Free category but user already used their 1 free listing → 99 TL standard. */
  const requiresStandardFee =
    premiumOn && variant === 'placement' && !categoryFreeAvailable;
  const requiresPublishFee = isPaidPublish || requiresStandardFee;
  const publishConfig = isPaidPublish ? publishConfigFor(variant) : null;

  useEffect(() => {
    if (premiumOn) return;
    if (
      value.placements.length === 0 &&
      value.simulationStatus === 'ready' &&
      !value.publishFeePaid &&
      !value.franchisePublishPaid
    ) {
      return;
    }
    onChange(DEFAULT_PACKAGE_SELECTION);
  }, [premiumOn, onChange, value.placements.length, value.simulationStatus, value.publishFeePaid, value.franchisePublishPaid]);

  /** Test mode: auto-approve package payment until real PSP is wired. */
  useEffect(() => {
    if (!premiumOn || livePayments) return;
    const needsPaid = requiresPublishFee || value.placements.length > 0;
    if (!needsPaid) return;
    const alreadyReady =
      value.simulationStatus === 'ready' &&
      (!requiresPublishFee || Boolean(value.publishFeePaid || value.franchisePublishPaid));
    if (alreadyReady) return;
    onChange({
      placements: value.placements,
      simulationStatus: 'ready',
      publishFeePaid: true,
      franchisePublishPaid: isPaidPublish,
    });
  }, [
    premiumOn,
    livePayments,
    isPaidPublish,
    requiresPublishFee,
    onChange,
    value.placements,
    value.simulationStatus,
    value.publishFeePaid,
    value.franchisePublishPaid,
  ]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const isStandard = !isPaidPublish && value.placements.length === 0;
  const placementCents = value.placements.reduce(
    (sum, slug) => sum + (PLACEMENT_PACKAGE_CONFIG[slug]?.priceCents ?? 0),
    0,
  );
  const standardFeeCents = requiresStandardFee ? STANDARD_REPUBLISH_CONFIG.priceCents : 0;
  const totalCents = (publishConfig?.priceCents ?? 0) + standardFeeCents + placementCents;
  const needsPayment = totalCents > 0;
  const publishPaid = Boolean(value.publishFeePaid || value.franchisePublishPaid);
  const status = value.simulationStatus;
  const statusLabel = PLACEMENT_SIMULATION_STATUS_LABELS[status];

  if (!premiumOn) {
    return (
      <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/20 p-5">
        <h3 className="font-display text-base font-semibold text-foreground">
          {STANDARD_PUBLISH_CONFIG.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          İlanınız ücretsiz standart paket ile yayınlanır. Ücretli vitrin, acil doping ve kategori
          yayın paketleri henüz açılmadı — canlı ödeme geldiğinde burada görünecek.
        </p>
        <ul className="space-y-2">
          {STANDARD_PUBLISH_CONFIG.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  function selectStandard() {
    if (isPaidPublish) return;
    abortRef.current?.abort();
    setSimulating(false);
    if (requiresStandardFee) {
      onChange({
        placements: [],
        simulationStatus: 'selected',
        publishFeePaid: false,
        franchisePublishPaid: false,
      });
      return;
    }
    onChange({
      placements: [],
      simulationStatus: 'ready',
      publishFeePaid: false,
      franchisePublishPaid: false,
    });
  }

  function selectPlacement(slug: PlacementPackageSlug) {
    abortRef.current?.abort();
    setSimulating(false);
    const nextPlacements = togglePlacement(value.placements, slug);
    onChange({
      placements: nextPlacements,
      simulationStatus:
        requiresPublishFee || nextPlacements.length > 0 ? 'selected' : 'ready',
      publishFeePaid: publishPaid,
      franchisePublishPaid: publishPaid,
    });
  }

  async function runSimulation() {
    if (!needsPayment || disabled || simulating) return;

    const placementsSnapshot = value.placements;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSimulating(true);
    onChange({
      placements: placementsSnapshot,
      simulationStatus: 'selected',
      publishFeePaid: false,
      franchisePublishPaid: false,
    });

    try {
      await simulatePlacementPayment({
        signal: controller.signal,
        onStatus: (nextStatus) => {
          const paid = nextStatus === 'ready';
          onChange({
            placements: placementsSnapshot,
            simulationStatus: nextStatus,
            publishFeePaid: requiresPublishFee ? paid : paid && placementsSnapshot.length > 0,
            franchisePublishPaid: isPaidPublish ? paid : false,
          });
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      onChange({
        placements: placementsSnapshot,
        simulationStatus: 'selected',
        publishFeePaid: false,
        franchisePublishPaid: false,
      });
    } finally {
      setSimulating(false);
    }
  }

  // Derived Info for Main Card
  const mainName = publishConfig ? publishConfig.name : STANDARD_PUBLISH_CONFIG.name;
  const mainDurationLabel =
    publishConfig?.durationDays != null
      ? `${publishConfig.durationDays} Gün Yayın`
      : `${STANDARD_PUBLISH_CONFIG.durationDays} Gün Yayın`;
  const mainPriceLabel = publishConfig
    ? formatPlacementPriceTry(publishConfig.priceCents)
    : requiresStandardFee
      ? formatPlacementPriceTry(STANDARD_REPUBLISH_CONFIG.priceCents)
      : 'Ücretsiz';
  const mainBenefits = publishConfig
    ? publishConfig.benefits
    : STANDARD_PUBLISH_CONFIG.benefits;

  const vitrinSelected = value.placements.includes('vitrin');
  const acilSelected = value.placements.includes('hizli_erisim');

  const activeTheme = themeColor || 'emerald';

  const themeClasses = {
    emerald: {
      headerIcon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      headerBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      mainCardBorder: 'border-emerald-500/80',
      mainCardBg: 'bg-gradient-to-b from-emerald-50/70 to-emerald-50/15 dark:from-emerald-950/40 dark:to-emerald-950/10',
      mainCardIcon: 'bg-emerald-600 text-white shadow-xs',
      mainCardDuration: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200',
      mainCardBadge: 'bg-emerald-600 text-white shadow-xs',
      mainCardCheck: 'text-emerald-600 stroke-[2.5]',
      mainCardFooter: 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
      selectedCardBorder: 'border-emerald-500 ring-1 ring-emerald-500/30',
      selectedCardBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
      selectedCardIcon: 'bg-emerald-600 text-white',
      selectedCardCheck: 'border-emerald-500 bg-emerald-600 text-white',
      selectedCardButton: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
      payButton: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
      freeBadge: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700',
    },
    sky: {
      headerIcon: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
      headerBadge: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
      mainCardBorder: 'border-sky-500/80',
      mainCardBg: 'bg-gradient-to-b from-sky-50/70 to-sky-50/15 dark:from-sky-950/40 dark:to-sky-950/10',
      mainCardIcon: 'bg-sky-600 text-white shadow-xs',
      mainCardDuration: 'bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200',
      mainCardBadge: 'bg-sky-600 text-white shadow-xs',
      mainCardCheck: 'text-sky-600 stroke-[2.5]',
      mainCardFooter: 'bg-sky-100/70 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
      selectedCardBorder: 'border-sky-500 ring-1 ring-sky-500/30',
      selectedCardBg: 'bg-sky-50/40 dark:bg-sky-950/20',
      selectedCardIcon: 'bg-sky-600 text-white',
      selectedCardCheck: 'border-sky-500 bg-sky-600 text-white',
      selectedCardButton: 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs',
      payButton: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm',
      freeBadge: 'text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-700',
    },
    amber: {
      headerIcon: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      headerBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      mainCardBorder: 'border-amber-500/80',
      mainCardBg: 'bg-gradient-to-b from-amber-50/70 to-amber-50/15 dark:from-amber-950/40 dark:to-amber-950/10',
      mainCardIcon: 'bg-amber-600 text-white shadow-xs',
      mainCardDuration: 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200',
      mainCardBadge: 'bg-amber-600 text-white shadow-xs',
      mainCardCheck: 'text-amber-600 stroke-[2.5]',
      mainCardFooter: 'bg-amber-100/70 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
      selectedCardBorder: 'border-amber-500 ring-1 ring-amber-500/30',
      selectedCardBg: 'bg-amber-50/40 dark:bg-amber-950/20',
      selectedCardIcon: 'bg-amber-600 text-white',
      selectedCardCheck: 'border-amber-500 bg-amber-600 text-white',
      selectedCardButton: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
      payButton: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
      freeBadge: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700',
    },
    blue: {
      headerIcon: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      headerBadge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      mainCardBorder: 'border-blue-500/80',
      mainCardBg: 'bg-gradient-to-b from-blue-50/70 to-blue-50/15 dark:from-blue-950/40 dark:to-blue-950/10',
      mainCardIcon: 'bg-blue-600 text-white shadow-xs',
      mainCardDuration: 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200',
      mainCardBadge: 'bg-blue-600 text-white shadow-xs',
      mainCardCheck: 'text-blue-600 stroke-[2.5]',
      mainCardFooter: 'bg-blue-100/70 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
      selectedCardBorder: 'border-blue-500 ring-1 ring-blue-500/30',
      selectedCardBg: 'bg-blue-50/40 dark:bg-blue-950/20',
      selectedCardIcon: 'bg-blue-600 text-white',
      selectedCardCheck: 'border-blue-500 bg-blue-600 text-white',
      selectedCardButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
      payButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
      freeBadge: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700',
    },
    purple: {
      headerIcon: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      headerBadge: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      mainCardBorder: 'border-purple-500/80',
      mainCardBg: 'bg-gradient-to-b from-purple-50/70 to-purple-50/15 dark:from-purple-950/40 dark:to-purple-950/10',
      mainCardIcon: 'bg-purple-600 text-white shadow-xs',
      mainCardDuration: 'bg-purple-100 text-purple-800 dark:bg-purple-900/80 dark:text-purple-200',
      mainCardBadge: 'bg-purple-600 text-white shadow-xs',
      mainCardCheck: 'text-purple-600 stroke-[2.5]',
      mainCardFooter: 'bg-purple-100/70 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
      selectedCardBorder: 'border-purple-500 ring-1 ring-purple-500/30',
      selectedCardBg: 'bg-purple-50/40 dark:bg-purple-950/20',
      selectedCardIcon: 'bg-purple-600 text-white',
      selectedCardCheck: 'border-purple-500 bg-purple-600 text-white',
      selectedCardButton: 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs',
      payButton: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm',
      freeBadge: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700',
    },
    teal: {
      headerIcon: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
      headerBadge: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
      mainCardBorder: 'border-teal-500/80',
      mainCardBg: 'bg-gradient-to-b from-teal-50/70 to-teal-50/15 dark:from-teal-950/40 dark:to-teal-950/10',
      mainCardIcon: 'bg-teal-600 text-white shadow-xs',
      mainCardDuration: 'bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200',
      mainCardBadge: 'bg-teal-600 text-white shadow-xs',
      mainCardCheck: 'text-teal-600 stroke-[2.5]',
      mainCardFooter: 'bg-teal-100/70 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200',
      selectedCardBorder: 'border-teal-500 ring-1 ring-teal-500/30',
      selectedCardBg: 'bg-teal-50/40 dark:bg-teal-950/20',
      selectedCardIcon: 'bg-teal-600 text-white',
      selectedCardCheck: 'border-teal-500 bg-teal-600 text-white',
      selectedCardButton: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs',
      payButton: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
      freeBadge: 'text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/80 border-teal-300 dark:border-teal-700',
    },
    rose: {
      headerIcon: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
      headerBadge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      mainCardBorder: 'border-rose-500/80',
      mainCardBg: 'bg-gradient-to-b from-rose-50/70 to-rose-50/15 dark:from-rose-950/40 dark:to-rose-950/10',
      mainCardIcon: 'bg-rose-600 text-white shadow-xs',
      mainCardDuration: 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200',
      mainCardBadge: 'bg-rose-600 text-white shadow-xs',
      mainCardCheck: 'text-rose-600 stroke-[2.5]',
      mainCardFooter: 'bg-rose-100/70 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
      selectedCardBorder: 'border-rose-500 ring-1 ring-rose-500/30',
      selectedCardBg: 'bg-rose-50/40 dark:bg-rose-950/20',
      selectedCardIcon: 'bg-rose-600 text-white',
      selectedCardCheck: 'border-rose-500 bg-rose-600 text-white',
      selectedCardButton: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
      payButton: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
      freeBadge: 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700',
    },
  };

  const currentTheme = (themeClasses as any)[activeTheme] || themeClasses.emerald;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-border dark:bg-card space-y-4">
      {/* Frame Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', currentTheme.headerIcon)}>
            <Store className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
              İlan Yayın ve Öne Çıkarma Paketleri
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isPaidPublish
                ? 'İlanınız 30 gün boyunca platformda yayında kalır. İsteğe bağlı doping ekleyebilirsiniz.'
                : categoryFreeAvailable
                  ? 'Standart profil yayını bu kategoride ücretsizdir. İsteğe bağlı doping ekleyebilirsiniz.'
                  : 'Standart profil yayın hakkı ve isteğe bağlı doping seçenekleri.'}
            </p>
          </div>
        </div>
        <span className={cn('hidden sm:inline-flex rounded-full text-[10px] font-bold px-2.5 py-0.5', currentTheme.headerBadge)}>
          Yayın Planı
        </span>
      </div>

      {/* 3 Equal Package Cards Grid (Compact Scaling) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5 items-stretch">
        {/* Card 1: Ana İlan Paketi */}
        <div
          className={cn(
            'relative flex flex-col justify-between rounded-xl border-2 p-3.5 sm:p-4 text-left transition-all',
            currentTheme.mainCardBorder,
            currentTheme.mainCardBg,
            'shadow-xs',
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={cn('flex h-6 w-6 items-center justify-center rounded-lg shrink-0', currentTheme.mainCardIcon)}>
                  <Store className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <span className={cn('inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider', currentTheme.mainCardDuration)}>
                    {mainDurationLabel}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-[13px] mt-0.5 truncate">
                    {mainName}
                  </h4>
                </div>
              </div>
              <span className={cn('rounded-full text-white text-[9px] font-bold px-2 py-0.5 shadow-xs shrink-0', currentTheme.mainCardBadge)}>
                {isPaidPublish ? 'Dahil' : requiresStandardFee ? 'Standart' : 'Ücretsiz'}
              </span>
            </div>

            <div className="my-2.5 border-t border-border/40 pt-2">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                  {mainPriceLabel}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">/ 30 gün</span>
              </div>

              <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                {mainBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-1.5">
                    <Check className={cn('h-3 w-3 shrink-0', currentTheme.mainCardCheck)} />
                    <span className="leading-snug">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border/40">
            <div className={cn('w-full text-center py-1.5 rounded-lg font-bold text-[11px]', currentTheme.mainCardFooter)}>
              ✓ Pakete Dahil Edildi
            </div>
          </div>
        </div>

        {/* Card 2: Vitrin Paketi */}
        <div
          onClick={() => selectPlacement('vitrin')}
          className={cn(
            'relative flex flex-col justify-between rounded-xl border-2 p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer select-none',
            vitrinSelected
              ? cn(currentTheme.selectedCardBorder, currentTheme.selectedCardBg, 'shadow-xs')
              : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs dark:border-border dark:bg-card',
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg transition-colors shrink-0',
                    vitrinSelected
                      ? currentTheme.selectedCardIcon
                      : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="inline-block rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Öne Çıkan
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-[13px] mt-0.5 truncate">
                    {PLACEMENT_PACKAGE_CONFIG.vitrin.name}
                  </h4>
                </div>
              </div>
              <div
                className={cn(
                  'flex h-4.5 w-4.5 items-center justify-center rounded-full border text-[10px] font-bold transition-all shrink-0',
                  vitrinSelected
                    ? currentTheme.selectedCardCheck
                    : 'border-slate-300 dark:border-slate-600',
                )}
              >
                {vitrinSelected ? '✓' : ''}
              </div>
            </div>

            <div className="my-2.5 border-t border-slate-100 dark:border-border/60 pt-2">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                  +{formatPlacementPriceTry(PLACEMENT_PACKAGE_CONFIG.vitrin.priceCents)}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">/ 30 gün</span>
              </div>

              <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Check className={cn('h-3 w-3 shrink-0', currentTheme.mainCardCheck)} />
                  <span className="leading-snug">Kategori ve arama vitrininde üst sıra</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className={cn('h-3 w-3 shrink-0', currentTheme.mainCardCheck)} />
                  <span className="leading-snug">Öne çıkan ilan vitrin rozeti</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className={cn('h-3 w-3 shrink-0', currentTheme.mainCardCheck)} />
                  <span className="leading-snug">+5 kata kadar daha fazla görüntülenme</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-border/60">
            <div
              className={cn(
                'w-full py-1.5 rounded-lg text-[11px] font-bold transition-all text-center',
                vitrinSelected
                  ? currentTheme.selectedCardButton
                  : 'border border-border bg-muted/40 text-foreground',
              )}
            >
              {vitrinSelected ? '✓ Pakete Eklendi' : '+ Pakete Ekle'}
            </div>
          </div>
        </div>

        {/* Card 3: Acil Vitrin Paketi */}
        <div
          onClick={() => selectPlacement('hizli_erisim')}
          className={cn(
            'relative flex flex-col justify-between rounded-xl border-2 p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer select-none',
            acilSelected
              ? cn(currentTheme.selectedCardBorder, currentTheme.selectedCardBg, 'shadow-xs')
              : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs dark:border-border dark:bg-card',
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg transition-colors shrink-0',
                    acilSelected
                      ? currentTheme.selectedCardIcon
                      : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
                  )}
                >
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="inline-block rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Hızlı Sonuç
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-[13px] mt-0.5 truncate">
                    {PLACEMENT_PACKAGE_CONFIG.hizli_erisim.name}
                  </h4>
                </div>
              </div>
              <div
                className={cn(
                  'flex h-4.5 w-4.5 items-center justify-center rounded-full border text-[10px] font-bold transition-all shrink-0',
                  acilSelected
                    ? currentTheme.selectedCardCheck
                    : 'border-slate-300 dark:border-slate-600',
                )}
              >
                {acilSelected ? '✓' : ''}
              </div>
            </div>

            <div className="my-2.5 border-t border-slate-100 dark:border-border/60 pt-2">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                  +{formatPlacementPriceTry(PLACEMENT_PACKAGE_CONFIG.hizli_erisim.priceCents)}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">/ 30 gün</span>
              </div>

              <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Check className={cn('h-3 w-3 shrink-0', currentTheme.mainCardCheck)} />
                  <span className="leading-snug">Acil arayış kırmızı dikkat rozeti</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className={cn('h-3 w-3 shrink-0', currentTheme.mainCardCheck)} />
                  <span className="leading-snug">Ana sayfa acil vitrin bloğunda yerleşim</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className={cn('h-3 w-3 shrink-0', currentTheme.mainCardCheck)} />
                  <span className="leading-snug">Aday bildirimlerinde öncelikli eşleşme</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-border/60">
            <div
              className={cn(
                'w-full py-1.5 rounded-lg text-[11px] font-bold transition-all text-center',
                acilSelected
                  ? currentTheme.selectedCardButton
                  : 'border border-border bg-muted/40 text-foreground',
              )}
            >
              {acilSelected ? '✓ Pakete Eklendi' : '+ Pakete Ekle'}
            </div>
          </div>
        </div>
      </div>

      {/* Frame Bottom Summary Bar & 'Ödemeye Geç' Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 sm:p-3.5 dark:border-border/60 dark:bg-muted/30 shadow-2xs">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Toplam Yayın ve Doping Tutarı
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display text-lg sm:text-xl font-black text-slate-900 dark:text-foreground">
              {totalCents > 0 ? formatPlacementPriceTry(totalCents) : 'Ücretsiz'}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ({[mainName, ...value.placements.map((s) => PLACEMENT_PACKAGE_CONFIG[s]?.name ?? s)].join(' + ')})
            </span>
          </div>
        </div>

        <div>
          {totalCents > 0 ? (
            <Button
              type="button"
              onClick={() => void runSimulation()}
              disabled={disabled || simulating}
              className={cn(
                'w-full sm:w-auto rounded-lg text-xs font-bold px-4 py-2 cursor-pointer h-9 min-h-[36px] transition-all',
                currentTheme.payButton,
              )}
            >
              {simulating ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Ödeme Doğrulanıyor...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Ödemeye Geç ({formatPlacementPriceTry(totalCents)})</span>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
              )}
            </Button>
          ) : (
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold border rounded-lg px-3.5 py-1.5', currentTheme.freeBadge)}>
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Ücretsiz Yayın Onaylandı
            </span>
          )}
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

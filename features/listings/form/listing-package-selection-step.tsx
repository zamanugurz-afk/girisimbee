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
    (sum, slug) => sum + PLACEMENT_PACKAGE_CONFIG[slug].priceCents,
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
  const acilSelected = value.placements.includes('acil');

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-border dark:bg-card space-y-5">
      {/* Frame Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
              İlan Yayın ve Öne Çıkarma Paketleri
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPaidPublish
                ? 'İlanınız 30 gün boyunca platformda yayında kalır. İsteğe bağlı doping ekleyebilirsiniz.'
                : categoryFreeAvailable
                  ? 'Standart profil yayını bu kategoride ücretsizdir. İsteğe bağlı doping ekleyebilirsiniz.'
                  : 'Standart profil yayın hakkı ve isteğe bağlı doping seçenekleri.'}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex rounded-full bg-primary/10 text-primary text-[11px] font-bold px-3 py-1">
          Yayın Planı
        </span>
      </div>

      {/* 3 Equal Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Card 1: Ana İlan Paketi */}
        <div
          className={cn(
            'relative flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all',
            'border-primary/60 bg-gradient-to-b from-primary/[0.08] to-primary/[0.02] shadow-xs',
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {mainDurationLabel}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-foreground text-sm mt-0.5 truncate">
                    {mainName}
                  </h4>
                </div>
              </div>
              <span className="rounded-full bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 shadow-xs shrink-0">
                {isPaidPublish ? 'Dahil' : requiresStandardFee ? 'Standart' : 'Ücretsiz'}
              </span>
            </div>

            <div className="my-4 border-t border-primary/10 pt-3">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-slate-900 dark:text-foreground">
                  {mainPriceLabel}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/ 30 gün yayın</span>
              </div>

              <ul className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {mainBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-primary/10">
            <div className="w-full text-center py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs">
              ✓ Pakete Dahil Edildi
            </div>
          </div>
        </div>

        {/* Card 2: Vitrin Paketi */}
        <div
          onClick={() => selectPlacement('vitrin')}
          className={cn(
            'relative flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all duration-200 cursor-pointer select-none',
            vitrinSelected
              ? 'border-primary bg-primary/[0.06] shadow-xs ring-1 ring-primary/30'
              : 'border-slate-200/90 bg-white hover:border-primary/50 hover:shadow-xs dark:border-border dark:bg-card',
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    vitrinSelected
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Öne Çıkan
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-foreground text-sm mt-0.5 truncate">
                    {PLACEMENT_PACKAGE_CONFIG.vitrin.name}
                  </h4>
                </div>
              </div>
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold transition-all shrink-0',
                  vitrinSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-300 dark:border-slate-600',
                )}
              >
                {vitrinSelected ? '✓' : ''}
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-border/60 pt-3">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-slate-900 dark:text-foreground">
                  +{formatPlacementPriceTry(PLACEMENT_PACKAGE_CONFIG.vitrin.priceCents)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/ 30 gün doping</span>
              </div>

              <ul className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                  <span>Kategori ve arama vitrininde üst sıra</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                  <span>Öne çıkan ilan vitrin rozeti</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                  <span>+5 kata kadar daha fazla görüntülenme</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-border/60">
            <div
              className={cn(
                'w-full py-2 rounded-xl text-xs font-bold transition-all text-center',
                vitrinSelected
                  ? 'bg-primary text-white shadow-xs'
                  : 'border border-border bg-muted/40 text-foreground',
              )}
            >
              {vitrinSelected ? '✓ Pakete Eklendi' : '+ Pakete Ekle'}
            </div>
          </div>
        </div>

        {/* Card 3: Acil Vitrin Paketi */}
        <div
          onClick={() => selectPlacement('acil')}
          className={cn(
            'relative flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all duration-200 cursor-pointer select-none',
            acilSelected
              ? 'border-primary bg-primary/[0.06] shadow-xs ring-1 ring-primary/30'
              : 'border-slate-200/90 bg-white hover:border-primary/50 hover:shadow-xs dark:border-border dark:bg-card',
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    acilSelected
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
                  )}
                >
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Hızlı Sonuç
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-foreground text-sm mt-0.5 truncate">
                    {PLACEMENT_PACKAGE_CONFIG.acil.name}
                  </h4>
                </div>
              </div>
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold transition-all shrink-0',
                  acilSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-300 dark:border-slate-600',
                )}
              >
                {acilSelected ? '✓' : ''}
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-border/60 pt-3">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-slate-900 dark:text-foreground">
                  +{formatPlacementPriceTry(PLACEMENT_PACKAGE_CONFIG.acil.priceCents)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/ 30 gün doping</span>
              </div>

              <ul className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                  <span>Acil arayış kırmızı dikkat rozeti</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                  <span>Ana sayfa acil vitrin bloğunda yerleşim</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                  <span>Aday bildirimlerinde öncelikli eşleşme</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-border/60">
            <div
              className={cn(
                'w-full py-2 rounded-xl text-xs font-bold transition-all text-center',
                acilSelected
                  ? 'bg-primary text-white shadow-xs'
                  : 'border border-border bg-muted/40 text-foreground',
              )}
            >
              {acilSelected ? '✓ Pakete Eklendi' : '+ Pakete Ekle'}
            </div>
          </div>
        </div>
      </div>

      {/* Frame Bottom Summary Bar & 'Ödemeye Geç' Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-slate-50/80 p-4.5 dark:border-border/60 dark:bg-muted/30 shadow-2xs">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Toplam Yayın ve Doping Tutarı
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-foreground">
              {totalCents > 0 ? formatPlacementPriceTry(totalCents) : 'Ücretsiz'}
            </span>
            <span className="text-xs text-muted-foreground">
              ({[mainName, ...value.placements.map((s) => PLACEMENT_PACKAGE_CONFIG[s].name)].join(' + ')})
            </span>
          </div>
        </div>

        <div>
          {totalCents > 0 ? (
            <Button
              type="button"
              onClick={() => void runSimulation()}
              disabled={disabled || simulating}
              className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground text-sm font-bold px-6 py-2.5 shadow-sm hover:opacity-95 cursor-pointer min-h-[42px]"
            >
              {simulating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ödeme Doğrulanıyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Ödemeye Geç ({formatPlacementPriceTry(totalCents)})</span>
                  <Check className="h-4 w-4 stroke-[3]" />
                </span>
              )}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl px-4 py-2.5">
              <Check className="h-4 w-4 stroke-[3]" />
              Ücretsiz Yayın Onaylandı
            </span>
          )}
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

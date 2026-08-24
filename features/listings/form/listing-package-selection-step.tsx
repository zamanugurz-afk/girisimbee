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

  if (isPaidPublish && publishConfig) {
    const paid = publishPaid && status === 'ready';
    const durationLabel =
      publishConfig.durationDays != null
        ? `${publishConfig.durationDays} Gün Yayın`
        : 'İlan Başına';

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-foreground">
            İlan Yayın ve Öne Çıkarma Paketleri
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-muted-foreground">
            İlanınız 30 gün boyunca platformda yayında kalır. İsteğe bağlı olarak vitrin veya acil doping ekleyebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Main Package Card */}
          <div
            className={cn(
              'relative flex flex-col justify-between rounded-2xl border-2 p-4.5 text-left lg:col-span-6',
              'border-primary/60 bg-gradient-to-b from-primary/[0.08] to-primary/[0.02] shadow-sm',
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
                      {durationLabel}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-foreground text-sm mt-0.5">
                      {publishConfig.name}
                    </h4>
                  </div>
                </div>
                <span className="rounded-full bg-primary text-white text-[10px] font-bold px-2 py-0.5 shadow-xs">
                  Dahil
                </span>
              </div>

              <div className="my-3 border-t border-primary/10 pt-3">
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-foreground">
                  {formatPlacementPriceTry(publishConfig.priceCents)}
                </p>
                <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {publishConfig.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[2.5]" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Doping Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:col-span-6">
            {PLACEMENT_PACKAGE_SLUGS.map((slug) => {
              const pkg = PLACEMENT_PACKAGE_CONFIG[slug];
              const selected = value.placements.includes(slug);
              const Icon = slug === 'vitrin' ? Sparkles : Zap;
              return (
                <button
                  key={slug}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectPlacement(slug)}
                  className={cn(
                    'relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-150 cursor-pointer',
                    selected
                      ? 'border-primary bg-primary/[0.06] shadow-sm'
                      : 'border-slate-200/90 bg-white hover:border-primary/40 dark:border-border dark:bg-card',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg',
                          selected
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                        {pkg.name}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-bold',
                        selected
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-300 dark:border-slate-600',
                      )}
                    >
                      {selected ? '✓' : ''}
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-border/60 flex items-baseline justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-foreground">
                      +{formatPlacementPriceTry(pkg.priceCents)}
                    </p>
                    <span className="text-[10px] font-medium text-slate-500">
                      {pkg.durationDays} gün doping
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-foreground">
              Toplam Yayın Tutarı:{' '}
              <span className="text-primary text-sm font-extrabold">
                {formatPlacementPriceTry(totalCents)}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
              {[
                publishConfig.name,
                ...value.placements.map((s) => PLACEMENT_PACKAGE_CONFIG[s].name),
              ].join(' + ')}
            </p>
          </div>
          {livePayments && status !== 'ready' ? (
            <Button
              type="button"
              onClick={() => void runSimulation()}
              disabled={disabled || simulating}
              className="w-full sm:w-auto rounded-xl bg-primary text-white text-xs font-semibold px-4"
            >
              {simulating ? 'İşleniyor...' : `${formatPlacementPriceTry(totalCents)} Öde`}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Paket Seçildi
            </span>
          )}
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-foreground">
          İlan Yayın ve Öne Çıkarma Paketleri
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-muted-foreground">
          {categoryFreeAvailable
            ? 'Standart yayın bu kategoride ücretsizdir. İsteğe bağlı olarak Vitrin veya Acil doping ekleyebilirsiniz.'
            : 'Standart yayın hakkı ve isteğe bağlı doping seçenekleri.'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          disabled={disabled}
          onClick={selectStandard}
          className={cn(
            'relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-150 cursor-pointer',
            isStandard
              ? 'border-primary bg-primary/[0.06] shadow-sm'
              : 'border-slate-200/90 bg-white hover:border-primary/40 dark:border-border dark:bg-card',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-foreground">
              {STANDARD_PUBLISH_CONFIG.name}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                isStandard
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
              )}
            >
              {isStandard ? 'Seçili' : 'Standart'}
            </span>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-border/60 flex items-baseline justify-between">
            <p className="font-display text-lg font-bold text-slate-900 dark:text-foreground">
              {requiresStandardFee
                ? formatPlacementPriceTry(STANDARD_REPUBLISH_CONFIG.priceCents)
                : 'Ücretsiz'}
            </p>
            <span className="text-[10px] font-medium text-slate-500">
              {STANDARD_PUBLISH_CONFIG.durationDays} gün yayın
            </span>
          </div>
        </button>

        {PLACEMENT_PACKAGE_SLUGS.map((slug) => {
          const pkg = PLACEMENT_PACKAGE_CONFIG[slug];
          const selected = value.placements.includes(slug);
          const Icon = slug === 'vitrin' ? Sparkles : Zap;
          return (
            <button
              key={slug}
              type="button"
              disabled={disabled}
              onClick={() => selectPlacement(slug)}
              className={cn(
                'relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-150 cursor-pointer',
                selected
                  ? 'border-primary bg-primary/[0.06] shadow-sm'
                  : 'border-slate-200/90 bg-white hover:border-primary/40 dark:border-border dark:bg-card',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg',
                      selected
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                    {pkg.name}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-bold',
                    selected
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-300 dark:border-slate-600',
                  )}
                >
                  {selected ? '✓' : ''}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-border/60 flex items-baseline justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-foreground">
                  +{formatPlacementPriceTry(pkg.priceCents)}
                </p>
                <span className="text-[10px] font-medium text-slate-500">
                  {pkg.durationDays} gün doping
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {needsPayment ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-foreground">
              Toplam Tutar:{' '}
              <span className="text-primary text-sm font-extrabold">
                {formatPlacementPriceTry(totalCents)}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-muted-foreground">
              {value.placements.map((s) => PLACEMENT_PACKAGE_CONFIG[s].name).join(' + ') ||
                'Standart Yayın'}
            </p>
          </div>
          {status !== 'ready' && livePayments ? (
            <Button
              type="button"
              onClick={() => void runSimulation()}
              disabled={disabled || simulating}
              className="w-full sm:w-auto rounded-xl bg-primary text-white text-xs font-semibold px-4"
            >
              {simulating ? 'İşleniyor…' : 'Öde'}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Seçim Tamamlandı
            </span>
          )}
        </div>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

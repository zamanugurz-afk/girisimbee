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
        ? `${publishConfig.durationDays} gün`
        : 'İlan başına';

    return (
      <div className="space-y-5">
        {!livePayments ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-gc-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            Test aşaması: paket ödemeleri otomatik onaylanır. Canlı ödeme için{' '}
            <code className="text-[10px]">NEXT_PUBLIC_PREMIUM_LIVE_PAYMENTS=true</code>.
          </p>
        ) : null}
        <p className="text-gc-sm text-muted-foreground">
          {variant === 'franchise'
            ? 'Franchise ilanı yayınlamak için 1.000 TL paket ücreti zorunludur. Süre 30 gündür; bitince yeniden ödeme gerekir. Vitrin ve Acil dopingleri ayrıca alınabilir.'
            : null}
          {variant === 'dijital_ai'
            ? 'Dijital & AI ilanı yayınlamak için 1.000 TL paket ücreti zorunludur. Süre 30 gündür; bitince yeniden ödeme gerekir. Vitrin ve Acil dopingleri ayrıca alınabilir.'
            : null}
          {variant === 'job'
            ? 'İş ilanı vermek ilan başına 250 TL’dir. Vitrin ve Acil dopingleri ayrıca alınabilir.'
            : null}
        </p>

        <div
          className={cn(
            'relative flex flex-col rounded-2xl border-2 p-5 text-left sm:max-w-md',
            'border-primary bg-gradient-to-b from-primary/[0.12] to-primary/[0.04] shadow-md shadow-primary/15',
          )}
        >
          <div className="mb-4 flex items-start gap-2.5">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="h-4 w-4" />
            </span>
            <div>
              <p className="text-gc-xs font-semibold uppercase tracking-wide text-primary">
                {durationLabel}
              </p>
              <h3 className="mt-1 font-display text-gc-lg font-semibold text-foreground">
                {publishConfig.name}
              </h3>
            </div>
          </div>
          <p className="mb-4 font-display text-2xl font-semibold text-foreground">
            {formatPlacementPriceTry(publishConfig.priceCents)}
          </p>
          <ul className="space-y-2">
            {publishConfig.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2 text-gc-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
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
                  'rounded-2xl border-2 p-4 text-left transition',
                  selected
                    ? 'border-primary bg-primary/[0.06]'
                    : 'border-border/70 bg-card hover:border-primary/40',
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{pkg.name}</span>
                </div>
                <p className="font-display text-xl font-semibold">
                  {formatPlacementPriceTry(pkg.priceCents)}
                </p>
                <p className="mt-1 text-gc-xs text-muted-foreground">
                  {pkg.durationDays} gün doping
                </p>
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            'rounded-xl border px-4 py-3 sm:px-5 sm:py-4',
            paid
              ? 'border-primary/30 bg-primary/[0.06]'
              : status === 'pending'
                ? 'border-primary/20 bg-primary/[0.04]'
                : 'border-border/70 bg-muted/30',
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-gc-sm font-semibold text-foreground">{statusLabel}</p>
              <p className="mt-0.5 text-gc-xs text-muted-foreground">
                Toplam: {formatPlacementPriceTry(totalCents)}
                {livePayments
                  ? ' — canlı ödeme'
                  : ' — test modu: ödeme otomatik onaylandı (PSP bağlanınca gerçek checkout açılır)'}
              </p>
            </div>
            {!paid && livePayments ? (
              <Button
                type="button"
                onClick={() => void runSimulation()}
                disabled={disabled || simulating}
                className="shrink-0"
              >
                {simulating || status === 'pending' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ödeme işleniyor…
                  </>
                ) : (
                  `${formatPlacementPriceTry(totalCents)} Öde`
                )}
              </Button>
            ) : null}
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!livePayments ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-gc-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          Test aşaması: paket ödemeleri otomatik onaylanır. Şirket kurulup ödeme sistemi
          bağlandığında <code className="text-[10px]">NEXT_PUBLIC_PREMIUM_LIVE_PAYMENTS=true</code>{' '}
          ile canlı checkout açılır.
        </p>
      ) : null}
      <p className="text-gc-sm text-muted-foreground">
        {categoryFreeAvailable
          ? `Standart yayın bu kategoride ücretsizdir (30 gün). Kategori başına yalnızca 1 ücretsiz ilan. Süre bitince yenileme ${formatPlacementPriceTry(STANDARD_REPUBLISH_CONFIG.priceCents)}. İsterseniz Vitrin veya Acil doping ekleyebilirsiniz.`
          : `Bu kategoride ücretsiz hakkınızı kullandınız. Standart ek ilan / yenileme ${formatPlacementPriceTry(STANDARD_REPUBLISH_CONFIG.priceCents)} · 30 gün. Vitrin ve Acil dopingleri ayrıca alınabilir.`}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          disabled={disabled}
          onClick={selectStandard}
          className={cn(
            'rounded-2xl border-2 p-4 text-left transition',
            isStandard
              ? 'border-primary bg-primary/[0.06]'
              : 'border-border/70 bg-card hover:border-primary/40',
          )}
        >
          <p className="font-semibold">{STANDARD_PUBLISH_CONFIG.name}</p>
          <p className="mt-2 font-display text-xl font-semibold">
            {requiresStandardFee
              ? formatPlacementPriceTry(STANDARD_REPUBLISH_CONFIG.priceCents)
              : 'Ücretsiz'}
          </p>
          <p className="mt-1 text-gc-xs text-muted-foreground">
            {STANDARD_PUBLISH_CONFIG.durationDays} gün
            {requiresStandardFee ? ' · ek ilan' : ' · 1. ücretsiz hak'}
          </p>
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
                'rounded-2xl border-2 p-4 text-left transition',
                selected
                  ? 'border-primary bg-primary/[0.06]'
                  : 'border-border/70 bg-card hover:border-primary/40',
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{pkg.name}</span>
              </div>
              <p className="font-display text-xl font-semibold">
                {formatPlacementPriceTry(pkg.priceCents)}
              </p>
              <p className="mt-1 text-gc-xs text-muted-foreground">{pkg.durationDays} gün doping</p>
            </button>
          );
        })}
      </div>

      {needsPayment ? (
        <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-gc-sm font-semibold text-foreground">{statusLabel}</p>
              <p className="mt-0.5 text-gc-xs text-muted-foreground">
                Toplam: {formatPlacementPriceTry(totalCents)}
                {livePayments
                  ? ' — canlı ödeme'
                  : ' — test modu: ödeme otomatik onaylandı'}
              </p>
            </div>
            {status !== 'ready' && livePayments ? (
              <Button
                type="button"
                onClick={() => void runSimulation()}
                disabled={disabled || simulating}
              >
                {simulating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İşleniyor…
                  </>
                ) : (
                  'Öde'
                )}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

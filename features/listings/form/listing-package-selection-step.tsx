'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PLACEMENT_PACKAGE_CONFIG,
  PLACEMENT_PACKAGE_SLUGS,
  STANDARD_PUBLISH_CONFIG,
  formatPlacementPriceTry,
  type PlacementPackageSlug,
} from '@/features/monetization/types/listing-placement.types';
import {
  PLACEMENT_SIMULATION_STATUS_LABELS,
  simulatePlacementPayment,
  type PlacementPaymentSimulationStatus,
} from '@/features/monetization/lib/simulate-placement-payment';

export interface ListingPackageSelectionValue {
  /** Paid add-ons; empty = Standart Yayın only */
  placements: PlacementPackageSlug[];
  simulationStatus: PlacementPaymentSimulationStatus;
}

export const DEFAULT_PACKAGE_SELECTION: ListingPackageSelectionValue = {
  placements: [],
  simulationStatus: 'ready',
};

interface ListingPackageSelectionStepProps {
  value: ListingPackageSelectionValue;
  onChange: (next: ListingPackageSelectionValue) => void;
  disabled?: boolean;
  error?: string;
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
}: ListingPackageSelectionStepProps) {
  const [simulating, setSimulating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const isStandard = value.placements.length === 0;
  const totalCents = useMemo(
    () =>
      value.placements.reduce(
        (sum, slug) => sum + PLACEMENT_PACKAGE_CONFIG[slug].priceCents,
        0,
      ),
    [value.placements],
  );
  const needsPayment = totalCents > 0;
  const status = value.simulationStatus;
  const statusLabel = PLACEMENT_SIMULATION_STATUS_LABELS[status];

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function selectStandard() {
    abortRef.current?.abort();
    setSimulating(false);
    onChange({ placements: [], simulationStatus: 'ready' });
  }

  function selectPlacement(slug: PlacementPackageSlug) {
    abortRef.current?.abort();
    setSimulating(false);
    const nextPlacements = togglePlacement(value.placements, slug);
    onChange({
      placements: nextPlacements,
      simulationStatus: nextPlacements.length === 0 ? 'ready' : 'selected',
    });
  }

  async function runSimulation() {
    if (!needsPayment || disabled || simulating) return;

    const placementsSnapshot = value.placements;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSimulating(true);
    onChange({ placements: placementsSnapshot, simulationStatus: 'selected' });

    try {
      await simulatePlacementPayment({
        signal: controller.signal,
        onStatus: (nextStatus) => {
          onChange({ placements: placementsSnapshot, simulationStatus: nextStatus });
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      onChange({ placements: placementsSnapshot, simulationStatus: 'selected' });
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-gc-sm text-muted-foreground">
        İlanınız her durumda yayınlanır. İsterseniz ana sayfa görünürlüğü için Vitrin ve Acil Vitrin
        paketlerini birlikte seçebilirsiniz.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Standart */}
        <button
          type="button"
          disabled={disabled || simulating}
          onClick={selectStandard}
          className={cn(
            'relative flex h-full flex-col rounded-2xl border-2 p-5 text-left transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
            isStandard
              ? 'border-primary bg-primary/[0.06] shadow-sm shadow-primary/10'
              : 'border-border/70 bg-background hover:border-primary/35 hover:bg-primary/[0.03]',
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-gc-xs font-semibold uppercase tracking-wide text-primary">
                Temel
              </p>
              <h3 className="mt-1 font-display text-gc-lg font-semibold text-foreground">
                {STANDARD_PUBLISH_CONFIG.name}
              </h3>
            </div>
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                isStandard
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background',
              )}
            >
              {isStandard && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
            </span>
          </div>
          <p className="mb-4 font-display text-2xl font-semibold text-foreground">Ücretsiz</p>
          <ul className="mt-auto space-y-2">
            {STANDARD_PUBLISH_CONFIG.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2 text-gc-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </button>

        {/* Paid packages */}
        {PLACEMENT_PACKAGE_SLUGS.map((slug) => {
          const pkg = PLACEMENT_PACKAGE_CONFIG[slug];
          const selected = value.placements.includes(slug);
          const Icon = slug === 'vitrin' ? Sparkles : Zap;

          return (
            <button
              key={slug}
              type="button"
              disabled={disabled || simulating}
              onClick={() => selectPlacement(slug)}
              className={cn(
                'relative flex h-full flex-col rounded-2xl border-2 p-5 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                selected
                  ? 'border-primary bg-gradient-to-b from-primary/[0.12] to-primary/[0.04] shadow-md shadow-primary/15'
                  : 'border-border/70 bg-background hover:border-primary/35 hover:bg-primary/[0.03]',
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-gc-xs font-semibold uppercase tracking-wide text-primary">
                      {pkg.durationDays} gün
                    </p>
                    <h3 className="mt-1 font-display text-gc-lg font-semibold text-foreground">
                      {pkg.name}
                    </h3>
                  </div>
                </div>
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background',
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                </span>
              </div>
              <p className="mb-4 font-display text-2xl font-semibold text-foreground">
                {formatPlacementPriceTry(pkg.priceCents)}
              </p>
              <ul className="mt-auto space-y-2">
                {pkg.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2 text-gc-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          'rounded-xl border px-4 py-3 sm:px-5 sm:py-4',
          status === 'ready'
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
              {needsPayment
                ? `Seçili paket tutarı: ${formatPlacementPriceTry(totalCents)} (simülasyon — gerçek ödeme alınmaz)`
                : 'Standart yayın seçildi. Ek ödeme gerekmez.'}
            </p>
          </div>

          {needsPayment && status !== 'ready' && (
            <Button
              type="button"
              onClick={() => void runSimulation()}
              disabled={disabled || simulating}
              className="shrink-0"
            >
              {simulating || status === 'pending' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ödeme simüle ediliyor…
                </>
              ) : (
                'Ödemeyi Simüle Et'
              )}
            </Button>
          )}

          {status === 'ready' && (
            <p className="inline-flex items-center gap-1.5 text-gc-sm font-medium text-primary">
              <Check className="h-4 w-4" />
              Devam edebilirsiniz
            </p>
          )}
        </div>

        {needsPayment && (
          <ol className="mt-3 flex flex-wrap gap-2 text-gc-xs">
            {(
              [
                ['selected', 'Paket seçildi'],
                ['pending', 'Ödeme bekleniyor'],
                ['ready', 'Yayınlanmaya hazır'],
              ] as const
            ).map(([key, label]) => {
              const order = { idle: 0, selected: 1, pending: 2, ready: 3 } as const;
              const current = order[status] ?? 0;
              const step = order[key];
              const done = current > step || (status === 'ready' && key === 'ready');
              const active = status === key;
              return (
                <li
                  key={key}
                  className={cn(
                    'rounded-full border px-2.5 py-1',
                    done || active
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground',
                  )}
                >
                  {label}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {error && (
        <p role="alert" className="text-gc-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

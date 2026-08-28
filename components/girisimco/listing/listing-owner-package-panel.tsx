'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CreditCard, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getClientContainer } from '@/lib/persistence/container';
import { ids, type ListingId } from '@/lib/domain/ids';
import {
  PLACEMENT_PACKAGE_CONFIG,
  PLACEMENT_PACKAGE_SLUGS,
  formatPlacementPriceTry,
  type PlacementPackageSlug,
} from '@/features/monetization/types/listing-placement.types';
import { simulatePlacementPayment } from '@/features/monetization/lib/simulate-placement-payment';
import {
  HOMEPAGE_PLACEMENT_FIELD,
  buildHomepagePlacementMeta,
  readHomepagePlacementMeta,
} from '@/features/monetization/lib/homepage-placement-meta';
import {
  createPendingPackagePayment,
  updatePendingPackagePayment,
} from '@/features/monetization/lib/pending-package-payments';
import {
  notifyPackageActivated,
  notifyPackagePaymentPending,
  notifyPackagePaymentSucceeded,
} from '@/features/monetization/lib/package-payment-notifications';
import { useAuth } from '@/features/authentication/hooks/use-auth';

type CheckoutPhase =
  | 'select'
  | 'card'
  | 'processing'
  | 'success';

const CHECKOUT_STEPS: { id: CheckoutPhase; label: string }[] = [
  { id: 'select', label: 'Paket seçimi' },
  { id: 'card', label: 'Kart bilgileri' },
  { id: 'processing', label: 'Ödeme bekleniyor' },
  { id: 'success', label: 'Ödeme başarılı' },
];

interface ListingOwnerPackagePanelProps {
  listingId: string;
  className?: string;
}

function togglePlacement(
  current: PlacementPackageSlug[],
  slug: PlacementPackageSlug,
): PlacementPackageSlug[] {
  return current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];
}

function addDaysIso(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export function ListingOwnerPackagePanel({ listingId, className }: ListingOwnerPackagePanelProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<CheckoutPhase>('select');
  const [placements, setPlacements] = useState<PlacementPackageSlug[]>([]);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const totalCents = useMemo(
    () => placements.reduce((sum, slug) => sum + PLACEMENT_PACKAGE_CONFIG[slug].priceCents, 0),
    [placements],
  );

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function resetFlow() {
    abortRef.current?.abort();
    setPhase('select');
    setPlacements([]);
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setBusy(false);
  }

  function goToCard() {
    if (placements.length === 0) {
      toast.error('Lütfen Süper İlan paketini seçin.');
      return;
    }
    setPhase('card');
  }

  async function runSimulatedCheckout() {
    if (placements.length === 0) return;
    if (!cardName.trim() || cardNumber.replace(/\s/g, '').length < 12 || cardExpiry.length < 4 || cardCvv.length < 3) {
      toast.error('Simülasyon için kart alanlarını doldurun (gerçek çekim yapılmaz).');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setPhase('processing');

    try {
      if (!user?.id) {
        toast.error('Ödeme için giriş yapmalısınız.');
        setPhase('card');
        return;
      }

      const pendingPayment = createPendingPackagePayment({
        userId: user.id,
        listingId,
        packages: placements,
      });
      updatePendingPackagePayment(pendingPayment.id, 'processing');
      try {
        await notifyPackagePaymentPending(user.id, pendingPayment);
      } catch (notifyErr) {
        console.warn('[ListingOwnerPackagePanel] pending notification failed', notifyErr);
      }

      await simulatePlacementPayment({ signal: controller.signal });

      const { listingRepository } = getClientContainer();
      const listingIdBranded = ids.listing(listingId) as ListingId;
      const existing = await listingRepository.findById(listingIdBranded);
      if (!existing) throw new Error('İlan bulunamadı.');

      let vitrinUntil: string | null = existing.featuredUntil;
      let acilUntil: string | null = existing.urgentUntil;
      const patch: {
        isFeatured?: boolean;
        featuredUntil?: string | null;
        isUrgent?: boolean;
        urgentUntil?: string | null;
        customFields: Record<string, unknown>;
      } = {
        customFields: { ...existing.customFields },
      };

      for (const slug of placements) {
        const pkg = PLACEMENT_PACKAGE_CONFIG[slug];
        const until = addDaysIso(pkg.durationDays);
        if (pkg.featuredListing) {
          patch.isFeatured = true;
          patch.featuredUntil = until;
          vitrinUntil = until;
        }
        if (pkg.urgentListing) {
          patch.isUrgent = true;
          patch.urgentUntil = until;
          acilUntil = until;
        }
      }

      const priorMeta = readHomepagePlacementMeta(existing.customFields);
      patch.customFields[HOMEPAGE_PLACEMENT_FIELD] = buildHomepagePlacementMeta(
        placements,
        vitrinUntil,
        acilUntil,
        priorMeta,
      );

      await listingRepository.update(listingIdBranded, patch);

      const succeeded = updatePendingPackagePayment(pendingPayment.id, 'succeeded') ?? {
        ...pendingPayment,
        status: 'succeeded' as const,
        listingTitle: existing.title,
      };
      try {
        await notifyPackagePaymentSucceeded(user.id, succeeded);
        await notifyPackageActivated(user.id, succeeded);
      } catch (notifyErr) {
        console.warn('[ListingOwnerPackagePanel] success notification failed', notifyErr);
      }

      setPhase('success');
      toast.success('Ödeme simülasyonu tamamlandı. İlanınız ilgili vitrin bölümünde görünecek.');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[ListingOwnerPackagePanel] checkout failed', err);
      toast.error('Paket uygulanamadı. Lütfen tekrar deneyin.');
      setPhase('card');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className={cn('rounded-2xl border border-primary/25 bg-primary/[0.06] p-4', className)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-gc-xs font-semibold uppercase tracking-wide text-primary">
              İlan sahibi
            </p>
            <p className="mt-1 text-gc-sm font-medium text-foreground">
              İlanınızı Süper İlan yapın
            </p>
            <p className="mt-0.5 text-gc-xs text-muted-foreground">
              Süper İlan paketi ile aramalarda ve Keşfet'te en üst sırada görünün.
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)} className="shrink-0">
            Süper İlan Yap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-primary/30 bg-background p-4 shadow-sm sm:p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-gc-xs font-semibold uppercase tracking-wide text-primary">Paket satın al</p>
          <h3 className="mt-1 font-display text-gc-lg font-semibold text-foreground">
            Süper İlan Paketi
          </h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => {
            resetFlow();
            setOpen(false);
          }}
        >
          Kapat
        </Button>
      </div>

      {/* Checkout steps */}
      <ol className="mb-5 flex flex-wrap gap-2">
        {CHECKOUT_STEPS.map((step, index) => {
          const order = { select: 0, card: 1, processing: 2, success: 3 } as const;
          const current = order[phase];
          const stepOrder = order[step.id];
          const done = current > stepOrder || phase === 'success';
          const active = phase === step.id;
          return (
            <li
              key={step.id}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-gc-xs',
                done || active
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/70 text-muted-foreground',
              )}
            >
              <span className="font-semibold">{index + 1}.</span>
              {step.label}
            </li>
          );
        })}
      </ol>

      {phase === 'select' && (
        <div className="space-y-4">
          <p className="text-gc-sm text-muted-foreground">
            Süper İlan paketi ile ilanınızı en üst sıraya taşıyın. Standart yayın zaten aktif.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PLACEMENT_PACKAGE_SLUGS.map((slug) => {
              const pkg = PLACEMENT_PACKAGE_CONFIG[slug];
              const selected = placements.includes(slug);
              const Icon = slug === 'vitrin' ? Sparkles : Zap;
              return (
                <button
                  key={slug}
                  type="button"
                  disabled={busy}
                  onClick={() => setPlacements((prev) => togglePlacement(prev, slug))}
                  className={cn(
                    'flex flex-col rounded-xl border-2 p-4 text-left transition-all',
                    selected
                      ? 'border-primary bg-primary/[0.08]'
                      : 'border-border/70 hover:border-primary/40',
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-md border-2',
                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                      )}
                    >
                      {selected && <Check className="h-3 w-3" strokeWidth={2.5} />}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">{pkg.name}</p>
                  <p className="mt-1 text-gc-lg font-semibold text-foreground">
                    {formatPlacementPriceTry(pkg.priceCents)}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {pkg.benefits.map((b) => (
                      <li key={b} className="text-gc-xs text-muted-foreground">
                        • {b}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-gc-sm text-muted-foreground">
              Toplam: <span className="font-semibold text-foreground">{formatPlacementPriceTry(totalCents)}</span>
            </p>
            <Button type="button" onClick={goToCard} disabled={placements.length === 0}>
              Kart bilgilerine geç
            </Button>
          </div>
        </div>
      )}

      {phase === 'card' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] px-3 py-2 text-gc-xs text-muted-foreground">
            <CreditCard className="h-4 w-4 shrink-0 text-primary" />
            Simülasyon — kartınızdan gerçek tahsilat yapılmaz. İleride İyzico / PayTR / Stripe bağlanacak.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="sim-card-name">Kart üzerindeki isim</Label>
              <Input
                id="sim-card-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Ad Soyad"
                disabled={busy}
                autoComplete="cc-name"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="sim-card-number">Kart numarası</Label>
              <Input
                id="sim-card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="XXXX XXXX XXXX XXXX"
                disabled={busy}
                inputMode="numeric"
                autoComplete="cc-number"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-card-expiry">Son kullanma (AA/YY)</Label>
              <Input
                id="sim-card-expiry"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="12/28"
                disabled={busy}
                autoComplete="cc-exp"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-card-cvv">CVV</Label>
              <Input
                id="sim-card-cvv"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                placeholder="000"
                disabled={busy}
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" disabled={busy} onClick={() => setPhase('select')}>
              Paketlere dön
            </Button>
            <Button type="button" disabled={busy} onClick={() => void runSimulatedCheckout()}>
              {formatPlacementPriceTry(totalCents)} öde (simüle)
            </Button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="font-semibold text-foreground">Ödeme bekleniyor…</p>
            <p className="mt-1 text-gc-sm text-muted-foreground">
              Banka / sanal POS onayı simüle ediliyor.
            </p>
          </div>
          <p className="text-gc-xs text-muted-foreground">
            Paket seçildi → Kart doğrulandı → Ödeme işleniyor
          </p>
        </div>
      )}

      {phase === 'success' && (
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.06] px-4 py-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <p className="font-semibold text-foreground">Ödeme başarılı</p>
            <p className="text-gc-sm text-muted-foreground">
              {placements.map((s) => PLACEMENT_PACKAGE_CONFIG[s].name).join(' + ')} aktif.
              Ana sayfa vitrin bölümlerinde görünür olacaktır.
            </p>
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              resetFlow();
              setOpen(false);
            }}
          >
            Tamam
          </Button>
        </div>
      )}
    </div>
  );
}

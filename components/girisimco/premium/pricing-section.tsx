'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: '0',
    period: '/ ay',
    features: ['3 ilan', '5 mesaj / ay', 'Temel eşleşme'],
    cta: 'Mevcut plan',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '299',
    period: '/ ay',
    features: ['Sınırsız ilan', 'Sınırsız mesaj', 'Öncelikli listeleme', 'Doğrulanmış rozet'],
    cta: 'Pro\'ya Geç',
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '799',
    period: '/ ay',
    features: ['Tüm Pro özellikleri', 'Ekip hesabı', 'API erişimi', 'Öncelikli destek'],
    cta: 'Business\'a Geç',
    highlighted: false,
  },
] as const;

/** Full pricing section — only mounted via PremiumGate. Not visible during MVP. */
export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border/80 py-16 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Paketler
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            İhtiyacınıza uygun planı seçin. İstediğiniz zaman iptal edin.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'flex flex-col rounded-2xl border p-6',
                plan.highlighted
                  ? 'border-primary bg-primary text-primary-foreground shadow-glow'
                  : 'border-border/80 bg-white dark:border-white/10 dark:bg-card/90',
              )}
            >
              <p className="text-sm font-semibold">{plan.name}</p>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">{plan.price} TL</span>
                <span className={cn('text-xs', plan.highlighted ? 'opacity-70' : 'text-muted-foreground')}>
                  {plan.period}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={cn(
                  'mt-6 w-full rounded-lg',
                  plan.highlighted
                    ? 'bg-white text-foreground hover:bg-white/90 dark:bg-background dark:text-white'
                    : 'bg-primary text-white dark:bg-white dark:text-primary-foreground',
                )}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

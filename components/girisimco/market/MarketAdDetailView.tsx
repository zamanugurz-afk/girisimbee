'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Store } from 'lucide-react';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import type { MarketItem } from '@/features/admin/market/types/market.types';
import { cn } from '@/lib/utils';

/** Placeholder body until real ad long-form content is wired from admin. */
function placeholderAdBody(title: string): string {
  return [
    `${title} kapsamında ekip; ürün, satış ve operasyon tarafında hızlanmak için doğru ortaklıkları arıyor.`,
    'Mevcut traction ile birlikte net bir büyüme planı var: hedef pazar genişletme, satış sürecini standartlaştırma ve ürün yol haritasını hızlandırma.',
    'İlgilenen yatırımcı veya iş ortaklarından beklenenler arasında sektör tecrübesi, network desteği ve uzun vadeli iş birliği yaklaşımı yer alıyor.',
    'Görüşmelerde ekibin mevcut metrikleri, kısa vadeli hedefleri ve olası iş birliği modeli şeffaf biçimde paylaşılacaktır.',
  ].join('\n\n');
}

export function MarketAdDetailView({ item }: { item: MarketItem }) {
  const detailBody = placeholderAdBody(item.title);
  const opportunityUrl = item.linkUrl?.trim() || null;
  const external = opportunityUrl ? /^https?:\/\//i.test(opportunityUrl) : false;

  const buttonClassName = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5',
    'text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90',
  );

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-muted/30 via-background to-background pt-14 dark:from-background dark:via-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.07] via-transparent to-transparent" />

      <div className="relative mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-10">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          MARKET’e dön
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md dark:border-white/10">
          <div className="relative w-full bg-muted">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={1400}
                height={788}
                className="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[21/9]"
                unoptimized
                priority
              />
            ) : (
              <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 text-muted-foreground sm:aspect-[2/1] lg:aspect-[21/9]">
                <Store className="h-12 w-12 opacity-40" aria-hidden />
                <p className="text-sm">Görsel eklenmemiş</p>
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur-sm">
              Reklam
            </span>
          </div>

          <div className="space-y-5 p-5 sm:p-7 lg:p-8">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Store className="h-3.5 w-3.5" aria-hidden />
              <><BrandWordmark /> MARKET</>
            </p>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {item.title}
            </h1>

            {item.description ? (
              <p className="text-[15px] leading-relaxed text-muted-foreground">{item.description}</p>
            ) : null}

            <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              {detailBody.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>

            <div className="border-t border-border/60 pt-6 dark:border-white/10">
              {opportunityUrl ? (
                external ? (
                  <a
                    href={opportunityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClassName}
                  >
                    Fırsatı yakala
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                ) : (
                  <Link href={opportunityUrl} className={buttonClassName}>
                    Fırsatı yakala
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </Link>
                )
              ) : (
                <button type="button" disabled className={cn(buttonClassName, 'opacity-50')}>
                  Fırsatı yakala
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

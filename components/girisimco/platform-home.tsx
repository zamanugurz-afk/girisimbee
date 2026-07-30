'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, MessageCircle, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingFeed } from '@/components/girisimco/marketplace/listing-feed';
import { MarketplaceSearchBar } from '@/components/girisimco/marketplace/marketplace-search-bar';
import { ListingFeedSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import { useMarketplaceBrowse } from '@/features/listings/hooks/use-marketplace-browse';
import {
  HOME_CATEGORIES,
  HOME_STEPS,
  HOME_TRUST_SIGNALS,
  type HomeCategorySlug,
} from '@/components/girisimco/home/home-marketplace.data';
import { MVP_COPY } from '@/features/shared';
import { cn } from '@/lib/utils';

function ListingsSectionHeader({
  category,
  total,
  href,
}: {
  category: HomeCategorySlug | null;
  total: number;
  href?: string;
}) {
  const active = HOME_CATEGORIES.find((c) => c.slug === category);
  const title = category && active ? `${active.label} ilanları` : 'Güncel ilanlar';

  return (
    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="gc-section-title">{title}</h2>
        {!category && (
          <p className="mt-1 text-gc-sm text-muted-foreground">
            Platformdaki son yayınlanan fırsatlar
          </p>
        )}
        {category && active && (
          <p className="mt-1 text-gc-sm text-muted-foreground">{active.hint}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {total > 0 && (
          <span className="text-gc-xs text-muted-foreground">
            {total.toLocaleString('tr-TR')} ilan
          </span>
        )}
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-gc-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Tümünü gör
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function PlatformHome() {
  const [category, setCategory] = useState<HomeCategorySlug | null>(null);
  const { items, total, isLoading, updateFilters } = useMarketplaceBrowse({ deferInitialLoad: true });

  const activeCategory = HOME_CATEGORIES.find((c) => c.slug === category);
  const activeColor = activeCategory?.color;

  function selectCategory(slug: HomeCategorySlug | null) {
    setCategory(slug);
    updateFilters({ categorySlug: slug ?? undefined });
  }

  const listingsHref =
    items.length > 0 ? (category ? `/kategori/${category}` : '/kesfet') : undefined;

  return (
    <div className="gc-header-offset">
      {/* ── Hero: what, who, trust, primary action ── */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-25" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-8 lg:pb-16 lg:pt-14">
          <div className="grid gap-10 lg:grid-cols-[1fr,minmax(280px,360px)] lg:items-center lg:gap-16">
            <ScrollReveal immediate>
              <p className="mb-4 text-gc-sm font-medium text-primary">
                Girişim · Yatırım · Kariyer · Ortaklık
              </p>
              <h1 className="max-w-xl font-display text-gc-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[2.25rem]">
                Doğru kişiyle, doğru fırsatta buluşun.
              </h1>
              <p className="mt-4 max-w-lg text-gc-md leading-relaxed text-muted-foreground">
                Girisimco; girişimciler, yatırımcılar, iş arayanlar ve işverenlerin
                ilan paylaştığı, birbirini keşfettiği Türkiye&apos;nin buluşma platformudur.
              </p>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Platform güvencesi">
                {HOME_TRUST_SIGNALS.map((signal, i) => (
                  <li key={signal.label} className="flex items-center gap-1.5 text-gc-sm text-muted-foreground">
                    {i === 0 && <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />}
                    {i === 1 && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />}
                    {i === 2 && <MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />}
                    {signal.label}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/kesfet">
                    <Search className="mr-2 h-4 w-4" aria-hidden />
                    Fırsatları Keşfet
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/ilan/olustur">{MVP_COPY.postCta}</Link>
                </Button>
              </div>
              <p className="mt-4 text-gc-sm text-muted-foreground">
                Henüz hesabınız yok mu?{' '}
                <Link href="/kayit" className="font-medium text-primary hover:text-primary/80">
                  {MVP_COPY.joinCta}
                </Link>
              </p>
            </ScrollReveal>

            <ScrollReveal immediate className="hidden lg:block">
              <div className="gc-card p-5 shadow-card">
                <p className="mb-3 text-gc-sm font-medium text-foreground">Hızlı arama</p>
                <MarketplaceSearchBar placeholder="İlan, rol veya şirket ara…" />
                <p className="mt-3 text-gc-xs leading-relaxed text-muted-foreground">
                  {MVP_COPY.communicationNote}
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Mobile search */}
          <div className="mt-8 lg:hidden">
            <MarketplaceSearchBar placeholder="Ne arıyorsunuz?" />
          </div>
        </div>
      </section>

      {/* ── Intent gateway: who it's for ── */}
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
          <ScrollReveal>
            <div className="mb-6 max-w-lg">
              <h2 className="gc-page-heading text-gc-xl sm:text-gc-2xl">Size uygun yolu seçin</h2>
              <p className="mt-2 text-gc-sm text-muted-foreground">
                Beş farklı amaç, tek platform. Bir kategori seçerek ilgili ilanları hemen görün.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {HOME_CATEGORIES.map((cat, index) => {
              const selected = category === cat.slug;
              return (
                <ScrollReveal key={cat.slug} delay={Math.min(index * 20, 80)}>
                  <button
                    type="button"
                    onClick={() => selectCategory(selected ? null : cat.slug)}
                    aria-pressed={selected}
                    className={cn(
                      'group flex h-full w-full flex-col rounded-2xl border p-4 text-left transition-all duration-200 ease-smooth',
                      selected
                        ? 'border-primary/30 bg-card shadow-card ring-1 ring-primary/15'
                        : 'border-border/80 bg-card shadow-soft hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card',
                    )}
                  >
                    <span
                      className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl text-gc-xs font-semibold text-white"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden
                    >
                      {cat.label.slice(0, 1)}
                    </span>
                    <span className="text-gc-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {cat.audience}
                    </span>
                    <span className="mt-0.5 font-display text-gc-base font-semibold text-foreground">
                      {cat.label}
                    </span>
                    <span className="mt-1.5 text-gc-xs leading-relaxed text-muted-foreground">
                      {cat.hint}
                    </span>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>

          {category && (
            <p className="mt-4 text-center text-gc-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => selectCategory(null)}
                className="font-medium text-primary hover:text-primary/80"
              >
                Tüm kategorileri göster
              </button>
            </p>
          )}
        </div>
      </section>

      {/* ── Live listings (proof + exploration) ── */}
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <ScrollReveal as="section">
          <ListingsSectionHeader category={category} total={total} href={listingsHref} />
          {isLoading ? (
            <ListingFeedSkeleton count={4} />
          ) : (
            <ListingFeed items={items.slice(0, 8)} accent={activeColor} />
          )}
          {!isLoading && items.length > 0 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href={category ? `/kategori/${category}` : '/kesfet'}>
                  Daha fazla ilan gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </ScrollReveal>
      </div>

      {/* ── How it works (trust + clarity, no empty placeholders) ── */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <ScrollReveal>
            <div className="mb-10 text-center">
              <h2 className="gc-page-heading text-gc-xl sm:text-gc-2xl">Nasıl çalışır?</h2>
              <p className="mx-auto mt-2 max-w-md text-gc-sm text-muted-foreground">
                Üç adımda başlayın — karmaşık süreç yok.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {HOME_STEPS.map((item, index) => (
              <ScrollReveal key={item.step} delay={Math.min(index * 30, 60)}>
                <div className="gc-card h-full p-6">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-display text-gc-sm font-semibold text-primary">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-gc-md font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gc-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-10 text-center">
            <Button asChild size="lg">
              <Link href="/kesfet">Keşfetmeye Başla</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

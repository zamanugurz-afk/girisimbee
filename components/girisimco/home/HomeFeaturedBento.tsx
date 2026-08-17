'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Flame, Rocket, ShieldCheck, Sparkles, Store, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function HomeFeaturedBento() {
  return (
    <section className="relative w-full bg-transparent py-8 lg:py-12" aria-label="Öne Çıkan Ekosistem Fırsatları">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="mb-6 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Haftanın Fırsatları</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ekosistemin Öne Çıkanları
            </h2>
            <p className="text-sm text-muted-foreground">
              Yatırım, ortaklık, bayilik ve kariyer alanındaki en yeni doğrulanmış ilanlar.
            </p>
          </div>
          <Link
            href="/kesfet"
            className="group inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Tüm İlanları Gör
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Box Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {/* Card 1: Main Spotlight / Vitrin (Spans 2 cols on lg) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 sm:p-7 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80 lg:col-span-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 dark:text-amber-300">
                  <Rocket className="mr-1 h-3 w-3" />
                  Vitrin Girişimi
                </Badge>
                <span className="gc-privacy-pill">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  İletişim Gizli 🔒
                </span>
                <span className="ml-auto text-xs font-medium text-muted-foreground">Tohum Öncesi (Pre-Seed)</span>
              </div>

              <h3 className="mt-4 font-display text-xl font-bold leading-snug text-foreground sm:text-2xl">
                Yapay Zeka Destekli B2B Lojistik ve Rota Optimizasyonu
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                Türkiye genelinde 120+ filonun karbon salınımını ve yakıt maliyetlerini %24 düşüren SaaS çözümü için melek yatırım turu.
              </p>

              {/* Modern Financial Metrics Strip */}
              <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">Hedef Yatırım</span>
                  <p className="font-display text-base font-bold text-foreground">₺2.500.000</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">Hisse / Pay</span>
                  <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">%8 - %12</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">Aşama</span>
                  <p className="font-display text-base font-bold text-foreground">Canlı MVP</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <span className="text-xs text-muted-foreground">İstanbul · 14 İletişim Talebi</span>
              <Link
                href="/kesfet?category=yatirim-bul"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors group-hover:text-primary"
              >
                Girişimi İncele
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Urgent Co-Founder Search */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 dark:text-rose-400">
                  <Flame className="mr-1 h-3 w-3 animate-pulse" />
                  Acil Ortak Arayışı
                </Badge>
              </div>

              <h3 className="mt-3.5 font-display text-base font-bold leading-snug text-foreground">
                FinTech Mobil Uygulaması için CTO / Teknik Ortak
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                Lisans süreci tamamlanmış mikro-tasarruf platformumuz için React Native + Go tecrübeli kurucu ortak arıyoruz.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">React Native</span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Go / Golang</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">%20-30 Hisse</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <span className="text-xs text-muted-foreground">Hibrit / Ankara</span>
              <Link
                href="/partners"
                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground transition-colors group-hover:text-primary"
              >
                Ortaklık Detayı
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Franchise Opportunity */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/15 dark:text-orange-400">
                  <Store className="mr-1 h-3 w-3" />
                  Franchise
                </Badge>
                <span className="text-[11px] font-medium text-muted-foreground">Bayilik Ver</span>
              </div>

              <h3 className="mt-3.5 font-display text-base font-bold leading-snug text-foreground">
                3. Nesil Nitelikli Kahve Zinciri Şubeleşme
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                18 aktif şubesi olan markamız için Marmara ve Ege bölgesinde anahtar teslim bayilik fırsatları.
              </p>

              <div className="mt-4 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Min. Sermaye:</span>
                  <span className="font-semibold text-foreground">₺850.000</span>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Yatırım Dönüşü:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">12-16 Ay</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <span className="text-xs text-muted-foreground">İstanbul / İzmir</span>
              <Link
                href="/franchise/buy"
                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground transition-colors group-hover:text-primary"
              >
                Bayilik Al
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Top Tech Talent / Career Role */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 dark:text-blue-400">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Kariyer Fırsatı
                </Badge>
                <span className="text-xs text-muted-foreground">Seri A Girişim</span>
              </div>

              <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Senior Full-Stack Developer (Next.js & Cloud Architecture)
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Global ölçekte 500.000+ kullanıcıya hizmet veren B2B platformunun çekirdek mimari ekibine katılın.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-block rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Maaş + Hisse Opsiyonu
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <div className="flex gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Tam Zamanlı</span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Uzaktan (Remote)</span>
              </div>
              <Link
                href="/is"
                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground transition-colors group-hover:text-primary"
              >
                Pozisyona Başvur
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
